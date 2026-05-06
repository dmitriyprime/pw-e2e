# Manual Test Report — RSPA-874

**Ticket:** RSPA-874 — Missing PDF for the product
**Branch:** `RSPA-874` (merged into `dev` via commit `2fc85d6a`)
**Fix commit:** `129dfc07` — "RSPA-874. new document type"
**File changed:** `app/Models/Product/PdfHandler.php`

---

## Background

AutoQuote API returns documents for each product, each with a `mediaType` field.
`PdfHandler::isValid()` gatekeeps document saving via a case-insensitive whitelist:

```php
// app/Models/Product/PdfHandler.php:92
if (empty($document['url']) || !in_array(strtolower($document['mediaType']), $this->specialMediaTypes)) {
    return false;
}
```

**Before fix** — accepted types:
```
cutsheet, warrantysheet, brochure, manual, catalogpage
```

**Bug:** AQ returns two distinct warranty document types:
- `warrantysheet` — a warranty *sheet* (was already whitelisted, saved correctly)
- `warranty` — a warranty *document* (was NOT in the list → silently skipped, never saved)

**Fix — added `'warranty'` to the whitelist:**
```php
protected array $specialMediaTypes = [
    'cutsheet',
    'warrantysheet',
    'warranty',     // ← RSPA-874 addition
    'brochure',
    'manual',
    'catalogpage',
    'application',
];
```

> Note: `mediaType` from AQ is **not stored** in the DB — it is consumed transiently in `isValid()`. Only the downloaded PDF file and its metadata are persisted in the `documents` table.

---

## Scope

| # | Scenario |
|---|---|
| TC-01 | `warranty` document is now downloaded and saved for a product that previously had it missing |
| TC-02 | Other whitelisted document types (cutsheet, manual) are still saved correctly (regression) |
| TC-03 | Saved `warranty` document has a generated thumbnail and `status = COMPLETED` |
| TC-04 | A full vendor re-import brings warranty docs to all eligible products |

---

## Pre-conditions

- Docker containers running: `./dev/docker/up.sh`
- App container shell: `docker exec -it -u www-data feda_php bash`
- DB access: `oners_dev`

---

## Test Product

### Empura — product 930631

| Field | Value |
|---|---|
| Product ID | 930631 |
| SKU | `19746_ESM-42B` |
| Vendor | Empura (vendor_id = 1080) |
| AQ external_id | `b9014c3c-efe1-4c04-a2fe-831559816fa6` |

> **Why Empura instead of ACP?** Empura's warranty doc uses a Shopify CDN URL
> (`https://cdn.shopify.com/...`) with `mimeType = application/pdf` returned by AQ in the JSON
> response. This means `isValid()` short-circuits before the `get_headers()` fallback is reached —
> making the test immune to any network or URL-encoding edge cases in that fallback path.

**Setup: delete the document_product link before TC-01** (to simulate pre-fix state):

```sql
DELETE FROM document_product WHERE product_id = 930631 AND document_id = 93408;
```

**Pre-state check after deleting the link:**

```sql
SELECT d.id, d.title, d.name, d.status, d.thumbnail_name, d.created_at
FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 930631
ORDER BY d.created_at;
```

Expected: 2 rows — `cutsheet` + `Owner's Manual`.
The `warranty` doc (`empura-refrigeration-warranty-statement.pdf`) should be absent after the DELETE.

**Reference product 930355 (19746_EGM-50B)** — already has the warranty doc linked:

```sql
SELECT d.id, d.title, d.name, d.status FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 930355 ORDER BY d.created_at;
```

---

## TC-RSPA-874-01 — `warranty` document is saved on re-import

**Objective:** Verify that re-running the document import for product 930631 saves the
`warranty`-type PDF that was previously skipped.

**Pre-condition:** Run the setup DELETE from the "Test Product" section above.

**Record pre-state (after DELETE):**
```sql
SELECT COUNT(*) AS doc_count FROM document_product WHERE product_id = 930631;
-- Expected: 2
```

**Steps:**

1. Connect to the app container:
   ```bash
   docker exec -it -u www-data feda_php bash
   ```
2. Run the per-product document import command:
   ```bash
   php artisan process:product_document --product_id=930631
   ```
3. Watch the console output — it should print `Start` / `Finish` without errors or warnings.

**Expected results:**

```sql
SELECT d.id, d.title, d.name, d.status, d.thumbnail_name, d.created_at
FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 930631
ORDER BY d.created_at;
```

| Check | Expected |
|---|---|
| Row count | **3** (was 2 after the setup DELETE) |
| Restored row `id` | `93408` |
| Restored row `title` | `Warranty` |
| Restored row `name` | `empura-refrigeration-warranty-statement.pdf` |
| Restored row `mimetype` | `application/pdf` |
| Restored row `origin` | `1` (AUTO_QUOTES) |
| `remote_path` | `https://cdn.shopify.com/s/files/1/0557/9545/0023/files/empura-refrigeration-warranty-statement.pdf?v=1717087199` |

**Pass criteria:** The warranty `document_product` link is restored; no errors or warnings in console output.

---

## TC-RSPA-874-02 — Other whitelisted document types are still saved (regression)

**Objective:** Verify that pre-existing `cutsheet` and `manual` type documents still pass
`isValid()` and are not affected by the changes.

**Steps:**

1. Check that product 930631 still has `cutsheet` and `Owner's Manual` docs linked:
   ```sql
   SELECT d.id, d.title, d.name FROM documents d
   JOIN document_product dp ON dp.document_id = d.id
   WHERE dp.product_id = 930631 AND d.title IN ('cutsheet', 'Owner''s Manual');
   ```
2. Run the import again (idempotent — already-saved docs are skipped via `remote_path` uniqueness):
   ```bash
   php artisan process:product_document --product_id=930631
   ```
3. Re-run the SELECT above.

**Expected results:**

| Check | Expected |
|---|---|
| `cutsheet` row | Present before and after re-import |
| `Owner's Manual` row | Present before and after re-import |
| Row count for each | Exactly 1 (no duplicates) |

**Pass criteria:** Existing whitelisted documents unchanged; no duplication; import completes cleanly.

---

## TC-RSPA-874-03 — Saved `warranty` document has a thumbnail

**Objective:** Verify that after import, the `warranty` document has a non-null `thumbnail_name`
and `status = COMPLETED (7)` after thumbnail processing.

> The thumbnail is generated synchronously in `process:product_document`
> (via `ImageProcessor::storeThumbnail()`). For the regular import flow via `UpdateProductManager`,
> thumbnail generation runs as a separate step and document status progresses:
> `NEW(1)` → `THUMBNAIL_COMPLETED(4)` → `COMPLETED(7)`.

**Steps:**

1. After running TC-01, query the warranty document:
   ```sql
   SELECT d.id, d.title, d.status, d.thumbnail_name
   FROM documents d
   JOIN document_product dp ON dp.document_id = d.id
   WHERE dp.product_id = 930631 AND d.title LIKE '%arrant%'
   ORDER BY d.created_at DESC
   LIMIT 3;
   ```

**Expected results:**

| Check | Expected |
|---|---|
| `thumbnail_name` | Non-null, ends in `_thumbnail.png` |
| `status` | `7` (COMPLETED) for `process:product_document` flow |
| FEDA UI — product page | Warranty PDF displayed with thumbnail preview |

**Pass criteria:** `thumbnail_name` populated; `status = 7`; thumbnail visible in FEDA UI.

---

## TC-RSPA-874-04 — Full vendor re-import brings `warranty` docs to all Empura products

**Objective:** Verify that after the full Empura vendor import, all eligible products receive
the `warranty`-type document.

> **Note:** The first post-fix Empura import already ran (doc 93408 was created on
> **2026-04-24**), linking 193 products to `empura-refrigeration-warranty-statement.pdf`.
> Empura has four distinct AQ warranty docs for different product lines:
>
> | Doc ID | File | Linked products |
> |---|---|---|
> | 80704 | empura-stainless-written-warranty-statement.pdf | 268 |
> | 80709 | empura-ice-machines-warranty-statement.pdf | 28 |
> | 80719 | empura-equipment-warranty-statement.pdf | 109 |
> | 93408 | empura-refrigeration-warranty-statement.pdf | 193 |

**Current state — confirm doc 93408 is linked to 193 products:**
```sql
SELECT COUNT(*) AS linked FROM document_product WHERE document_id = 93408;
-- Expected: 193
```

**Steps:**

1. Trigger the Empura vendor product import via the FEDA UI:
   - Navigate to http://feda.loc/ → Vendor list → **Empura** → **Update**
   - Or process the queue:
     ```bash
     php artisan queue:work --queue=auto_quotes
     ```
2. Monitor the `auto_quotes` queue until completion.
3. Re-run the SELECT above and verify the count is the same (idempotent — `remote_path`
   uniqueness prevents duplicate docs from being created).

**Pass criteria:** Import completes cleanly; doc 93408 is still linked to the same number of
products; no duplicates; `status = 7` and `thumbnail_name` populated for all linked docs.

---

## Regression Check

| Scenario | Expected |
|---|---|
| `mediaType = cutsheet` | Still accepted — not affected by change |
| `mediaType = warrantysheet` | Still accepted — not affected |
| `mediaType = brochure` | Still accepted — not affected |
| `mediaType = manual` | Still accepted — not affected |
| `mediaType = warranty` | **Now accepted** — was the bug |
| `mediaType = <unknown_type>` | Still rejected by `isValid()` |
| Document with empty `url` | Still rejected regardless of mediaType |
| Document with non-PDF mime type | Still rejected (mimetype check in `isValid()`) |

---

## Files Changed (Reference)

| File | Line | Description |
|---|---|---|
| `app/Models/Product/PdfHandler.php` | 29 | `'warranty'` added to `$specialMediaTypes` |
| `app/Models/Product/PdfHandler.php` | 92 | Gate condition: `isValid()` — no change, benefits from wider whitelist |
| `app/Models/Product/PdfHandler.php` | 99 | `get_headers()` now uses `getUrlPath()` (space-encoded URL); `foreach` guarded with `is_array()` check |

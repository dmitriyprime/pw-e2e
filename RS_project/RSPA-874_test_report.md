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
| TC-02 | `warrantysheet` document is still saved correctly (regression) |
| TC-03 | Saved `warranty` document has a generated thumbnail and `status = COMPLETED` |
| TC-04 | A full vendor re-import brings warranty docs to all eligible products |

---

## Pre-conditions

- Docker containers running: `./dev/docker/up.sh`
- App container shell: `docker exec -it -u www-data feda_php bash`
- DB access: `oners_dev`

---

## Test Product

### ACP — product 6742

| Field | Value |
|---|---|
| Product ID | 6742 |
| SKU | `1016_RCS10TS` |
| Vendor | ACP (vendor_id = 6) |
| AQ external_id | `0a1b261c-04e2-df11-bfb5-001ec95274b6` |

> **Why 6742 and not 6722 (CL10)?** After investigating, AQ does not return a `warranty`-type
> document for the CL10 product line. Only specific ACP lines (RCS, RMS, JET, MRX, AMSO, AOC)
> include the `warranty` mediaType in their AQ document list. Product 6742 (RCS10TS) is confirmed
> to receive `ACP_WARRANTY_20301702_DOC.pdf` from AQ — evidenced by doc id 84822 being created
> for it on 2025-05-18 via the first post-fix vendor re-import.

**Setup: delete the document_product link before TC-01** (to simulate pre-fix state):

```sql
-- Run this to create a clean before-state for TC-01:
DELETE FROM document_product WHERE product_id = 6742 AND document_id = 84822;
```

**Pre-state check after deleting the link:**

```sql
SELECT d.id, d.title, d.name, d.status, d.thumbnail_name, d.created_at
FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 6742
ORDER BY d.created_at;
```

Expected: 2 rows — `MAP Policy` + `warranty sheet`.  
The `warranty` doc (ACP_WARRANTY_20301702_DOC.pdf) should be absent after the DELETE above.

**Reference product 6727 (1016_AOC24)** — already has both docs after the post-fix vendor re-import:

```sql
SELECT d.id, d.title, d.status, d.thumbnail_name FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 6727 ORDER BY d.created_at;
```

Shows: `warranty sheet` (id 78227) AND `Warranty` (id 84822, `ACP_WARRANTY_20301702_DOC.pdf`).

---

## TC-RSPA-874-01 — `warranty` document is saved on re-import

**Objective:** Verify that re-running the document import for product 6742 saves the
`warranty`-type PDF that was previously skipped.

**Pre-condition:** Run the setup DELETE from the "Test Product" section above to remove the
existing `document_product` link for doc 84822 before this test.

**Record pre-state (after DELETE):**
```sql
SELECT COUNT(*) AS doc_count FROM document_product WHERE product_id = 6742;
-- Expected: 2
```

**Steps:**

1. Connect to the app container:
   ```bash
   docker exec -it -u www-data feda_php bash
   ```
2. Run the per-product document import command:
   ```bash
   php artisan process:product_document --product_id=6742
   ```
3. Watch the console output — it should print `Start` / `Finish` without errors.

**Expected results:**

```sql
SELECT d.id, d.title, d.name, d.status, d.thumbnail_name, d.created_at
FROM documents d
JOIN document_product dp ON dp.document_id = d.id
WHERE dp.product_id = 6742
ORDER BY d.created_at;
```

| Check | Expected |
|---|---|
| Row count | **3** (was 2 after the setup DELETE) |
| Restored row `id` | `84822` |
| Restored row `title` | `Warranty` |
| Restored row `name` | `ACP_WARRANTY_20301702_DOC.pdf` |
| Restored row `mimetype` | `application/pdf` |
| Restored row `origin` | `1` (AUTO_QUOTES) |
| `remote_path` | `http://doclinks.aq-fes.com/ACP/ACP_WARRANTY_20301702_DOC.pdf` |

**Pass criteria:** The warranty `document_product` link is restored; no errors in console output.

---

## TC-RSPA-874-02 — `warrantysheet` document is still saved (regression)

**Objective:** Verify the pre-existing `warrantysheet` type still passes `isValid()` and is not
affected by the changes.

**Steps:**

1. Check that product 6742 still has `warranty sheet` doc linked:
   ```sql
   SELECT d.id, d.title, d.name FROM documents d
   JOIN document_product dp ON dp.document_id = d.id
   WHERE dp.product_id = 6742 AND d.title = 'warranty sheet';
   ```
2. Run the import again (idempotent — already-saved docs are skipped via `remote_path` uniqueness):
   ```bash
   php artisan process:product_document --product_id=6742
   ```
3. Re-run the SELECT above.

**Expected results:**

| Check | Expected |
|---|---|
| `warranty sheet` row | Present before and after re-import |
| Row count for `warranty sheet` | Exactly 1 (no duplicates) |
| Other existing docs (MAP Policy) | Unchanged |

**Pass criteria:** `warrantysheet`-type document unchanged; no duplication; import completes cleanly.

---

## TC-RSPA-874-03 — Saved `warranty` document gets a thumbnail

**Objective:** Verify that after import, the `warranty` document has a non-null `thumbnail_name`
and `status = COMPLETED (7)` after thumbnail processing.

> The thumbnail is generated synchronously in `process:product_document`
> (via `ImageProcessor::storeThumbnail()`). For the regular import flow via `UpdateProductManager`,
> thumbnail generation runs as a separate step and document status progresses:
> `NEW(1)` → `THUMBNAIL_COMPLETED(4)` → `COMPLETED(7)`.

**Steps:**

1. After running TC-01, query the new warranty document:
   ```sql
   SELECT d.id, d.title, d.status, d.thumbnail_name
   FROM documents d
   JOIN document_product dp ON dp.document_id = d.id
   WHERE dp.product_id = 6742 AND d.title LIKE '%arrant%'
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

## TC-RSPA-874-04 — Full vendor re-import brings `warranty` docs to all ACP products

**Objective:** Verify that after the full ACP vendor import, all eligible products receive the
`warranty`-type document.

> **Note:** This TC has already been validated by the first post-fix vendor re-import that ran
> on **2025-05-18**. Docs `84822` (ACP_WARRANTY_20301702_DOC.pdf, 17 products) and `84823`
> (ACP_WARRANTY_MXP22TLT_DOC.pdf, 1 product) were created on that date — proving the fix is live.
> The AQ `warranty` mediaType is only returned for specific ACP product lines (RCS, RMS, JET,
> MRX, AMSO, AOC) — not all ACP products. Products like CL10, CK10, SH10 genuinely do not have
> a `warranty`-type doc in AQ and will not gain new links after a re-import.

**Current state — confirm 17 products are linked to doc 84822:**
```sql
SELECT dp.product_id, p.sku FROM document_product dp
JOIN products p ON p.id = dp.product_id
WHERE dp.document_id = 84822
ORDER BY dp.product_id;
```

Expected: 17 rows (AMSO22, AMSO35, AOC24, JET14, JET14V, JET19, JET19V, MRX1, MRX1BL,
MRX1RE, MRX2, MRX2BL, MRX2RE, RCS10DSE, RCS10TS, RMS10DSA, RMS10TSA).

**To run a fresh TC-04:**

1. Trigger the ACP vendor product import via the FEDA UI:
   - Navigate to http://feda.loc/ → Vendor list → **ACP** → **Update**
   - Or enqueue via queue:
     ```bash
     php artisan queue:work --queue=auto_quotes
     ```
2. Monitor the `auto_quotes` queue until completion.
3. Re-run the SELECT above and verify: row count is the same as before (idempotent — deduplication
   by `remote_path` prevents duplicate docs).

**Pass criteria:** Import completes cleanly; doc 84822 is still linked to exactly the same 17
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
| `app/Models/Product/PdfHandler.php` | 92 | Gate condition: `isValid()` — no change, just benefits from wider whitelist |

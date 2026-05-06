# Manual Test Cases — RSPA-877

**Ticket:** RSPA-877 — IMG flush export doesn't delete the Shopify images
**Branch:** `RSPA-877` (merged into `dev` via commit `f5931854`)
**Fix commit:** `f5931854` — "RSPA-877 Fix RSPA-773 to allow flushimg mode"
**File changed:** `app/Models/Shopify/Entity/Product/Exporter.php` line 488

---

## Background

RSPA-773 (Jan 2026) added a guard: if a Shopify product already has **2 or more images**, the
image-export step is skipped entirely (to avoid unintentional overwrites during regular IMG exports).

**Bug:** This guard also blocked `IMG Flush` (`export_type = 10`), whose explicit purpose is to
replace Shopify images and delete any orphan images not tracked in the FEDA DB. Because the guard
fired before any flush logic, flush mode was silently broken for any product with ≥ 2 Shopify images.

**Fix:** The guard now has an extra condition — it is skipped when `export_type = TYPE_IMG_FLUSH`:

```php
// Before fix:
if ($imageCount >= 2) { return; }

// After fix (line 488):
if ($imageCount >= 2 && $this->getExportType() != ExportType::TYPE_IMG_FLUSH) { return; }
```

---

## Scope

| # | Scenario |
|---|---|
| TC-01 | Confirmation prompt blocks export unless user types "flush" |
| TC-02 | Regular IMG export (type 3) still skips products with 2+ Shopify images (RSPA-773 guard regression) |
| TC-03 | IMG Flush (type 10) bypasses the guard and is processed for a product with 2+ Shopify images |
| TC-04 | IMG Flush deletes an orphan image that was manually added to Shopify outside FEDA |
| TC-05 | IMG Flush on a single-image product works without errors and makes no deletions |

---

## Pre-conditions

- Docker containers running: `./dev/docker/up.sh`
- App container shell open: `docker exec -it -u www-data feda_php bash`
- Shopify export queue worker running:
  ```bash
  php artisan queue:work --queue=shopify_export
  ```
- Access to **RST Shopify Admin** to verify image state and to add manual test images
- DB access: `oners_dev` database (read-only, for pre/post state checks)

---

## Test Products

### Primary: American Range — RST bridge

| Field | Value |
|---|---|
| Product ID | 897421 |
| SKU | `365_MSD-2HE_NAT` |
| Vendor | American Range |
| App images (DB) | 5 |
| `rst_shopify_product_images` rows | 5 |
| RST Shopify product ID | 9077876228350 |

Verify pre-state in DB:
```sql
SELECT p.id, p.sku, v.short_name,
       COUNT(DISTINCT ip.image_id) AS app_imgs,
       COUNT(DISTINCT ri.id)       AS rst_shopify_imgs
FROM products p
JOIN vendors v ON v.id = p.vendor_id
JOIN image_product ip ON ip.product_id = p.id
LEFT JOIN rst_shopify_product_images ri ON ri.app_product_id = p.id
WHERE p.id = 897421
GROUP BY p.id, p.sku, v.short_name;
```
Expected: `app_imgs = 5`, `rst_shopify_imgs = 5`.

---

## TC-RSPA-877-01 — Confirmation prompt requires "flush" keyword

**Objective:** Verify that selecting `IMG Flush` export type triggers a confirmation dialog
and the export is blocked unless the user types the exact word **flush**.

**Steps:**

1. Navigate to http://feda.loc/ → Product list
2. Find product `365_MSD-2HE_NAT` (SKU search or vendor filter → American Range)
3. Open the individual product page
4. In the **Shopify export** section, select export type **IMG Flush** (value = 10)
5. In the confirmation dialog — type anything other than "flush" (e.g. `Flush`, `yes`, blank)
6. Attempt to confirm

**Expected results:**

| Check | Expected |
|---|---|
| Confirmation dialog shown | Yes — "This export type cleans up images in Shopify. Please type the word 'flush' to proceed." |
| Export blocked on wrong input | Yes — dialog rejects input, export does NOT trigger |
| Repeat with correct input "flush" | Dialog accepts; export proceeds to queue |

**Pass criteria:** Export is blocked unless the exact lowercase word "flush" is entered.

---

## TC-RSPA-877-02 — Regular IMG export (type 3) still skips products with 2+ Shopify images

**Objective:** Regression check — verify the RSPA-773 guard is still active for non-flush IMG exports.

**Pre-condition:** Product `897421` has 5 images in RST Shopify (confirmed above).

Open RST Shopify Admin → product `9077876228350` and note the current image count before starting.

**Steps:**

1. In the FEDA app, navigate to product `365_MSD-2HE_NAT`
2. In the Shopify export section, select export type **IMG** (value = 3, standard image export)
3. Trigger the export (no confirmation prompt for this type)
4. Monitor the `shopify_export` queue until the job completes
5. In RST Shopify Admin, check product `9077876228350` images

**Expected results:**

| Check | Expected |
|---|---|
| Job runs without error | Yes |
| Shopify product images | **Unchanged** — guard fires (`imageCount = 5 >= 2`) and returns early |
| `rst_shopify_product_images` row count | Unchanged (still 5 rows for product 897421) |

**Verify DB post-export:**
```sql
SELECT COUNT(*) FROM rst_shopify_product_images WHERE app_product_id = 897421;
-- Expected: 5 (unchanged)
```

**Pass criteria:** No new images added or deleted in Shopify; DB row count unchanged.

---

## TC-RSPA-877-03 — IMG Flush bypasses the 2+ images guard

**Objective:** Verify the RSPA-877 fix: flush mode is NOT blocked by the `imageCount >= 2` guard.

**Pre-condition:** Product `897421` has 5 images in RST Shopify.

**Steps:**

1. In the FEDA app, navigate to product `365_MSD-2HE_NAT`
2. In the Shopify export section, select export type **IMG Flush** (value = 10)
3. In the confirmation dialog, type **flush** and confirm
4. Monitor the `shopify_export` queue until the job completes
5. Verify RST Shopify Admin: product `9077876228350` still has images (guard did NOT block)

**Expected results:**

| Check | Expected |
|---|---|
| Job completes without error | Yes |
| Guard NOT triggered | Flush proceeds even though `imageCount = 5 >= 2` |
| Shopify images after flush | ≥ 5 — current app images uploaded via `productCreateMedia` |
| `rst_shopify_product_images` row count | Increased — new rows inserted for the newly uploaded media |

**Verify DB post-export (new rows with recent `created_at`):**
```sql
SELECT id, app_image_id, external_id, created_at
FROM rst_shopify_product_images
WHERE app_product_id = 897421
ORDER BY created_at DESC
LIMIT 10;
```

**Pass criteria:** Job completes without skipping; new `rst_shopify_product_images` rows exist with recent timestamps.

---

## TC-RSPA-877-04 — IMG Flush deletes orphan images added manually in Shopify

**Objective:** Verify that flush mode deletes Shopify images that are NOT tracked in the FEDA DB
(i.e. images added directly in Shopify Admin outside FEDA).

**Setup (manual — required before running this test):**

1. Open RST Shopify Admin → Products → product `9077876228350` (`365_MSD-2HE_NAT`)
2. **Add one extra image manually** via Shopify Admin — upload any test image (do NOT use FEDA for this)
3. Note the new image's thumbnail so you can confirm its deletion later
4. Confirm Shopify now shows **6 images** (5 originals + 1 manually added)

**Record DB state (manually-added image is NOT tracked here):**
```sql
SELECT COUNT(*) FROM rst_shopify_product_images WHERE app_product_id = 897421;
-- Expected: 5 (the manually-added image is absent)
```

**Steps:**

1. In the FEDA app, navigate to product `365_MSD-2HE_NAT`
2. Select export type **IMG Flush** (value = 10)
3. Type **flush** in the confirmation dialog and confirm
4. Monitor `shopify_export` queue until the job completes
5. Open RST Shopify Admin → product `9077876228350` → check images

**Expected results:**

| Check | Expected |
|---|---|
| Manually-added image | **Deleted** — not tracked in `rst_shopify_product_images` → identified as orphan → removed via `productDeleteMedia` |
| Original 5 app images | Still present (tracked in DB → kept) |
| Total images in Shopify after flush | 5 |

**Verify DB post-flush:**
```sql
SELECT id, app_image_id, external_id, created_at
FROM rst_shopify_product_images
WHERE app_product_id = 897421
ORDER BY created_at DESC
LIMIT 10;
```
Expected: rows for the 5 current app images only; no row for the manually-added orphan's external_id.

**Pass criteria:** Manually-added Shopify image is deleted; only the 5 FEDA-tracked images remain.

---

## TC-RSPA-877-05 — IMG Flush on a single-image product works without errors

**Objective:** Verify flush mode handles the case where there are no orphan images gracefully
(the delete step should be a no-op, not an error).

**Test product:**

| Field | Value |
|---|---|
| Product ID | 29 |
| SKU | `9971465_20X20-CLOTHNAPKIN_WHITE` |
| Vendor | Chef Approved |
| KRS Shopify images | 1 |

**Verify pre-state:**
```sql
SELECT COUNT(*) FROM krs_shopify_product_images WHERE app_product_id = 29;
-- Expected: 1
```

**Steps:**

1. In the FEDA app, navigate to product `9971465_20X20-CLOTHNAPKIN_WHITE`
2. Select export type **IMG Flush** (value = 10) for the KRS store
3. Type **flush** in the confirmation dialog and confirm
4. Monitor `shopify_export` queue until the job completes
5. Verify KRS Shopify Admin: product image is still present

**Expected results:**

| Check | Expected |
|---|---|
| Job completes without error | Yes |
| Image present in Shopify | Yes — the single image is tracked in DB → not an orphan → kept |
| `productDeleteMedia` called | No — `$removeIds` is empty (no orphans exist) |

**Pass criteria:** No exceptions; job completes cleanly; image remains in Shopify.

---

## Regression Check

| Scenario | Expected |
|---|---|
| Regular IMG export (type 3) — product with 1 Shopify image | Proceeds normally (`imageCount = 1 < 2`, guard does not fire) |
| Regular IMG export (type 3) — product with 2+ Shopify images | Skips image update (RSPA-773 guard intact) |
| IMG Flush (type 10) — product with 2+ Shopify images | Guard bypassed, export processed (RSPA-877 fix) |
| IMG Flush (type 10) — product with no orphan images | Completes without error; `$removeIds` empty; no deletions |
| Confirmation dialog | Blocked unless exact lowercase "flush" entered; no other export type shows this dialog |

---

## Files Changed (Reference)

| File | Lines | Description |
|---|---|---|
| `app/Models/Shopify/Entity/Product/Exporter.php` | L488 | Added `&& $this->getExportType() != ExportType::TYPE_IMG_FLUSH` to the 2+ images guard |
| `app/Models/Shopify/Entity/Product/Exporter.php` | L475–555 | Full `updateImages()` method — flush delete logic at L523–554 |
| `app/Models/Vendor/Source/ExportType.php` | — | `TYPE_IMG_FLUSH = 10` constant definition |
| `resources/views/pages/product/list.blade.php` | — | "flush" confirmation prompt (vendor/list view) |
| `resources/views/pages/product/list-individual.blade.php` | — | "flush" confirmation prompt (individual product view) |

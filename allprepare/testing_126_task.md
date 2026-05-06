# Manual Test Cases — allprepare-126
# Expose product attribute `intercompanyopslag` in Order API

## Prerequisites

- Admin access to Magento backend
- API client (Postman, curl, or similar)
- Admin Bearer token (obtain via `POST /rest/V1/integration/admin/token`)
- At least one product with `intercompanyopslag` set (e.g. SKU `MRE-9-500g`, value `1.25`)
- At least one product without `intercompanyopslag` set
- A configurable product and a bundle product available in the store

---

## TC-01 — Simple product: attribute present in API response

**Goal:** Verify `intercompanyopslag` appears in `extension_attributes` for a simple product order item.

**Steps:**
1. Find a simple product with `intercompanyopslag` set (e.g. value `1.25`). Note the SKU.
2. Place a frontend order containing that product. Note the `increment_id` (e.g. `10700001393`).
3. Call the API:
   ```
   GET /rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=increment_id
     &searchCriteria[filter_groups][0][filters][0][value]=10700001393
     &searchCriteria[filter_groups][0][filters][0][condition_type]=eq
   ```
4. In the response, find the matching item by SKU.

**Expected result:**
```json
{
  "sku": "MRE-9-500g",
  "extension_attributes": {
    "intercompanyopslag": "1.25"
  }
}
```

**Pass criteria:** `extension_attributes.intercompanyopslag` equals the product's value at the time of ordering.

---

## TC-02 — Value locked at ordering time (immutability)

**Goal:** Confirm the stored value reflects the product state at order placement, not the current product state.

**Steps:**
1. Confirm product SKU `MRE-9-500g` has `intercompanyopslag = 1.25`.
2. Place a frontend order containing this product. Note the `increment_id`.
3. Call the API (same query as TC-01) — verify `intercompanyopslag = "1.25"` is returned.
4. In Magento Admin, go to **Catalog → Products**, open `MRE-9-500g`, change `intercompanyopslag` to `2.50`, and save.
5. Call the API again for the same order.

**Expected result:** Response still shows `intercompanyopslag = "1.25"` (original value, unchanged).

**Pass criteria:** Value did NOT change after product attribute update. If it changed to `2.50`, the implementation is non-compliant.

---

## TC-03 — Product with no `intercompanyopslag` value

**Goal:** Verify the attribute is omitted from the response when the product has no value set.

**Steps:**
1. Find a product where `intercompanyopslag` is empty/not set. Note the SKU.
2. Place a frontend order containing that product. Note the `increment_id`.
3. Call the API for that order and locate the item by SKU.

**Expected result:** The item either:
- Has no `intercompanyopslag` key inside `extension_attributes`, OR
- `extension_attributes.intercompanyopslag` is `null` / empty string

**Pass criteria:** No `intercompanyopslag` key present in `extension_attributes` for that item (attribute omitted).

---

## TC-04 — Configurable product

**Goal:** Verify the attribute is exposed for configurable product order items.

**Steps:**
1. Find a configurable product whose child (simple) products have `intercompanyopslag` set.
2. Place a frontend order by selecting a specific variant of the configurable. Note the `increment_id`.
3. Call the API and find the order item(s) for that order.

**Expected result:** The child (simple) order item contains `extension_attributes.intercompanyopslag` with the correct value for the selected variant's SKU.

**Pass criteria:** Value present and correct on the child item.

---

## TC-05 — Bundle product (parent and child items)

**Goal:** Verify the attribute is exposed on both parent and child items of a bundle order.

**Steps:**
1. Find a bundle product where child simple products have `intercompanyopslag` set. Note child SKUs and their values.
2. Place a frontend order containing the bundle. Note the `increment_id`.
3. Call the API and find all items for that order (bundle parent + bundle children).

**Expected result:**
- Each child item contains `extension_attributes.intercompanyopslag` with the correct value.
- The bundle parent item either contains its own value or omits `intercompanyopslag` if the attribute is not set on the bundle product itself.

**Pass criteria:** Child items show correct values; no errors in response.

---

## TC-06 — Fetch by order ID endpoint

**Goal:** Verify the attribute is also available via the single-order endpoint, not only the search endpoint.

**Steps:**
1. Use an order placed in any previous test case. Note the numeric order `id` (not `increment_id`).
2. Call:
   ```
   GET /rest/V1/orders/{id}
   ```
3. Inspect the items in the response.

**Expected result:** Same `extension_attributes.intercompanyopslag` values appear as when fetching via the search endpoint.

**Pass criteria:** Consistent output between `/V1/orders/{id}` and `/V1/orders?searchCriteria=...`.

---

## TC-07 — Order with multiple items (mixed: attribute set / not set)

**Goal:** Verify each item independently reports its own value without cross-contamination.

**Steps:**
1. Place a frontend order containing:
   - One product with `intercompanyopslag = 1.25`
   - One product with no `intercompanyopslag` value
2. Note the `increment_id`. Call the API.
3. Inspect both items in the response.

**Expected result:**
- Item with value: `extension_attributes.intercompanyopslag = "1.25"`
- Item without value: `intercompanyopslag` key absent from `extension_attributes`

**Pass criteria:** Values are per-item and independent; no cross-item leakage.

---

## TC-08 — Deleted product does not affect historical order data

**Goal:** Confirm the API still returns the correct value even after the product is deleted.

**Steps:**
1. Place a frontend order with a product that has `intercompanyopslag = 1.25`. Note the `increment_id`.
2. Verify the API returns `intercompanyopslag = "1.25"` for this order.
3. In Magento Admin, delete or disable the product.
4. Call the API again for the same order.

**Expected result:** Response still returns `intercompanyopslag = "1.25"`. No errors or missing values.

**Pass criteria:** Order item data is unaffected by product deletion/disabling.

---

## API Authentication Reference

```bash
# Get admin token
curl -X POST https://<store-domain>/rest/V1/integration/admin/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'

# Query order by increment_id
curl -X GET "https://<store-domain>/rest/V1/orders?searchCriteria[filter_groups][0][filters][0][field]=increment_id&searchCriteria[filter_groups][0][filters][0][value]=<increment_id>&searchCriteria[filter_groups][0][filters][0][condition_type]=eq" \
  -H "Authorization: Bearer <token>"
```

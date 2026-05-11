# AllPrepare — System Testing / General QA Review Plan

**Target:** https://www.allprepare.com/ (Production)
**Platform:** Magento 2.4.8-p4 CE · Hyva theme · PHP 8.1 · MySQL 8.0
**Locale:** nl_NL (single store)
**Author:** QA / Engineering
**Last updated:** 2026-05-11

---

## 1. Document Meta

### 1.1 Purpose
Provide a repeatable, manual System Testing / general QA sweep of the production AllPrepare site. Verify customer-facing functionality, performance, SEO, accessibility, and security after deploys or as periodic regression.

### 1.2 Scope
Read-only validation of the live production site from a Chrome desktop browser. The plan covers:
- All public customer flows from homepage → checkout up to (but not including) payment authorization
- All custom-module customer surfaces (Combinations, FreeProducts, DeliveryRules, AddToCartPopup, StockStatus, Reviews, TrackingPage, SeoRichData, HrefLangTags, RobotsModifier, UrlCleaner, ListCategories)
- Non-functional concerns: Performance (Core Web Vitals), SEO/structured data, Accessibility (WCAG 2.1 AA), Security/Privacy

### 1.3 Out of Scope
- Admin panel and back-office workflows
- Real payment submission (test stops before authorization)
- Account creation, password reset, address persistence (forms inspected only)
- Email template rendering (no orders placed)
- Cross-browser testing (Chrome desktop only)
- Mobile-device testing (Chrome responsive-mode spot checks only)
- Load / stress / fuzz testing
- Backend cron execution and DB-state validation

### 1.4 Test Environment
| Item | Value |
|---|---|
| URL | https://www.allprepare.com/ |
| Browser | Google Chrome, latest stable, Desktop |
| Tools | Chrome DevTools, Lighthouse, axe DevTools, View-Source, `curl`, https://validator.schema.org, https://search.google.com/test/rich-results |
| Profile | Fresh incognito session per test area; clear cookies between cookie-consent runs |
| Network | Throttled to "Fast 3G" only for performance tests; otherwise default |

### 1.5 Severity Definitions
| Level | Meaning | Examples |
|---|---|---|
| **P0** | Blocker — revenue loss, checkout broken, site down, data leak | Add-to-cart fails, payment list empty, .env exposed |
| **P1** | Major — degraded UX or SEO impact, workaround exists | JSON-LD missing on PDP, broken CMS page, axe-critical violation |
| **P2** | Minor / cosmetic | Misaligned padding, typo, low-severity axe rule |

### 1.6 Defect Template
```
ID:        DEF-NNN
Date:      YYYY-MM-DD
Test Case: TC-XXX-N
Severity:  P0 / P1 / P2
Browser:   Chrome <version> Desktop
URL:       https://...
Steps:     1. ...
Expected:  ...
Actual:    ...
Screenshot/HAR: <link>
Status:    Open / Fixed / Won't Fix
```

---

## 2. Global / Cross-Page (TC-GLB)

### TC-GLB-1: Header renders on every page type
- **Priority:** P0
- **Module(s):** Hyva theme `app/design/frontend/allprepare/base`
- **Preconditions:** Fresh incognito.
- **Steps:**
  1. Open homepage.
  2. Navigate to a category, a PDP, the cart, checkout, and a CMS page (Contact).
- **Expected Result:** Header (logo, primary nav, search box, account icon, mini-cart icon) is present and visually consistent across all 5 page types.
- **Notes:** Inspect that DOM root is the Hyva theme (`<body class*="hyva">`).

### TC-GLB-2: Mini-cart counter reflects cart state
- **Priority:** P0
- **Module(s):** Hyva mini-cart, `XInteractive_FreeProducts`
- **Preconditions:** Empty cart.
- **Steps:**
  1. Confirm mini-cart icon shows no badge or `0`.
  2. Add a simple product to the cart.
  3. Observe the mini-cart badge.
  4. Increment quantity in cart page to 3.
- **Expected Result:** Counter updates immediately after each action without a hard reload. Free-product line items (if auto-added) are reflected in the count.

### TC-GLB-3: Footer links resolve HTTP 200
- **Priority:** P1
- **Module(s):** Hyva theme footer
- **Preconditions:** None.
- **Steps:**
  1. Open the homepage.
  2. Click each footer link in turn: Ordering, Delivery, B2B, Privacy, Terms, Cookies, Returns, Reviews, Kennisbank, Blog, Careers, Contact.
- **Expected Result:** Each link returns HTTP 200, renders a non-empty page with an `<h1>`, and the browser back button returns to the homepage cleanly.

### TC-GLB-4: Thuiswinkel Waarborg trust badge present and links out
- **Priority:** P2
- **Module(s):** Theme footer / header
- **Preconditions:** None.
- **Steps:**
  1. Locate the Thuiswinkel Waarborg badge.
  2. Click it.
- **Expected Result:** Badge image loads, opens the certification page on thuiswinkel.org in a new tab.

### TC-GLB-5: USP bar visible on key pages
- **Priority:** P2
- **Module(s):** `XInteractive_UspBarWidget`
- **Preconditions:** None.
- **Steps:**
  1. Verify the four USP items render on Home, Category, PDP, Cart, Checkout:
     - 10.000+ tevreden klanten
     - Grootste voorraad in Nederland
     - Klanten beoordelen ons 9/10
     - Voor jou en je gezin
- **Expected Result:** All four USP items visible on all five page types; icons load.

### TC-GLB-6: Custom 404 page renders for unknown route
- **Priority:** P1
- **Module(s):** Magento + theme
- **Preconditions:** None.
- **Steps:**
  1. Navigate to `https://www.allprepare.com/this-url-does-not-exist-xyz`.
- **Expected Result:** HTTP 404 response, themed 404 page renders (not a raw Magento error), has working header/footer and a search box.

### TC-GLB-7: `<html lang="nl">` attribute set
- **Priority:** P1
- **Module(s):** Magento store config
- **Preconditions:** None.
- **Steps:**
  1. View-source on homepage and on a PDP.
- **Expected Result:** Root `<html>` element has `lang="nl"`. No conflicting `xml:lang` mismatches.

### TC-GLB-8: No JavaScript errors in console
- **Priority:** P1
- **Module(s):** All
- **Preconditions:** DevTools Console open, filter level = "Errors".
- **Steps:**
  1. Visit Home, Category, PDP, Cart, Checkout step 1, Contact page.
- **Expected Result:** No `Uncaught` JS errors. Network 4xx/5xx logs do not include critical resources (only acceptable: analytics opt-out, optional third-party scripts).

---

## 3. Homepage (TC-HOME)

### TC-HOME-1: Hero banner — display and click-through
- **Priority:** P0
- **Module(s):** `XInteractive_HeroWidget`
- **Preconditions:** None.
- **Steps:**
  1. Open homepage.
  2. Identify the four hero banners.
  3. Click each banner.
- **Expected Result:** Banners load without layout shift, images sized correctly. Each banner navigates to its linked category/CMS target which returns 200.

### TC-HOME-2: Featured product slider — 8 items, navigation works
- **Priority:** P1
- **Module(s):** `XInteractive_ProductSliderWidget`
- **Preconditions:** None.
- **Steps:**
  1. Locate the featured-product slider.
  2. Confirm 8 product cards render.
  3. Click the next/prev arrows; observe carousel motion.
  4. Click a product card.
- **Expected Result:** Slider renders 8 distinct cards, arrows function, clicking a card opens the PDP. No console errors.

### TC-HOME-3: USP block content matches expected copy
- **Priority:** P2
- **Module(s):** `XInteractive_UspBlockWidget`
- **Preconditions:** None.
- **Steps:**
  1. Read the four USPs.
- **Expected Result:** Matches Section TC-GLB-5 copy. Icons load.

### TC-HOME-4: Category tile grid resolves to live categories
- **Priority:** P1
- **Module(s):** Homepage CMS block
- **Preconditions:** None.
- **Steps:**
  1. Click each category tile (Noodpakket, Noodrantsoen, Waterfilters, Stroomvoorziening, Nooduitrusting).
- **Expected Result:** Each loads its category page with the correct breadcrumb.

### TC-HOME-5: Newsletter signup — validation
- **Priority:** P1
- **Module(s):** Mailchimp / `XInteractive_NewsletterTitleWidget`
- **Preconditions:** None.
- **Steps:**
  1. Submit the newsletter form with an empty email.
  2. Submit with `notanemail`.
  3. Submit with a clearly throwaway address like `qa+novalid@example.invalid`.
- **Expected Result:** Empty + malformed inputs are blocked with an inline validation message. The third submit is accepted by the form (no claim about Mailchimp side-effect).
- **Notes:** Do not submit a real personal email.

### TC-HOME-6: Reviews block — score and count match FeedbackCompany
- **Priority:** P2
- **Module(s):** `XInteractive_Reviews`, FeedbackCompany integration
- **Preconditions:** None.
- **Steps:**
  1. Note the score (~9/10) and review count (~2071) on homepage.
  2. Cross-check on the FeedbackCompany badge link if present.
- **Expected Result:** Numbers are non-zero and visually consistent. Discrepancy > 10% from FeedbackCompany source = P1.

### TC-HOME-7: Above-the-fold has no CLS thrash
- **Priority:** P1
- **Module(s):** Theme + hero widget
- **Preconditions:** DevTools Performance open.
- **Steps:**
  1. Record a load of the homepage from cold cache.
- **Expected Result:** Layout Shift (CLS) ≤ 0.1 from the Performance panel summary.

### TC-HOME-8: Promotional badges (10%, 21%, 59% off) render correctly on featured slider
- **Priority:** P2
- **Module(s):** Theme product card
- **Preconditions:** None.
- **Steps:**
  1. Identify discounted products in the homepage slider.
- **Expected Result:** Discount badges align with the product card, do not overlap price, and percentage matches the difference between regular and special price.

---

## 4. Catalog — Category Pages (TC-CAT)

### TC-CAT-1: Top-level categories load
- **Priority:** P0
- **Module(s):** Magento catalog
- **Preconditions:** None.
- **Steps:**
  1. Visit each top-level category: Bestsellers, Noodpakket, Noodrantsoen, Waterfilters, Stroomvoorziening, Nooduitrusting, Sale.
- **Expected Result:** Each returns 200, renders product grid, no JS errors.

### TC-CAT-2: Subcategory list block on parent category
- **Priority:** P1
- **Module(s):** `BerkeyExpert_ListCategories` → `app/code/BerkeyExpert/ListCategories/view/frontend/layout/catalog_category_view.xml`
- **Preconditions:** None.
- **Steps:**
  1. Open the Nooduitrusting category (it has children: Noodradio, Virus Protection, Gas masks, Cooking, Lighting, Heaters, First-aid, Radios, Bags, Tools).
- **Expected Result:** Subcategory tile list block renders, each tile is clickable and navigates to that child category.

### TC-CAT-3: Layered navigation (Amasty Shopby) filters
- **Priority:** P1
- **Module(s):** `Amasty_Shopby`
- **Preconditions:** None.
- **Steps:**
  1. Open Noodpakket category.
  2. Apply a filter (e.g., aantal personen).
  3. Apply a second filter.
  4. Click "Wis filters" (clear filters) link.
- **Expected Result:** Product grid updates after each filter, URL contains filter parameters, breadcrumb still correct. Clear-filters returns to unfiltered grid.

### TC-CAT-4: Sort by — price ascending and descending
- **Priority:** P2
- **Module(s):** Catalog sort
- **Preconditions:** None.
- **Steps:**
  1. Open Waterfilters category.
  2. Sort by price ascending.
  3. Re-sort by price descending.
- **Expected Result:** First product price ≤ second ≤ … for ascending; reverse for descending. URL reflects `?product_list_order=price&product_list_dir=…`.

### TC-CAT-5: Pagination works
- **Priority:** P1
- **Module(s):** Catalog pagination
- **Preconditions:** Category with > 1 page of products.
- **Steps:**
  1. Click page 2 / next.
  2. Click back to page 1.
- **Expected Result:** Different products appear, URL updates with `?p=2`, browser back returns to page 1.

### TC-CAT-6: "Per page" selector
- **Priority:** P2
- **Module(s):** Catalog
- **Preconditions:** None.
- **Steps:**
  1. Change "per page" value if available.
- **Expected Result:** Grid count matches selection; URL reflects new param.

### TC-CAT-7: Breadcrumbs reflect category depth
- **Priority:** P1
- **Module(s):** Theme + Magento breadcrumb
- **Preconditions:** None.
- **Steps:**
  1. Navigate to a 2-level deep category (e.g., Nooduitrusting → Noodradio).
- **Expected Result:** Breadcrumb shows Home › Nooduitrusting › Noodradio. Each crumb except the last is clickable.

### TC-CAT-8: Product card shows price, image, stock cue
- **Priority:** P1
- **Module(s):** Theme product card, `XInteractive_StockStatus`
- **Preconditions:** None.
- **Steps:**
  1. Scan visible product cards on the Bestsellers category.
- **Expected Result:** Every card has an image, name, price, and a stock cue ("Op voorraad" / out-of-stock badge).

### TC-CAT-9: Discount badges render where special price is set
- **Priority:** P2
- **Module(s):** Theme product card
- **Preconditions:** Sale category contains discounted products.
- **Steps:**
  1. Open the Sale category.
  2. Spot-check three discounted products.
- **Expected Result:** Each shows a percentage discount badge whose value equals `round((price − special_price) / price × 100)`.

### TC-CAT-10: Empty category state
- **Priority:** P2
- **Module(s):** Catalog
- **Preconditions:** Identify a deep, empty category if one exists; otherwise simulate via filters that yield 0.
- **Steps:**
  1. Apply impossible filter combination on Noodpakket.
- **Expected Result:** "Geen producten gevonden" or equivalent message; layout does not collapse.

---

## 5. Catalog — Product Detail Pages (TC-PDP)

### TC-PDP-1: Simple product PDP renders all key fields
- **Priority:** P0
- **Module(s):** Magento PDP + Hyva
- **Preconditions:** Pick a simple in-stock product (e.g., a water filter).
- **Steps:**
  1. Open the PDP.
  2. Inspect: product name, SKU (if shown), price, gallery, description tab, "Add to cart" button.
- **Expected Result:** All fields render, no placeholder fallbacks (`Lorem` / `N/A`).

### TC-PDP-2: Bundle PDP renders bundle options
- **Priority:** P0
- **Module(s):** `XInteractive_SimpleBundles`
- **Preconditions:** Open a Noodpakket bundle product.
- **Steps:**
  1. Confirm bundle options or aggregated bundle price displays.
  2. Adjust an option if customer-selectable.
- **Expected Result:** Price updates after each option change. "Vanaf" or fixed price as configured. No JS errors.

### TC-PDP-3: Stock status display
- **Priority:** P1
- **Module(s):** `XInteractive_StockStatus` → `view/frontend/layout/catalog_product_view.xml`
- **Preconditions:** Pick one in-stock and one out-of-stock product.
- **Steps:**
  1. Open in-stock PDP; verify stock label.
  2. Open out-of-stock PDP (if any); verify stock label and Add-to-cart state.
- **Expected Result:** In-stock label visible; out-of-stock disables Add-to-cart and shows a clear message.

### TC-PDP-4: Delivery rules block on PDP
- **Priority:** P1
- **Module(s):** `XInteractive_DeliveryRules` → `view/frontend/layout/catalog_product_view.xml`
- **Preconditions:** None.
- **Steps:**
  1. Inspect the delivery-info block below the price/add-to-cart area.
  2. Confirm "Voor 21:00 besteld, morgen in huis" (or equivalent) renders.
- **Expected Result:** Block renders with current-day text. If after cut-off, message updates to next business day.
- **Notes:** Re-test before and after 21:00 NL time on the same product to capture the cut-off branch.

### TC-PDP-5: Combinations widget appears and changes price
- **Priority:** P0
- **Module(s):** `XInteractive_Combinations` (TS/React admin, frontend totals collector)
- **Preconditions:** Identify a product that has combinations available.
- **Steps:**
  1. Select combination option A.
  2. Select option B.
  3. Add to cart.
- **Expected Result:** Displayed price updates per selection. Cart receives line with the selected combination indicated. `quote_item.selected_combination` column populated (verified indirectly via cart UI showing the combination label).

### TC-PDP-6: AddToCartPopup modal opens, focus-traps, closes
- **Priority:** P0
- **Module(s):** `XInteractive_AddToCartPopup` → `view/frontend/layout/catalog_product_view.xml`
- **Preconditions:** Pick a product whose Add-to-cart is wired to the popup.
- **Steps:**
  1. Click "Toevoegen aan winkelwagen".
  2. Tab through the modal.
  3. Press Escape to close.
- **Expected Result:** Modal opens with focus moved into it, focus does not escape modal while open, Escape closes it, focus returns to the originating button.

### TC-PDP-7: AddToCartPopup — recommended/upsell behavior
- **Priority:** P1
- **Module(s):** `XInteractive_AddToCartPopup`
- **Preconditions:** Same product as TC-PDP-6.
- **Steps:**
  1. Open the popup.
  2. If recommendations appear, click "Naar winkelwagen".
- **Expected Result:** Cart page loads with the original product (and any selected upsells) present; no duplicate adds.

### TC-PDP-8: FreeProducts auto-add fires when condition met
- **Priority:** P1
- **Module(s):** `XInteractive_FreeProducts` (`checkout_cart_save_after` observer + iosc plugin)
- **Preconditions:** Identify a product known to trigger a free gift; if unknown, test the boundary by trying a high-value bundle.
- **Steps:**
  1. Add the qualifying product to cart.
  2. Open cart page.
- **Expected Result:** Free product appears as an additional line at €0 (or 100% discount). Removing it should respect business rule (re-add or stay removed — observe behavior and note).

### TC-PDP-9: Product reviews tab displays imported reviews
- **Priority:** P1
- **Module(s):** `XInteractive_Reviews` hourly cron `xinteractive_reviews_cron_import`
- **Preconditions:** Bestseller PDP that has ratings on the homepage slider.
- **Steps:**
  1. Click the Reviews tab/section.
  2. Verify at least one review row renders with star/score and author/date.
- **Expected Result:** Reviews load. If empty for a product expected to have reviews, flag P1 — likely cron failure or import mapping issue.

### TC-PDP-10: Product images — gallery and zoom
- **Priority:** P2
- **Module(s):** Theme gallery
- **Preconditions:** PDP with multiple images.
- **Steps:**
  1. Click each thumbnail.
  2. Click main image for zoom if available.
- **Expected Result:** Each thumbnail swaps the main image. No 404 image requests in Network tab.

### TC-PDP-11: Related/Up-sell products section
- **Priority:** P2
- **Module(s):** Magento related products
- **Preconditions:** PDP that exposes related products.
- **Steps:**
  1. Scroll to the related-products section.
  2. Click one related product.
- **Expected Result:** Navigates to that product's PDP. Related list does not contain the current product itself.

### TC-PDP-12: Quantity selector validation
- **Priority:** P1
- **Module(s):** Theme PDP form
- **Preconditions:** Any simple product.
- **Steps:**
  1. Try to enter qty = 0; submit Add-to-cart.
  2. Enter qty = `abc`.
  3. Enter qty = 999.
- **Expected Result:** 0 and non-numeric are rejected with a validation message. 999 is either capped or returns a server-side stock error gracefully.

### TC-PDP-13: PDP `<title>` and meta description unique per product
- **Priority:** P1 (functional check; SEO deep-check is in TC-SEO-*)
- **Module(s):** Magento + theme
- **Preconditions:** Two different PDPs.
- **Steps:**
  1. View-source on each.
- **Expected Result:** `<title>` and `<meta name="description">` differ across products and are non-empty.

### TC-PDP-14: "Order before 21:00" message updates with time of day
- **Priority:** P2
- **Module(s):** `XInteractive_DeliveryRules`
- **Preconditions:** Tester can revisit the page across the 21:00 NL boundary.
- **Steps:**
  1. Load PDP before 21:00; record message.
  2. Reload after 21:00; record message.
- **Expected Result:** Message changes from "morgen in huis" to next business day. If frozen, file P1.

---

## 6. Search (TC-SRCH)

### TC-SRCH-1: Autosuggest returns relevant matches
- **Priority:** P1
- **Module(s):** Magento search (Elasticsearch/OpenSearch)
- **Preconditions:** Search input in header.
- **Steps:**
  1. Type `water` into the search box.
  2. Observe suggestions.
- **Expected Result:** Suggestion dropdown appears within ~500ms, contains terms or products matching "water" (e.g., waterfilter).

### TC-SRCH-2: Full search results page
- **Priority:** P0
- **Module(s):** Magento search results
- **Preconditions:** None.
- **Steps:**
  1. Submit a search for `noodpakket`.
- **Expected Result:** Results page renders with relevant products, breadcrumb shows "Search results for…", URL contains `?q=noodpakket`.

### TC-SRCH-3: No-results page
- **Priority:** P1
- **Module(s):** Magento search
- **Preconditions:** None.
- **Steps:**
  1. Search `xyzqqqzzz`.
- **Expected Result:** Friendly no-results message, possibly suggestions, no console errors.

### TC-SRCH-4: Special characters do not break search
- **Priority:** P2
- **Module(s):** Search
- **Preconditions:** None.
- **Steps:**
  1. Search `<script>alert(1)</script>`.
  2. Search `'` and `"`.
- **Expected Result:** No script execution. Page renders no-results or sanitized echo. URL is encoded.

### TC-SRCH-5: Search by exact SKU
- **Priority:** P2
- **Module(s):** Search
- **Preconditions:** Note a known SKU from a PDP.
- **Steps:**
  1. Submit search using exact SKU.
- **Expected Result:** That product appears in top results.

### TC-SRCH-6: Search persists query in URL and input
- **Priority:** P2
- **Module(s):** Search
- **Preconditions:** None.
- **Steps:**
  1. Search `filter`.
  2. Copy URL, open in new tab.
- **Expected Result:** URL is shareable, results page in new tab matches original.

---

## 7. Cart & Mini-Cart (TC-CART)

### TC-CART-1: Add to cart from PDP — mini-cart updates
- **Priority:** P0
- **Module(s):** Magento cart + Hyva mini-cart
- **Preconditions:** Empty cart.
- **Steps:**
  1. Add a product from a PDP.
  2. Hover/open mini-cart drawer.
- **Expected Result:** Drawer shows the just-added item with image, name, qty, price. No reload required.

### TC-CART-2: Update quantity in full cart page
- **Priority:** P0
- **Module(s):** Magento cart page
- **Preconditions:** Cart has 1 item.
- **Steps:**
  1. Open `/checkout/cart/`.
  2. Change qty from 1 to 3.
  3. Click update.
- **Expected Result:** Subtotal multiplies by 3 (within rounding). Mini-cart counter syncs.

### TC-CART-3: Remove item from cart
- **Priority:** P0
- **Module(s):** Cart
- **Preconditions:** Cart has 2 different items.
- **Steps:**
  1. Remove item 1.
- **Expected Result:** Item disappears, subtotal recomputes, mini-cart syncs.

### TC-CART-4: Empty cart state
- **Priority:** P1
- **Module(s):** Cart
- **Preconditions:** Remove all items.
- **Steps:**
  1. Observe empty cart page.
- **Expected Result:** "Je winkelwagen is leeg" message, CTA back to shopping, no JS errors.

### TC-CART-5: Combinations item shows selected combination label
- **Priority:** P1
- **Module(s):** `XInteractive_Combinations`
- **Preconditions:** Add a product with a combination selection (TC-PDP-5).
- **Steps:**
  1. Open cart page.
- **Expected Result:** Line item displays the selected combination (e.g., "Variant: X + Y") and the combination price/discount.

### TC-CART-6: FreeProducts persists in cart re-visit
- **Priority:** P1
- **Module(s):** `XInteractive_FreeProducts`
- **Preconditions:** Cart has a free product auto-added.
- **Steps:**
  1. Close tab, reopen in same session.
  2. Visit cart.
- **Expected Result:** Free line item still present. Subtotal unchanged.

### TC-CART-7: FreeProducts removed when parent removed
- **Priority:** P1
- **Module(s):** `XInteractive_FreeProducts`
- **Preconditions:** Cart has parent + free-gift line.
- **Steps:**
  1. Remove the parent line.
- **Expected Result:** Free gift is also removed (per typical promo logic). If retained, document as observed behavior — flag P2 if it leads to a "free purchase" path.

### TC-CART-8: Mini-cart drawer syncs across tabs
- **Priority:** P2
- **Module(s):** Hyva mini-cart (Alpine.js)
- **Preconditions:** Two tabs open on the same site.
- **Steps:**
  1. Add a product in Tab A.
  2. Switch to Tab B, open mini-cart.
- **Expected Result:** Tab B reflects the new item after refresh or via storage event (note which).

---

## 8. Checkout — OneStepCheckout (TC-CKO)

> **⚠️ Read-only constraint:** All TCs below stop before clicking final "Place Order"/payment-redirect. Do **not** authorize a payment.

### TC-CKO-1: Checkout page loads with cart present
- **Priority:** P0
- **Module(s):** `OneStepCheckout_Iosc`
- **Preconditions:** Cart has at least one item.
- **Steps:**
  1. Click "Afrekenen" / proceed to checkout.
- **Expected Result:** `/onestepcheckout/` (or similar) loads in one page, all sections (customer, shipping, payment, summary) visible. No reload between sections.

### TC-CKO-2: Email validation
- **Priority:** P0
- **Module(s):** OneStepCheckout
- **Preconditions:** Guest checkout.
- **Steps:**
  1. Enter `not-an-email` in email field; blur.
  2. Correct to `qa+test@example.com`.
- **Expected Result:** Invalid input flagged inline; valid input clears error. Form does not submit until valid.

### TC-CKO-3: Postcode autocomplete (Experius)
- **Priority:** P0
- **Module(s):** `Experius_Postcode` → `/V1/postcode/information`
- **Preconditions:** Country = Netherlands.
- **Steps:**
  1. Enter postcode `1011` and house number `1`.
  2. Tab out of house number.
  3. Repeat with Belgian postcode if country=Belgium supported.
- **Expected Result:** Street and city auto-populate from API response. Invalid postcode triggers a friendly error, not a console exception.

### TC-CKO-4: Shipping method options render
- **Priority:** P0
- **Module(s):** Magento shipping + `XInteractive_DeliveryRules`
- **Preconditions:** Address completed.
- **Steps:**
  1. Observe shipping options.
  2. Switch between options.
- **Expected Result:** At least one method renders, totals recompute on switch, no flicker.

### TC-CKO-5: DeliveryRules REST endpoint resolves
- **Priority:** P1
- **Module(s):** `XInteractive_DeliveryRules` → `etc/webapi.xml` (`GET /V1/xinteractive-deliveryrules/delivery`)
- **Preconditions:** Open DevTools Network tab; filter `xhr`.
- **Steps:**
  1. Reload checkout.
  2. Locate the `xinteractive-deliveryrules/delivery` request.
- **Expected Result:** 200 response with a JSON payload. No 401/500. Payload contains a non-empty rules array.

### TC-CKO-6: Payment method list shows all expected methods
- **Priority:** P0
- **Module(s):** Mollie + Magento payment
- **Preconditions:** Address + shipping completed.
- **Steps:**
  1. Inspect payment methods.
- **Expected Result:** All of the following are present and selectable: iDEAL, MasterCard, Visa, Sofort, PayPal, Apple Pay, Bancontact, KBC, Belfius. Each shows logo + label.

### TC-CKO-7: iDEAL bank dropdown populated
- **Priority:** P1
- **Module(s):** Mollie iDEAL
- **Preconditions:** Select iDEAL.
- **Steps:**
  1. Open the bank dropdown.
- **Expected Result:** List of Dutch banks (ABN, ING, Rabobank, etc.) renders. Selecting one updates internal state but **do not** click final pay.

### TC-CKO-8: Terms & conditions checkbox required
- **Priority:** P0
- **Module(s):** Checkout
- **Preconditions:** All fields filled, payment selected.
- **Steps:**
  1. Leave T&C unchecked; attempt "Place Order".
- **Expected Result:** Submit blocked, T&C field highlighted. **Do not check + click.**

### TC-CKO-9: GDPR / marketing consent checkboxes
- **Priority:** P1
- **Module(s):** Amasty GDPR
- **Preconditions:** None.
- **Steps:**
  1. Identify consent checkboxes (marketing opt-in, privacy acknowledgment).
- **Expected Result:** Required ones are clearly marked. Marketing opt-in defaults to unchecked (GDPR compliance).

### TC-CKO-10: Order summary recalculates on changes
- **Priority:** P1
- **Module(s):** Checkout summary
- **Preconditions:** Cart has 2 items.
- **Steps:**
  1. Change qty on one item from the summary if allowed.
  2. Otherwise add a discount code (if any field exists) — use an obviously invalid one.
- **Expected Result:** Totals recompute. Invalid coupon shows error inline.

### TC-CKO-11: Cart→Checkout→Cart back-navigation preserves cart
- **Priority:** P2
- **Module(s):** Checkout
- **Preconditions:** Cart filled, on checkout.
- **Steps:**
  1. Use browser back to cart.
  2. Use browser forward to checkout.
- **Expected Result:** Cart and entered data preserved within the session.

### TC-CKO-12: Console & network during checkout — no errors
- **Priority:** P1
- **Module(s):** All
- **Preconditions:** DevTools open throughout.
- **Steps:**
  1. Walk the checkout from filling email through selecting payment.
- **Expected Result:** No 4xx/5xx on critical endpoints (cart, shipping, payment-information). No uncaught JS errors.

---

## 9. Customer Account — Read-Only (TC-ACC)

> **Constraint:** Forms are inspected only; do not submit credentials, do not register, do not request password reset.

### TC-ACC-1: Login page renders
- **Priority:** P1
- **Module(s):** Magento customer
- **Preconditions:** None.
- **Steps:**
  1. Navigate to `/customer/account/login/`.
- **Expected Result:** Email + password fields, "Wachtwoord vergeten?" link, "Account aanmaken" link, form has `form_key`.

### TC-ACC-2: Login form client-side validation
- **Priority:** P2
- **Module(s):** Magento customer form
- **Preconditions:** Login page.
- **Steps:**
  1. Click submit with empty fields.
  2. Enter `not-an-email`.
- **Expected Result:** Inline validation errors render; submit is blocked client-side.

### TC-ACC-3: Forgot password page renders
- **Priority:** P2
- **Module(s):** Magento customer
- **Preconditions:** None.
- **Steps:**
  1. Click "Wachtwoord vergeten?".
- **Expected Result:** Form renders with email input. **Do not submit.**

### TC-ACC-4: Registration page renders
- **Priority:** P2
- **Module(s):** Magento customer
- **Preconditions:** None.
- **Steps:**
  1. Open `/customer/account/create/`.
- **Expected Result:** Form renders with required fields marked. **Do not submit.**

### TC-ACC-5: My-account redirects unauthenticated users to login
- **Priority:** P1
- **Module(s):** Magento customer ACL
- **Preconditions:** Logged out.
- **Steps:**
  1. Navigate directly to `/customer/account/`.
- **Expected Result:** Redirected to login with a flash message or referrer query param.

---

## 10. CMS / Footer Pages (TC-CMS)

### TC-CMS-1: All footer CMS pages load with HTTP 200
- **Priority:** P0
- **Module(s):** Magento CMS
- **Preconditions:** None.
- **Steps:**
  1. Open each: Bestellen, Bezorgen, B2B (Zakelijk), Privacy, Voorwaarden, Cookies, Retourneren, Reviews, Kennisbank, Blog, Vacatures, Contact.
- **Expected Result:** All return 200 with `<h1>` and non-placeholder body.

### TC-CMS-2: Internal links inside CMS pages resolve
- **Priority:** P1
- **Module(s):** CMS pages
- **Preconditions:** Open Bezorgen and Retourneren.
- **Steps:**
  1. Click each in-page link.
- **Expected Result:** All resolve 200 within allprepare.com; external links open in new tab where used.

### TC-CMS-3: Knowledge Base (Kennisbank) — index and articles
- **Priority:** P1
- **Module(s):** Mirasvit Blog / CMS
- **Preconditions:** None.
- **Steps:**
  1. Open Kennisbank index.
  2. Open one article.
- **Expected Result:** Index lists articles; article page renders with title, body, related links.

### TC-CMS-4: Blog (Mirasvit) — list and post
- **Priority:** P1
- **Module(s):** `Mirasvit_Blog`
- **Preconditions:** None.
- **Steps:**
  1. Open blog index.
  2. Open one post.
- **Expected Result:** Pagination if available, post renders with title, author/date, comments section (if enabled).

### TC-CMS-5: Contact page form validation
- **Priority:** P2
- **Module(s):** Magento contact
- **Preconditions:** None.
- **Steps:**
  1. Open Contact.
  2. Submit empty form (do not complete).
- **Expected Result:** Required-field validation triggered. Do not actually submit a real message.

### TC-CMS-6: Privacy + Cookies pages match Amasty GDPR consent config
- **Priority:** P1
- **Module(s):** CMS + `Amasty_GdprCookie`
- **Preconditions:** None.
- **Steps:**
  1. Open Cookies page; cross-check listed cookie categories with what the consent banner shows.
- **Expected Result:** Categories listed on page match banner toggles (Strictly necessary, Analytics, Marketing, etc.).

---

## 11. Tracking Page (TC-TRK)

### TC-TRK-1: GLS tracking — valid Dutch parcel
- **Priority:** P1
- **Module(s):** `XInteractive_TrackingPage` → `Controller/Index/Gls.php`
- **Preconditions:** None.
- **Steps:**
  1. Navigate to `/tracking/index/gls?parcelnr=12345&postcode=1011AA&language=nl`.
- **Expected Result:** Redirect to GLS-NL tracking URL with the parameters. If parcel does not exist, GLS shows its own "not found" page — that is acceptable.

### TC-TRK-2: Missing parameters
- **Priority:** P1
- **Module(s):** `XInteractive_TrackingPage`
- **Preconditions:** None.
- **Steps:**
  1. Navigate to `/tracking/index/gls` (no params).
- **Expected Result:** Friendly error or form prompt — not a 500 / stack trace.

### TC-TRK-3: Tampered language parameter
- **Priority:** P2
- **Module(s):** `XInteractive_TrackingPage`
- **Preconditions:** None.
- **Steps:**
  1. Navigate with `language=xx` or `language=<script>`.
- **Expected Result:** No redirect to a hostile target; falls back to default / shows error. No script execution.

### TC-TRK-4: Tracking page is not indexed by search engines
- **Priority:** P2
- **Module(s):** Robots / theme
- **Preconditions:** None.
- **Steps:**
  1. View-source on `/tracking/index/gls?parcelnr=X&postcode=Y` (with any params).
- **Expected Result:** `<meta name="robots" content="noindex,nofollow">` (or equivalent) — tracking is a utility page and should not be indexed.

---

## 12. Reviews Surface (TC-REV)

### TC-REV-1: Reviews footer block present site-wide
- **Priority:** P2
- **Module(s):** `XInteractive_Reviews` → `view/frontend/layout/default.xml`
- **Preconditions:** None.
- **Steps:**
  1. Confirm a "shop review" block in the footer on Home, Category, PDP, Cart.
- **Expected Result:** Block renders with score and review count.

### TC-REV-2: PDP review count > 0 on bestseller PDPs
- **Priority:** P1
- **Module(s):** `XInteractive_Reviews` hourly import cron
- **Preconditions:** Three top-selling PDPs.
- **Steps:**
  1. Note review counts on each.
- **Expected Result:** All non-zero. Two or more PDPs at zero is a likely cron-import issue → P1.

### TC-REV-3: Schema.org review markup in JSON-LD
- **Priority:** P1
- **Module(s):** `BerkeyExpert_SeoRichData`
- **Preconditions:** PDP with reviews.
- **Steps:**
  1. View-source for `application/ld+json`.
- **Expected Result:** `Product` JSON-LD contains `aggregateRating` and/or `review` array.

### TC-REV-4: Review submission UI (read-only)
- **Priority:** P2
- **Module(s):** Magento review form or third-party
- **Preconditions:** PDP.
- **Steps:**
  1. Locate "Schrijf een review" link or form.
- **Expected Result:** Form renders. **Do not submit.**

---

## 13. Performance — Core Web Vitals (TC-PERF)

> Use Chrome DevTools Lighthouse with default settings (Desktop preset for desktop runs, Mobile preset for the one mobile PageSpeed cross-check).

### TC-PERF-1: Homepage Lighthouse Desktop
- **Priority:** P1
- **Module(s):** All theme + bundles
- **Preconditions:** Incognito, no extensions, clear cache.
- **Steps:**
  1. Run Lighthouse → Desktop on homepage.
- **Expected Result:** Performance ≥ 90, LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms.

### TC-PERF-2: PDP Lighthouse Desktop
- **Priority:** P1
- **Preconditions:** Pick a bestseller PDP.
- **Steps:**
  1. Run Lighthouse → Desktop.
- **Expected Result:** Performance ≥ 85; LCP ≤ 2.5s; CLS ≤ 0.1.

### TC-PERF-3: Category Lighthouse Desktop
- **Priority:** P1
- **Steps:**
  1. Lighthouse on Bestsellers category.
- **Expected Result:** Performance ≥ 85.

### TC-PERF-4: Cart + Checkout step 1 Lighthouse
- **Priority:** P2
- **Steps:**
  1. Lighthouse on `/checkout/cart/`.
  2. Lighthouse on the checkout entry page.
- **Expected Result:** Performance ≥ 75 (checkout commonly lower due to forms/payment scripts); no critical issues flagged.

### TC-PERF-5: Magepack bundles loaded once
- **Priority:** P2
- **Module(s):** `magepack.config.js`
- **Preconditions:** DevTools Network, JS filter.
- **Steps:**
  1. Cold-cache load of homepage.
  2. Confirm `common*.js` (and `checkout*.js` on checkout) loads exactly once.
- **Expected Result:** Bundle requested once. No duplicate Magento/jQuery loads (Hyva theme should be jQuery-free; flag if jQuery loads on non-checkout pages).

### TC-PERF-6: Images use lazy-loading
- **Priority:** P2
- **Module(s):** Theme + Jajuma image optimizer
- **Preconditions:** Long category page.
- **Steps:**
  1. View-source on a category; search `loading=`.
- **Expected Result:** Off-screen `<img>` elements have `loading="lazy"`. Above-the-fold may be `eager`.

### TC-PERF-7: TTFB
- **Priority:** P2
- **Preconditions:** DevTools Network.
- **Steps:**
  1. Cold load homepage; record document TTFB.
  2. Reload (warm) and record again.
- **Expected Result:** Warm TTFB ≤ 600ms. Cold ≤ 1500ms acceptable depending on CDN/cache.

### TC-PERF-8: Cross-check Mobile PageSpeed (single run, informational)
- **Priority:** P2
- **Preconditions:** https://pagespeed.web.dev/
- **Steps:**
  1. Run PageSpeed Insights against homepage with Mobile profile.
- **Expected Result:** Mobile score ≥ 75. Document field data (CrUX) if available.

---

## 14. SEO & Structured Data (TC-SEO)

### TC-SEO-1: Unique `<title>` per page type
- **Priority:** P1
- **Module(s):** Magento + theme
- **Preconditions:** Home, Category, PDP, CMS.
- **Steps:**
  1. View-source `<title>` on each.
- **Expected Result:** All four titles differ, each ≤ 60 chars where practical, contain brand suffix.

### TC-SEO-2: Meta description present and non-duplicate
- **Priority:** P1
- **Preconditions:** Same four pages.
- **Steps:**
  1. Inspect `<meta name="description">` on each.
- **Expected Result:** All four are non-empty, distinct, 50–160 chars.

### TC-SEO-3: Canonical tag on every page
- **Priority:** P1
- **Preconditions:** Home, Category (page 2), PDP, Search results.
- **Steps:**
  1. View-source `<link rel="canonical">`.
- **Expected Result:** Canonical URL points to a clean version of the page. Category page 2 should canonicalize to itself or to page 1 per chosen strategy; flag if it points to a different domain or query-fragment.

### TC-SEO-4: hreflang behavior on single-locale store
- **Priority:** P1
- **Module(s):** `XInteractive_HrefLangTags`
- **Preconditions:** CMS page that may have `hreflang_tag` set.
- **Steps:**
  1. View-source for `link rel="alternate" hreflang=...`.
- **Expected Result:** Either no hreflang tags (single-locale) or, if present, target valid `https://` URLs that return 200 with `lang="nl"` / matching language. Conflicting hreflang to dead URL = P1.

### TC-SEO-5: Robots meta — `max-image-preview:large`
- **Priority:** P2
- **Module(s):** `BerkeyExpert_RobotsModifier` → `Plugin/PageConfigPlugin.php`
- **Preconditions:** None.
- **Steps:**
  1. View-source on Home and PDP for `<meta name="robots">`.
- **Expected Result:** Includes `max-image-preview:large`. Indexable pages do not contain `noindex`.

### TC-SEO-6: JSON-LD Product on PDP
- **Priority:** P1
- **Module(s):** `BerkeyExpert_SeoRichData` (extends Amasty SEO)
- **Preconditions:** Any PDP.
- **Steps:**
  1. View-source; extract `application/ld+json`.
  2. Paste into https://validator.schema.org.
- **Expected Result:** Validates as `Product` with `name`, `image`, `description`, `sku`, `offers` (with `price`, `priceCurrency=EUR`, `availability`), `aggregateRating` where reviews exist.

### TC-SEO-7: JSON-LD BreadcrumbList on PDP and Category
- **Priority:** P1
- **Preconditions:** PDP, Category.
- **Steps:**
  1. Find `BreadcrumbList` block in JSON-LD.
- **Expected Result:** Items mirror the visible breadcrumb trail.

### TC-SEO-8: JSON-LD Organization + WebSite on homepage
- **Priority:** P2
- **Preconditions:** Homepage.
- **Steps:**
  1. View-source; inspect JSON-LD.
- **Expected Result:** `Organization` with name/logo/sameAs, `WebSite` with `potentialAction` SearchAction.

### TC-SEO-9: `robots.txt` reachable and sane
- **Priority:** P1
- **Steps:**
  1. `curl https://www.allprepare.com/robots.txt`.
- **Expected Result:** 200; disallows admin/search/checkout paths; references `sitemap.xml`.

### TC-SEO-10: `sitemap.xml` reachable and URLs return 200
- **Priority:** P1
- **Steps:**
  1. `curl https://www.allprepare.com/sitemap.xml` (or whichever path is in robots.txt).
  2. Pick 25 product URLs and 10 category URLs; `curl -I` each.
- **Expected Result:** Sitemap parses, all 35 spot-checked URLs return 200.

### TC-SEO-11: UrlCleaner strips UTM/fbclid via 301
- **Priority:** P1
- **Module(s):** `BerkeyExpert_UrlCleaner` → `Observer/CleanUrl.php`
- **Steps:**
  1. `curl -I "https://www.allprepare.com/?utm_source=qa&fbclid=abc"`.
- **Expected Result:** HTTP 301 to the clean URL without those parameters. Verify in browser the URL bar updates and the destination renders normally.

### TC-SEO-12: Pagination — `rel="prev"`/`rel="next"` or canonical strategy
- **Priority:** P2
- **Preconditions:** Category with pagination.
- **Steps:**
  1. View-source on page 1 and page 2.
- **Expected Result:** Either rel="prev/next" link tags or a documented self-canonical strategy. Inconsistency between pages is P2.

---

## 15. Accessibility — WCAG 2.1 AA (TC-A11Y)

> Use Chrome DevTools "Accessibility" panel plus the axe DevTools extension.

### TC-A11Y-1: axe scan — Homepage
- **Priority:** P1
- **Preconditions:** axe DevTools installed.
- **Steps:**
  1. Run axe on the homepage.
- **Expected Result:** Zero "Serious" or "Critical" issues. "Moderate" tracked as P2.

### TC-A11Y-2: axe scan — Category, PDP, Cart, Checkout
- **Priority:** P1
- **Steps:**
  1. axe each in turn.
- **Expected Result:** Zero "Serious"/"Critical". Document any AddToCartPopup or modal-related findings.

### TC-A11Y-3: Keyboard-only navigation — top nav and footer
- **Priority:** P1
- **Preconditions:** Mouse not used.
- **Steps:**
  1. Press Tab from page load; traverse to the first product card and into footer.
- **Expected Result:** Every interactive element is reachable, focus indicator clearly visible, focus order matches visual order.

### TC-A11Y-4: AddToCartPopup focus trap and Escape
- **Priority:** P1
- **Module(s):** `XInteractive_AddToCartPopup`
- **Steps:**
  1. From PDP, open the popup via Enter on Add-to-cart.
  2. Tab repeatedly.
  3. Shift+Tab.
  4. Escape.
- **Expected Result:** Focus stays within the modal in both directions; Escape closes and returns focus to the trigger.

### TC-A11Y-5: Mini-cart drawer keyboard accessibility
- **Priority:** P2
- **Steps:**
  1. Activate mini-cart with Enter on its trigger.
  2. Tab through drawer contents.
- **Expected Result:** All controls (remove, qty, link) reachable and operable; Escape closes drawer.

### TC-A11Y-6: Image alt text on PDP gallery
- **Priority:** P2
- **Preconditions:** Multi-image PDP.
- **Steps:**
  1. Inspect each `<img>` for `alt`.
- **Expected Result:** All product images have meaningful alt text (not empty, not "image"). Decorative icons may use `alt=""`.

### TC-A11Y-7: Form labels associated
- **Priority:** P1
- **Preconditions:** Checkout customer block + Contact form.
- **Steps:**
  1. Inspect each input has `<label for>` or `aria-label`.
- **Expected Result:** Every input has an associated accessible name. axe rule `label` passes.

### TC-A11Y-8: Color contrast on key UI surfaces
- **Priority:** P2
- **Preconditions:** DevTools color-contrast picker.
- **Steps:**
  1. Sample contrast on: discount badges, USP bar text, primary buttons, footer text, low-stock warning.
- **Expected Result:** Text contrast ≥ 4.5:1 (normal) / 3:1 (large). Document any below threshold.

---

## 16. Security & Privacy (TC-SEC)

### TC-SEC-1: HTTPS enforced
- **Priority:** P0
- **Steps:**
  1. `curl -I http://www.allprepare.com/`.
- **Expected Result:** 301 to `https://`. No content served over HTTP.

### TC-SEC-2: HSTS header present
- **Priority:** P1
- **Steps:**
  1. `curl -I https://www.allprepare.com/`.
- **Expected Result:** `Strict-Transport-Security` header with `max-age` ≥ 15552000 (6 months). `includeSubDomains` preferred.

### TC-SEC-3: Security headers — CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy
- **Priority:** P1
- **Steps:**
  1. `curl -I https://www.allprepare.com/`.
- **Expected Result:**
  - `X-Frame-Options: SAMEORIGIN` (or CSP `frame-ancestors`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin` or stricter
  - `Content-Security-Policy` present (even report-only is acceptable; absence = P1)

### TC-SEC-4: Magento admin path not exposed at `/admin`
- **Priority:** P0
- **Steps:**
  1. `curl -I https://www.allprepare.com/admin`.
  2. `curl -I https://www.allprepare.com/admin/`.
- **Expected Result:** 404 or 301 to a non-admin page. A live Magento admin login at `/admin` is a P0 finding.

### TC-SEC-5: Sensitive files not reachable
- **Priority:** P0
- **Steps:**
  1. `curl -I` each of:
     - `https://www.allprepare.com/.git/HEAD`
     - `https://www.allprepare.com/.env`
     - `https://www.allprepare.com/app/etc/env.php`
     - `https://www.allprepare.com/composer.json`
     - `https://www.allprepare.com/composer.lock`
- **Expected Result:** All return 403 or 404. Any 200 with content = P0.

### TC-SEC-6: GDPR cookie consent banner — first visit
- **Priority:** P0
- **Module(s):** `Amasty_GdprCookie`
- **Preconditions:** Fresh incognito (no prior consent cookie).
- **Steps:**
  1. Open homepage.
  2. Observe banner.
- **Expected Result:** Banner visible above the fold; cannot be bypassed by closing without choice; "Accepteren" / "Weigeren" / "Voorkeuren" available.

### TC-SEC-7: GDPR — no non-essential cookies before consent
- **Priority:** P0
- **Preconditions:** Fresh incognito; DevTools Application → Cookies.
- **Steps:**
  1. Load homepage; do not click banner.
  2. Inspect cookies and storage.
- **Expected Result:** Only strictly-necessary cookies present (PHPSESSID/form_key/X-Magento-Vary). No GA4 `_ga`, no Mailchimp, no Facebook pixel cookies before consent. Network tab should also show no requests to analytics endpoints before consent.

### TC-SEC-8: GDPR — "Reject all" persists across navigation
- **Priority:** P1
- **Preconditions:** Fresh incognito.
- **Steps:**
  1. Click "Weigeren".
  2. Browse 3 pages.
  3. Inspect cookies again.
- **Expected Result:** Choice persisted (no banner re-appearing). No non-essential cookies set after reject.

### TC-SEC-9: GDPR — "Manage preferences" toggles work
- **Priority:** P2
- **Steps:**
  1. Open preferences.
  2. Enable Analytics only; save.
  3. Reload.
- **Expected Result:** GA4 cookies set; marketing pixels not set. Selection persists.

### TC-SEC-10: Forms expose `form_key` CSRF token
- **Priority:** P1
- **Preconditions:** Newsletter form, Contact form, Login form.
- **Steps:**
  1. View-source each form.
- **Expected Result:** Hidden input `form_key` present and non-empty. Absence on any state-changing form is P1.

### TC-SEC-11: No PII in URLs after form interactions
- **Priority:** P1
- **Preconditions:** Checkout.
- **Steps:**
  1. Walk through filling email, name, address.
  2. Watch the URL bar.
- **Expected Result:** No email, postcode, or name appears in URL (`GET`) or in `Referer` headers sent to third parties (DevTools Network → check outgoing third-party requests).

---

## 17. Defect Log Template

Use this template per defect found. Track in a spreadsheet or issue tracker.

| ID | Date | TC | Severity | Browser | URL | Steps | Expected | Actual | Screenshot/HAR | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DEF-001 | 2026-05-11 | TC-PDP-5 | P0 | Chrome 124 Desktop | /product-x | Select combo A → add | Price updates | Price stays at base | [link] | Open |

---

## Appendix A — Quick Smoke (P0 only)

When a full pass is impractical, run only:
- TC-GLB-1, TC-GLB-2, TC-GLB-6
- TC-HOME-1
- TC-CAT-1
- TC-PDP-1, TC-PDP-2, TC-PDP-5, TC-PDP-6
- TC-SRCH-2
- TC-CART-1, TC-CART-2, TC-CART-3
- TC-CKO-1, TC-CKO-2, TC-CKO-3, TC-CKO-6, TC-CKO-8
- TC-CMS-1
- TC-SEC-1, TC-SEC-4, TC-SEC-5, TC-SEC-6, TC-SEC-7

That subset (~23 cases) covers revenue-critical paths and the highest-impact security checks in roughly 60–90 minutes.

## Appendix B — Source Code References

| Area | Path |
|---|---|
| Combinations | `app/code/XInteractive/Combinations/` |
| FreeProducts | `app/code/XInteractive/FreeProducts/` |
| AddToCartPopup | `app/code/XInteractive/AddToCartPopup/view/frontend/layout/catalog_product_view.xml` |
| DeliveryRules | `app/code/XInteractive/DeliveryRules/` (+ `etc/webapi.xml`) |
| StockStatus | `app/code/XInteractive/StockStatus/view/frontend/layout/catalog_product_view.xml` |
| Reviews (cron + footer) | `app/code/XInteractive/Reviews/` |
| TrackingPage | `app/code/XInteractive/TrackingPage/Controller/Index/Gls.php` |
| HrefLangTags | `app/code/XInteractive/HrefLangTags/Block/Display.php` |
| SeoRichData | `app/code/BerkeyExpert/SeoRichData/etc/di.xml` |
| RobotsModifier | `app/code/BerkeyExpert/RobotsModifier/Plugin/PageConfigPlugin.php` |
| UrlCleaner | `app/code/BerkeyExpert/UrlCleaner/Observer/CleanUrl.php` |
| ListCategories | `app/code/BerkeyExpert/ListCategories/view/frontend/layout/catalog_category_view.xml` |
| Postcode API | `app/code/Experius/Postcode/etc/webapi.xml` |
| Module baseline | `app/etc/config.php` |
| Bundle config | `magepack.config.js` |

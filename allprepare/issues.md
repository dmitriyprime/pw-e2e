# AllPrepare E2E — Issues from Playwright Run (2026-05-12)

Source: `tests/e2e/reports/results.json` + `tests/e2e/test-results/*/error-context.md`
Target: production `https://www.allprepare.com` (read-only, no Place Order)
Run summary: **52 TCs mapped, 21 passed, 19 failed, 12 skipped** (8 TC-PERF not run inline; TC-PERF-4 was caught when perf ran separately).

Issues are grouped into four categories:
- **A — Real production bugs** the suite detected on the live site.
- **B — Test-side issues** (selector / regex tuning needed in spec files; not a real defect).
- **C — Cascade-skipped** (no signal; consequence of `describe.serial` + an earlier failure).
- **D — Test infrastructure** (suite or environment, not a product bug).

Each issue lists: affected TC(s), severity, what the suite saw, likely cause, manual verification steps (Chrome 130 desktop, incognito, no extensions unless noted), and a suggested fix.

---

## Category A — Real production bugs

### A-1. WCAG 2.1 AA — Serious color-contrast violations on orange UI (theme-wide)
- **TCs:** TC-A11Y-1, TC-A11Y-2a/2b/2c/2d, TC-A11Y-8
- **Severity:** P1 (six tests fail; affects accessibility/legal compliance)
- **What the suite saw:** axe-core flagged `color-contrast` `serious` impact on every page scanned (homepage 172, category 587, PDP 168, cart 61, checkout 61 nodes). Two distinct offenders dominate:
  - **Discount badges** (e.g. "21% korting"): `<div class="… bg-orange-500 … text-white">`, computed `#ffffff` on `#fc8c2f`, ratio **2.35:1** (required 4.5:1).
  - **Newsletter "Inschrijven" button**: white text on `#fc8c2f` with `text-shadow: #f3872d`, foreground-on-shadow ratio **2.52:1** (required 4.5:1).
- **Likely cause:** Tailwind primary orange palette in `app/design/frontend/allprepare/base/web/tailwind/` was picked for brand consistency but is too light for white text at body/badge sizes.
- **Manual verification steps:**
  1. Open Chrome → install/enable axe DevTools extension (deque.com).
  2. Visit `https://www.allprepare.com/`. Open DevTools → axe panel → **Scan all of my page**.
  3. Filter by **Serious**. Confirm `color-contrast` rule fails on the orange newsletter "Inschrijven" button.
  4. Inspect the button. In Computed → Color → click the contrast preview swatch. Confirm ratio shown is **2.52:1** vs target 4.5:1.
  5. Navigate to `https://www.allprepare.com/bestsellers`. Re-scan; confirm orange discount badges ("21% korting", "10% korting", etc.) fail the same rule with ratio **2.35:1**.
  6. Repeat on a PDP (e.g. `/big-berkey-waterfilter`), `/checkout/cart/`, `/checkout/`. Each shows the same offender(s).
- **Suggested fix:** Darken the badge/button background from `#fc8c2f` to `#c46410` (or equivalent Tailwind `orange-700`) which yields ≥4.5:1 against white. One Tailwind config edit in the theme; re-run `npm run test:a11y` to verify.

---

### A-2. Tracking page is indexable (missing `noindex`) — **CONFIRMED on real URL**
- **TCs:** TC-TRK-4
- **Severity:** **P1** (SEO/privacy leak — tracking URLs include postcodes AND parcel numbers; Google indexing them exposes customer data)
- **What the suite saw + live verification on the real route (`/tracking/index/gls?parcelnr=…&postcode=…&language=NL`):**
  ```
  HTTP/2 200
  <meta name="robots" content="max-image-preview:large, INDEX, FOLLOW"/>
  ```
  test_plan.md §11 TC-TRK-4 explicitly expects `noindex` on this page. The live response advertises `INDEX, FOLLOW`.
- **Likely cause:** `BerkeyExpert_RobotsModifier` (`Plugin/PageConfigPlugin.php`, per CLAUDE.md §"BerkeyExpert") sets the site-wide `max-image-preview:large, INDEX, FOLLOW` default. The tracking page is not on its exclusion list, so it inherits the default. Alternatively, `XInteractive_TrackingPage`'s `Controller/Index/Gls.php:48` returns `resultPageFactory->create()` without ever calling `setRobots('NOINDEX,NOFOLLOW')` on the resulting `\Magento\Framework\View\Result\Page`.
- **Manual verification steps:**
  1. Incognito → visit `https://www.allprepare.com/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL`.
  2. View-source (Ctrl+U). Search for `name="robots"`.
  3. Confirm content attribute contains `INDEX, FOLLOW` (current) — should be `NOINDEX, NOFOLLOW`.
  4. Cross-check Google: search `site:allprepare.com/tracking` and `inurl:parcelnr` in Google. Any results = the leak has already happened.
  5. Try the language variants too (`language=FR/BE/DE`) — those redirect (`Gls.php:28-46`) so are not at risk, but confirm.
- **Suggested fix (preferred — at the controller, scoped):** In `app/code/XInteractive/TrackingPage/Controller/Index/Gls.php:48`, change:
  ```php
  return $this->resultPageFactory->create();
  ```
  to:
  ```php
  $page = $this->resultPageFactory->create();
  $page->getConfig()->setRobots('NOINDEX,NOFOLLOW');
  return $page;
  ```
  Constructor-injected `PageFactory` is already present (`Gls.php:15`); no DI change needed.
- **Alternative fix (broader, theme-side):** Add `tracking_index_gls` to `BerkeyExpert_RobotsModifier`'s noindex handle list so the tracking page is overridden regardless of which controller renders it.

---

### A-3. ~~`/tracking?parcel=X&lang=Y` returns HTTP 404~~ → RECLASSIFIED as **test-side bug** (see B-5)
- **Status:** Reclassified 2026-05-12 after source-code inspection.
- **Original symptom (real):** `GET /tracking?parcel=12345&lang=nl` → 404.
- **Why this is not a product bug:** The TrackingPage module's real route is `tracking/index/gls` (see `etc/frontend/routes.xml:4` and `Controller/Index/Gls.php`). The controller expects parameters `parcelnr`, `postcode`, `language` — NOT `parcel`, `lang`. `/tracking` (root) 404s because no `index/index` action exists — that is standard Magento routing behavior.
- **Independently verified live (2026-05-12):**
  - `GET /tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL` → **200 OK** ✅
  - `GET /tracking/index/gls` (missing required params) → **302 redirect to `/`** ✅ (graceful, per `Gls.php:23-26`)
- **Bonus discovery:** The original TC-TRK-2 in our suite passed with `status < 500` against `/tracking` — but `/tracking` actually returns **404**. This was a false positive that hid the test-URL bug. Tightening the assertion to `< 400` would have caught it.
- **Tracked further under:** **B-5** (test-side fix for `06-tracking-reviews.spec.ts`).

---

### A-4. Checkout email validation does not fire on blur (or error markup mismatched)
- **TCs:** TC-CKO-2 (also cascade-skipped TC-CKO-3..12)
- **Severity:** P2 (real UX issue if validation never fires before submit)
- **What the suite saw:** Filled `customer-email` with `"not-an-email"`, blurred the field, waited 5s — no element matching the selectors `[id*='email-error']`, `.mage-error`, `[class*='error']:near(...)` appeared.
- **Likely cause:** Two possibilities:
  - **Test selector miss:** OneStepCheckout (`iosc 1.2.060`) renders validation errors in a Knockout-bound container whose class/ID the test didn't anticipate.
  - **Real bug:** Validation only triggers on submit, not on blur. test_plan.md §8 TC-CKO-2 expects a blur-time error.
- **Manual verification steps:**
  1. Visit a PDP, add to cart, go to `https://www.allprepare.com/checkout/` with the cart populated.
  2. Open DevTools → Elements panel.
  3. Click into the email input, type `not-an-email`, then click outside to blur.
  4. **Expected:** A red message appears beneath the email field within ~1s.
  5. **If nothing appears:** type something valid then invalid, watch the DOM diff in DevTools for any node insertion under the form. If a node IS inserted, capture its selector and update the spec. If nothing is inserted, this is a real product bug — validation needs to be wired on blur.
- **Suggested fix:**
  - If product bug: add `data-validate="{required:true, 'validate-email':true}"` (or the OneStepCheckout equivalent) to the email field, OR a Knockout subscriber that re-validates on `blur`.
  - If selector miss: update `tests/e2e/specs/04-checkout.spec.ts:33` to target the actual error container.

---

### A-5. Cart + Checkout Lighthouse — best-practices 56, SEO 58 (well below threshold)
- **TCs:** TC-PERF-4 (sub-step b)
- **Severity:** P2 (production performance / quality)
- **What the suite saw:**
  ```
  best-practices: 56  (threshold 80)
  seo:            58  (threshold 90)
  ```
  Run via `playwright-lighthouse` against `/checkout/`.
- **Likely cause:** Typical Magento OSC anti-patterns Lighthouse flags as best-practices issues: console errors, mixed content, deprecated APIs, no-referrer-when-downgrade fallbacks, third-party payment scripts loaded eagerly. SEO score low is often due to missing meta description on checkout, blocked-from-indexing not signalled correctly, or low-contrast text (we have that — see A-1).
- **Manual verification steps:**
  1. Chrome incognito, DevTools → Lighthouse panel → **Desktop** → categories: Performance + Best Practices + SEO. Run on `https://www.allprepare.com/checkout/` (after seeding a cart).
  2. Expect Best Practices ≈56, SEO ≈58. Drill into each red audit and capture the offender list.
  3. Common findings to verify: "Browser errors logged to the console", "Includes front-end JavaScript libraries with known security vulnerabilities", "Document does not have a meta description", "Tap targets are not sized appropriately".
- **Suggested fix:** Triage the specific audit list — many of these are one-line theme fixes (add meta description to checkout page config, defer Mollie SDK, etc.).

---

### A-6. Cloudflare Insights beacon CORS preflight rejected (production console error)
- **TCs:** TC-GLB-8 (homepage console errors)
- **Severity:** P3 (cosmetic — affects analytics, not user-visible)
- **What the suite saw:**
  ```
  Access to script at 'https://static.cloudflareinsights.com/beacon.min.js/...'
  from origin 'https://www.allprepare.com' has been blocked by CORS policy:
  Request header field x-test-suite is not allowed by Access-Control-Allow-Headers
  in preflight response.
  ```
  **Important nuance:** this error is *caused* by our test suite adding the `X-Test-Suite` request header. A real visitor without that header does NOT trigger this CORS preflight. So this is a **test artifact**, not a production bug — but I'm listing it under Category A so it isn't lost when the test header is removed.
- **Manual verification steps:**
  1. Incognito → `https://www.allprepare.com/` → DevTools → Console.
  2. Confirm **no** CORS errors when visiting normally (Cloudflare beacon should load fine without our `X-Test-Suite` header).
  3. The test-side fix is documented under **D-1** below.
- **Suggested fix:** None on the product side. See D-1.

---

## Category B — Test-side issues (selector / regex tuning)

These tests failed because the locator strings I used in spec files don't match the actual Hyva markup. They aren't product defects — they're tuning work for the test suite.

### B-1. Hyva mini-cart selector mismatch
- **TCs:** TC-CART-1, TC-CART-8, TC-GLB-2
- **Severity:** P2 (blocks three TCs)
- **What the suite saw:** `section[data-role='minicart']` and `[data-role='counter']` did not match any element in the live DOM on the homepage or PDP.
- **Likely cause:** Hyva replaces the Luma `<section data-role="minicart">` markup with its own Alpine-based component (often inside `<div x-data="initMiniCart()">` or similar — no `data-role` attribute).
- **Manual verification steps:**
  1. Visit `https://www.allprepare.com/`. Open DevTools → Elements → search for "cart" in the inspector.
  2. Find the mini-cart trigger (the bag/cart icon in the header). Note its tag, classes, and any `data-*` / `x-data` attributes.
  3. Find the counter span (the small number badge next to it). Note the same.
- **Suggested fix:** Update `fixtures/test-data.ts` `SELECTORS.miniCartCounter` to the actual Hyva selector (likely along the lines of `[x-data*='initMiniCart'] [x-text='cartItemCount']` or `header a[href*='checkout/cart'] span:visible`).

### B-2. Stock-status display selector mismatch (PDP)
- **TCs:** TC-PDP-3
- **Severity:** P3
- **What the suite saw:** `[data-role='stock-status'], .stock, [class*='in-stock'], [class*='out-of-stock']` matched nothing on `/big-berkey-waterfilter`.
- **Likely cause:** Hyva PDP renders stock as plain text inside a div (e.g. "Op voorraad") without an obvious class hook, or `XInteractive_StockStatus` uses a different markup.
- **Manual verification steps:**
  1. Visit `https://www.allprepare.com/big-berkey-waterfilter`.
  2. Locate the "Op voorraad" / stock indicator near the price.
  3. Right-click → Inspect; capture the actual element selector.
- **Suggested fix:** Update `tests/e2e/specs/02-pdp.spec.ts:19` selector. Likely simpler approach: assert the text "Op voorraad" or "Niet op voorraad" appears in the product info section.

### B-3. Delivery rules text regex mismatch (PDP)
- **TCs:** TC-PDP-4, TC-PDP-14
- **Severity:** P3
- **What the suite saw:** Regex `/voor.*besteld|leverdag|bezorgd|verzonden/i` did not match.
- **Likely cause:** The Dutch copy used by `XInteractive_DeliveryRules` differs from what the test expects (might use "morgen in huis" or "vandaag besteld" etc.).
- **Manual verification steps:**
  1. Visit `/big-berkey-waterfilter` and locate the delivery message. Copy the exact text.
  2. If the message contains "21:00", TC-PDP-14 passes after regex fix.
  3. Check `app/code/XInteractive/DeliveryRules/view/frontend/templates/` for the source phrasing.
- **Suggested fix:** Replace the regex with the actual phrase; or assert presence of the delivery message container (regardless of copy).

### B-5. Tracking-page tests use wrong URL and parameter names (+ false-positive TC-TRK-2)
- **TCs:** TC-TRK-1 (was Cat-A-3 in v1), TC-TRK-2 (was passing, but with a misleading assertion), TC-TRK-4 (the URL fix won't change A-2's outcome but lets the assertion target the real page)
- **Severity:** P2 (one false-positive, one false-negative; both need correcting)
- **What the suite saw + ground truth:** Specs in `tests/e2e/specs/07-tracking-reviews.spec.ts` use `/tracking?parcel=12345&lang=nl`. Real route per source inspection is `tracking/index/gls?parcelnr=<n>&postcode=<zip>&language=NL` (`etc/frontend/routes.xml:4`, `Controller/Index/Gls.php:23`). Also, `TC-TRK-2` asserts `status < 500`, which accepts 404 silently.
- **Manual verification steps:** None — this is a test-code edit.
- **Suggested fix:**
  ```ts
  // fixtures/test-data.ts
  tracking: '/tracking/index/gls',
  trackingValidParams: '?parcelnr=12345678&postcode=1011AB&language=NL',

  // 07-tracking-reviews.spec.ts
  test('[TC-TRK-1] tracking page renders with valid parcel + postcode + language', async ({ page }) => {
    const res = await page.goto(`${PATHS.tracking}${PATHS.trackingValidParams}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
  });

  test('[TC-TRK-2] tracking page redirects to home when parameters are missing', async ({ page }) => {
    const res = await page.goto(PATHS.tracking);  // graceful 302 → '/'
    expect(res?.status()).toBe(200);              // post-redirect lands on home
    expect(page.url()).toMatch(/allprepare\.com\/?$/);
  });

  test('[TC-TRK-4] tracking page is noindex', async ({ page }) => {
    await page.goto(`${PATHS.tracking}${PATHS.trackingValidParams}`);
    const robots = await page.locator("meta[name='robots']").getAttribute('content');
    expect(robots?.toLowerCase()).toContain('noindex');  // will fail until A-2 is fixed — that's correct
  });
  ```

---

### B-4. Playwright text regex inside chained CSS selector (parse error)
- **TCs:** TC-CAT-3, TC-CMS-5, TC-REV-1
- **Severity:** P2 (three tests blocked by the same syntax bug)
- **What the suite saw:**
  ```
  Error: Unexpected token "/" while parsing css selector
  "aside:has-text(/filter|prijs/i), [class*='shopby'], …"
  ```
  Playwright's `:has-text()` engine accepts regex-style arguments — but not when combined with a comma-chained CSS selector list. The comma forces the whole string into pure CSS-grammar mode, where `/regex/` is invalid.
- **Likely cause:** Test author (me) mixed two locator dialects.
- **Manual verification steps:** none — this is purely a test-code error.
- **Suggested fix:** Split the locator into separate Playwright locators ORed via `.or()`:
  ```ts
  const shopby = page.locator("aside").filter({ hasText: /filter|prijs/i })
    .or(page.locator("[class*='shopby'], #layered-filter-block, [data-role='filter']")).first();
  ```
  Apply the same refactor in `05-category.spec.ts:11`, `06-newsletter-forms.spec.ts:26`, and `07-tracking-reviews.spec.ts:40`.

---

## Category C — Cascade-skipped (no real signal yet)

### C-1. TC-CKO-3..12 skipped because of `describe.serial` + TC-CKO-2 failure
- **TCs:** TC-CKO-3, 4, 5, 6, 7, 8, 9, 10, 11, 12 (10 cases)
- **Severity:** P2 (10 high-value TCs blocked from running)
- **What the suite saw:** Playwright's `test.describe.serial(...)` aborts subsequent tests in the block when one fails. TC-CKO-2 failed → TC-CKO-3..12 marked `skipped`.
- **Manual verification steps:** Once TC-CKO-2 is fixed (or its describe block is changed), re-run `npm run test:checkout`. All ten should execute.
- **Suggested fix:** Change `test.describe.serial(...)` → `test.describe(...)` in `tests/e2e/specs/04-checkout.spec.ts:10`. The serial ordering was only there to seed the cart via `beforeAll`; the beforeAll already runs regardless of test order, so serial isn't needed.

### C-2. TC-CART-2 explicitly test-skipped (empty cart prerequisite)
- **TCs:** TC-CART-2
- **Severity:** P3
- **What the suite saw:** Skipped via `test.skip(true, 'cart is empty')` when the prior add-to-cart didn't actually populate the cart (because of B-1).
- **Manual verification steps:** None — will run automatically once B-1 is fixed.

### C-3. TC-CAT-4 conditionally skipped (sort control absent)
- **TCs:** TC-CAT-4
- **Severity:** P3
- **What the suite saw:** `select[id*='sort'], select[name*='sort']` not visible within 4s.
- **Likely cause:** Hyva may render sort as a button-group rather than a `<select>`.
- **Manual verification steps:**
  1. Visit `https://www.allprepare.com/bestsellers`.
  2. Locate the "Sort by" control above the product grid. Capture its actual element type and selector.
- **Suggested fix:** Update the selector in `05-category.spec.ts:21` to match Hyva's actual sort widget.

---

## Category D — Test infrastructure

### D-1. `X-Test-Suite` header causes Cloudflare Insights CORS preflight failure
- **TCs:** Affects TC-GLB-8 (and any future console-error assertion)
- **Severity:** P3 (cosmetic for the suite; trade-off discussion needed)
- **What the suite saw:** The custom header added in `playwright.config.ts:40` triggers a CORS preflight (`OPTIONS`) request that Cloudflare's `static.cloudflareinsights.com` rejects because its `Access-Control-Allow-Headers` doesn't include `x-test-suite`.
- **Why it's a trade-off:** The `X-Test-Suite` header was added so your GA4/Analytics pipeline could filter test traffic out of dashboards (CLAUDE.md mentions `BerkeyExpert_EnhancedAnalytics`). Removing it makes analytics filtering harder; keeping it makes TC-GLB-8 fail with a noise error.
- **Manual verification steps:** None — pure infra choice.
- **Suggested fix (pick one):**
  - **Option A** (recommended): Keep the header, but filter Cloudflare-beacon CORS errors out of the TC-GLB-8 console-error assertion. Already partially done (we filter `favicon|ServiceWorker`); extend the regex to `/favicon|ServiceWorker|cloudflareinsights|beacon/i`. Edit at `07-tracking-reviews.spec.ts:17`.
  - **Option B**: Remove `extraHTTPHeaders` from `playwright.config.ts:39`. Lose analytics filtering ability.
  - **Option C**: Rename the header to something Cloudflare's CORS already allows (`User-Agent` suffix, or a query param `?qa=1`).

### D-2. `ALLOW_PROD_RUN` env guardrail currently disabled
- **Severity:** P2 (safety control off)
- **Where:** `tests/e2e/playwright.config.ts:8-13` — the guard block is commented out.
- **Impact:** Any contributor who runs `npm test` without realising will hit production. The fail-fast guard was designed to prevent that.
- **Manual verification steps:** None.
- **Suggested fix:** Re-enable the block when the suite is shared with other contributors or wired into CI. Local solo iteration is fine without it.

### D-3. Hyva renders off-canvas mobile nav in DOM on desktop viewports
- **Severity:** P3 (pattern, not a failure — already worked around)
- **TCs affected:** Originally TC-NAV (smoke), recurring throughout.
- **What the suite saw:** `header.page-header nav a` returned 23 elements where the *first* was hidden (off-canvas mobile menu).
- **Suggested fix:** Already applied — every header/footer locator in this suite must use `:visible` or `.filter({ visible: true })`. Document this in `README.md` so future contributors follow the convention.

---

## Manual re-verification checklist (high-priority items)

A QA tester should run these in order — most reveal real bugs in 60–90 minutes total:

1. **A-1 contrast scan** (15 min): axe DevTools on home / bestsellers / `/big-berkey-waterfilter` / `/checkout/cart/` / `/checkout/`. Capture all `serious` color-contrast violations into Jira/Linear.
2. **A-2 tracking robots** (3 min): view-source on `/tracking` and `/tracking?parcel=…&lang=…`. Capture meta robots content. Confirm with SEO owner whether this page should be index'd.
3. **A-3 tracking 404** (5 min): visit both URLs, confirm reproducer, capture HAR.
4. **A-4 checkout email blur** (10 min): repro on prod with throwaway cart; record DevTools screencast of the email input + DOM diff.
5. **A-5 Lighthouse checkout** (20 min): run Chrome DevTools Lighthouse on `/checkout/` (Desktop, Best Practices + SEO + Performance); export full report; triage red audits.
6. **B-1 / B-2 / B-3 selector capture** (15 min combined): for each failing locator, open the live page, find the real element, screenshot + paste its full opening tag into a follow-up ticket so the test author can patch the spec.

---

## Re-run after fixes

After the test-side fixes in B-1..B-4 + C-1 land:

```bash
cd tests/e2e
npm test                  # expect skipped count drops from 12 → ~0
npm run test:a11y         # will still fail until A-1 is fixed — that's the point
npm run test:perf         # captures TC-PERF-1..8 baselines
npm run results:patch     # regenerate the TC table for test_results.md
```

Pass rate target after one round of selector tuning + the `describe.serial` removal: roughly **40 passing / 6 failing (all real Category-A bugs) / 0 skipped**, plus 8 Lighthouse results.

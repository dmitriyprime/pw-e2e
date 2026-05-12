# AllPrepare E2E — Issues from Playwright Runs (2026-05-12)

Source: `tests/e2e/reports/results.json` + `tests/e2e/test-results/*/error-context.md`
Target: production `https://www.allprepare.com` (read-only, no Place Order)

## Run history

| Run | Scope | Wall-clock | Passed | Failed | Flaky | Skipped/Did-not-run | Mapped TCs |
|---|---|---|---|---|---|---|---|
| #1 (initial) | `--grep-invert=TC-PERF` (perf excluded) | 3.5 min | 21 | 19 | 0 | 12 | 52 |
| #2 (full) | All specs, `chromium-desktop` only | 6.9 min | 29 | 19 | 2 | 15 skipped + 14 did-not-run | 60 |
| **#3 (Tier-1 fixes applied)** | All specs, `chromium-desktop` only | **4.9 min** | **42** | **15** | **0** | **4 skipped + 4 did-not-run** | **60** |

**Delta from run #1 → run #2:**
- **+8 passes** — TC-PERF-1/2/3 (Lighthouse Desktop ≥90/≥85/≥85 on Home/PDP/Category) + TC-PDP-14 (time-of-day-dependent cutoff message visible).
- **+1 fail** — TC-PERF-4 confirmed (Cart+Checkout Best-Practices 56, SEO 58; same root as A-5).
- **+2 flaky** — TC-CKO-1 (passed on retry; cart-seed race), TC-CART-2 (passed on retry; cart state varied).
- **+1 new cascade** — TC-PERF-5..8 auto-skipped because `perf.spec.ts:35` uses `test.describe.serial` and TC-PERF-4 failed first. Same pattern as C-1. Logged as **C-4**.
- **Newly confirmed**: TC-PDP-14 passing now (was failing in run #1) reveals that the cutoff message is **time-of-day-dependent**, not a selector miss. See **E-1** under new "Flaky tests" category below.

**Delta from run #2 → run #3 (after Tier-1 fixes applied):**
- **+13 passes** — net unlock from the 9 Tier-1 edits.
  - C-1 (remove `describe.serial` in checkout): TC-CKO-4, 6, 7, 8, 9, 11 newly pass.
  - B-1 (Hyva `button#menu-cart-icon` + `span[x-text="cart.summary_count"]`): TC-CART-1, TC-GLB-2 newly pass.
  - B-2 (`.tag.tag--positive-inverted`): TC-PDP-3 newly passes.
  - B-4 (`.or()` instead of regex-in-CSS): TC-CAT-3, TC-CMS-5, TC-REV-1 newly pass.
  - B-5 (correct tracking URL `/tracking/index/gls`): TC-TRK-2 newly passes (graceful redirect to `/`).
- **−4 failures** — net (some new failures surfaced, see below).
- **−21 skipped/did-not-run** — most of the cascade noise cleared.
- **−2 min wall-clock** — `retries: 0` on perf + no checkout cascade-retry storms.
- **Predicted Tier-1 outcome:** ≈44 passing. **Actual:** 42. Within 2 of forecast.

**Newly exposed by run #3 (issues that were hidden under the noise of runs #1/#2):**
1. **C-4 was wrong** — `describe.configure({ mode: 'serial' })` aborts the block on first failure identically to `describe.serial(...)`. TC-PERF-5/6/7/8 still cascade-skipped after TC-PERF-4. See revised C-4 below.
2. **TC-CKO-5** DeliveryRules REST endpoint now returns **HTTP 400** (test expected 200/401/403). Logged as new **A-7**.
3. **TC-CKO-10** still uses the broken `:has-text(/regex/)` + comma CSS pattern — I missed one instance during the B-4 sweep. Logged as **B-4 follow-up**.
4. **TC-CKO-12 / TC-GLB-8** CORS preflight rejections now also surface from **`consentcdn.cookiebot.eu`** and **`morethanmedia.allprepare.com`** (GA4 collect endpoint), not just Cloudflare beacon. D-1 filter needs broadening.
5. **TC-CKO-12** also shows genuine **HTTP 400** resource errors on `/checkout/` unrelated to CORS — likely the same backend that returns 400 in A-7. Logged as **A-7 sub-finding**.
6. **TC-TRK-1** — the tracking page JS-redirects to `https://www.gls-info.nl/track-and-trace?parcelno=…&zipcode=…` (different domain). Earlier curl saw `200` only because curl doesn't execute JS. This reframes **A-2** noindex risk: the offending meta is only visible during the brief render-before-redirect window. Could still be indexable by Googlebot, but lower urgency than originally graded. Logged as **A-2 update**.
7. **TC-PDP-4** my `div.delivery[x-data*="initDeliveryStatus"]` selector didn't match: the `delivery` class and the `x-data="initDeliveryStatus()"` attribute are on different elements (sibling/parent), not the same div. Logged as **B-3 follow-up**.

## Categories
- **A — Real production bugs** the suite detected on the live site.
- **B — Test-side issues** (selector / regex tuning needed in spec files; not a real defect).
- **C — Cascade-skipped** (no signal; consequence of `describe.serial` + an earlier failure).
- **D — Test infrastructure** (suite or environment, not a product bug).
- **E — Flaky** (results vary between runs; need investigation or stabilisation).

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

### A-2. Tracking page is indexable (missing `noindex`) — **partially reframed in run #3**

**Update from run #3:** When Playwright executes JS on `/tracking/index/gls?…`, the page client-side redirects to `https://www.gls-info.nl/track-and-trace?parcelno=…&zipcode=…` (different external domain). Curl saw `200` with `INDEX, FOLLOW` because curl doesn't execute the redirect script. So the offending meta only exists during the brief render-before-redirect window. **Mitigating factor:** Googlebot typically does NOT follow JavaScript-based redirects for indexing, so the noindex omission may still result in `/tracking/index/gls?…` URLs being added to Google's index alongside parcel+postcode params. **Lowered severity: P2.** Still worth fixing.
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
- **Reproduced in:** Run #1 (perf only), Run #2 (full suite). Numbers stable across both runs.
- **Counter-evidence (good news from run #2):** Homepage, PDP, and Category Lighthouse runs PASSED their thresholds (`TC-PERF-1`: perf≥90 & SEO≥90 on `/`; `TC-PERF-2`: perf≥85 on PDP; `TC-PERF-3`: perf≥85 on Bestsellers category). So the perf problem is **scoped to cart/checkout**, not site-wide.
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

### A-7. DeliveryRules REST endpoint returns HTTP 400 (new in run #3)
- **TCs:** TC-CKO-5; also surfaces as sub-finding in TC-CKO-12 console errors
- **Severity:** P2 (real API behavior change vs original test_plan.md expectation)
- **What the suite saw:**
  ```
  GET /rest/V1/xinteractive-deliveryrules/delivery → 400
  Expected: 200 | 401 | 403
  ```
  Also visible in TC-CKO-12 as `"Failed to load resource: the server responded with a status of 400"` console errors on `/checkout/`.
- **Likely cause:** The endpoint in `app/code/XInteractive/DeliveryRules/etc/webapi.xml` likely requires either (a) a POST body with cart/postcode context, (b) a customer session token, or (c) a specific Accept header. test_plan.md §8 TC-CKO-5 just specified "endpoint resolves" without prescribing the call shape. Could also be a real recent regression — the endpoint may have started rejecting empty calls after a recent change.
- **Manual verification steps:**
  1. `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery'` → confirm 400.
  2. Read `app/code/XInteractive/DeliveryRules/etc/webapi.xml` and the linked controller to identify required params.
  3. Try `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery?postcode=1011AB'` or POST with body — see which shape yields 200.
  4. Inspect Network panel on `/checkout/` to capture how the front-end calls this endpoint; mirror that.
- **Suggested fix:**
  - If the 400 is by-design (param required): update TC-CKO-5 in `04-checkout.spec.ts:79` to send the expected params and accept 200.
  - If the 400 is a regression: investigate the DeliveryRules controller for recent changes that broke unauthenticated/param-less calls.

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

### B-3. Delivery rules text regex mismatch (PDP) — **Tier-1 attempt did not resolve**
- **TCs:** TC-PDP-4 (still failing in run #3 after Tier-1 fix), ~~TC-PDP-14~~ (passed in run #2 — see E-1)
- **Severity:** P3
- **Run #3 update:** Replacing the text regex with attribute selector `div.delivery[x-data*="initDeliveryStatus"]` did NOT work — that combination doesn't match because the `.delivery` class and the `x-data` attribute are on **different elements** (sibling/parent), not the same div. The static HTML shows multiple `<div class="delivery">` blocks and one separate `x-data="initDeliveryStatus()"` element. Next attempt: target just `div.delivery` (no x-data filter) and assert visibility + non-empty text.
- **Run #2 update:** TC-PDP-14 PASSED in run #2 — the "voor 21:00 besteld" text WAS visible. This means the regex actually matches that copy on the time-of-day-dependent PDP-14 path. TC-PDP-4 still fails because it checks the delivery block on a different render condition (block visibility, not just text match).
- **What the suite saw:** Regex `/voor.*besteld|leverdag|bezorgd|verzonden/i` did not match on TC-PDP-4 even though TC-PDP-14 found similar text.
- **Likely cause:** Either two different delivery-message blocks (cutoff message vs general delivery info), or TC-PDP-4 runs before the Alpine-rendered block has populated. Real fix is to wait for the specific delivery container rather than free-text regex.
- **Manual verification steps:**
  1. Visit `/big-berkey-waterfilter` and locate the delivery message block on the page. Identify whether it's one container or two (cutoff message vs delivery promise).
  2. Capture both containers' actual selectors via DevTools.
  3. Check `app/code/XInteractive/DeliveryRules/view/frontend/templates/` for the source phrasing and DOM structure.
- **Suggested fix:** Split into two assertions — wait for the delivery-info container selector first, then assert the text. Drop the broad regex in favour of a specific selector + non-empty text check.

### B-5. Tracking-page tests use wrong URL and parameter names (+ false-positive TC-TRK-2)
- **TCs:** TC-TRK-1 (was Cat-A-3 in v1), TC-TRK-2 (was passing, but with a misleading assertion), TC-TRK-4 (the URL fix won't change A-2's outcome but lets the assertion target the real page)
- **Severity:** P2 (one false-positive, one false-negative; both need correcting)
- **Run #3 update:** B-5 URL+param fix landed in Tier 1. **TC-TRK-2 now passes** (graceful 302→/ on missing params). **TC-TRK-1 still fails** for a new reason: when Playwright executes JS on `/tracking/index/gls?…`, the page client-side redirects out to `https://www.gls-info.nl/track-and-trace?parcelno=…&zipcode=…`. The current assertion `await expect(page.locator('main')).toBeVisible()` fails because the GLS destination uses different markup (no `<main>` landmark with that exact ID/role at our timeout). Options:
  - **Accept the external redirect:** wait for the URL to match `gls-info.nl` and assert the destination loaded (e.g. by status code or any body content).
  - **Test the source page only:** intercept and block the redirect via `page.route()` so the local `tracking_index_gls.phtml` stays rendered; then assert local markup.
  - **Recommended:** the second option — keeps the test scoped to the AllPrepare product, decouples from third-party page changes.
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

### B-4b. Same `:has-text(/regex/)` + comma CSS bug missed in `04-checkout.spec.ts:120` (run #3 follow-up)
- **TCs:** TC-CKO-10 (order summary section renders)
- **Severity:** P3 (one-line fix)
- **What the suite saw in run #3:**
  ```
  Error: Unexpected token "/" while parsing css selector
  "section:has-text(/overzicht|summary|totaal/i), [data-bind*='summary']"
  ```
- **Why missed:** This instance was in `04-checkout.spec.ts:120`, while my Tier-1 B-4 sweep only covered the three known instances in `05-category.spec.ts`, `06-newsletter-forms.spec.ts`, and `07-tracking-reviews.spec.ts`. The CKO file had the same pattern hidden in the cascade-skipped block — it only surfaced once C-1 unblocked the test.
- **Suggested fix:** Same `.or()` refactor pattern as B-4:
  ```ts
  const summary = page
    .locator("[data-bind*='summary']")
    .or(page.locator('section').filter({ hasText: /overzicht|summary|totaal/i }))
    .first();
  await expect(summary).toBeVisible({ timeout: 10_000 });
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

### C-4. TC-PERF-5..8 cascade-skipped — **REVISED after run #3 attempt failed**
- **TCs:** TC-PERF-5 (Magepack bundles loaded once), TC-PERF-6 (lazy-loading), TC-PERF-7 (TTFB), TC-PERF-8 (mobile cross-check)
- **Severity:** P2 (4 high-value perf TCs still blocked from running)
- **What the suite saw:** Both run #2 (with `test.describe.serial(...)`) AND run #3 (with `test.describe.configure({ mode: 'serial' })`) cascade-skipped TC-PERF-5..8 after TC-PERF-4 failed.
- **Why the Tier-1 fix didn't work:** `describe.serial(...)` is just shorthand for `describe.configure({ mode: 'serial' })`. Both share the same abort-on-first-failure behavior. The fix I documented in v1 of this file was wrong.
- **Correct fix (Tier 1.5):** Drop the explicit `mode: 'serial'` entirely. `playwright.config.ts:20` has `workers: 1` + `fullyParallel: false`, which already serialises tests globally. Without an in-block `mode`, a failure in one test does not abort the rest:
  ```ts
  // tests/e2e/specs/perf.spec.ts:44 — REVISED
  test.describe('Performance — Lighthouse Desktop (TC-PERF)', () => {
    test.describe.configure({ retries: 0 });   // retries only; no mode
    test.skip(({ browserName }) => browserName !== 'chromium', 'Lighthouse runs only on Chromium');
    // ...
  });
  ```
- **Why this is safe with Lighthouse + port 9222:** Workers serialise across the whole suite. Within a single worker, Playwright runs tests sequentially anyway (because `fullyParallel: false`). So port contention is impossible regardless of describe-mode.
- **Verification after the revised fix:** Re-run `npm run test:perf` and confirm TC-PERF-5/6/7/8 execute (pass or fail) instead of being skipped.

---

## Category D — Test infrastructure

### D-1. `X-Test-Suite` header causes CORS preflight failures on multiple third-parties — **broader than initially scoped**
- **TCs:** TC-GLB-8 (homepage), TC-CKO-12 (checkout) — and any future console-error assertion
- **Severity:** P3 (cosmetic for the suite; trade-off discussion needed)
- **Run #3 update:** Tier-1 broadened the filter to `cloudflareinsights|beacon.min.js`, which fixed Cloudflare. But run #3 exposed two more domains that reject the custom header:
  - `https://consentcdn.cookiebot.eu/consentconfig/…/settings.json` — Cookiebot CMP
  - `https://morethanmedia.allprepare.com/g/collect?…` — server-side GA4 collect endpoint
  Both reject the preflight with the same "x-test-suite not allowed" message.
- **Why it's a trade-off:** The `X-Test-Suite` header was added so your GA4/Analytics pipeline could filter test traffic out of dashboards (CLAUDE.md mentions `BerkeyExpert_EnhancedAnalytics`). Removing it makes analytics filtering harder; keeping it makes the console-error tests fail with noise.
- **Manual verification steps:** None — pure infra choice.
- **Suggested fix (pick one):**
  - **Option A** (recommended): Broaden the filter regex in `07-tracking-reviews.spec.ts:17` and `04-checkout.spec.ts:139` to `/favicon|ServiceWorker|cloudflareinsights|beacon|cookiebot|morethanmedia/i`. Filters all 3 currently-known third-party CORS noise sources.
  - **Option B**: Remove `extraHTTPHeaders` from `playwright.config.ts:39`. Lose analytics filtering ability.
  - **Option C**: Rename the header to something already in third-party CORS allowlists (e.g. query param `?qa=1`).
  - **Option D**: Add a Playwright request route handler that strips `x-test-suite` from outbound requests targeting third-party domains while keeping it on first-party (allprepare.com) requests. Highest fidelity, most code.

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

## Category E — Flaky tests (results vary between runs)

### E-1. TC-PDP-14 — "Order before 21:00" message depends on actual NL local time
- **TCs:** TC-PDP-14
- **Severity:** P3 (real-world functionality is fine; test is time-coupled)
- **Run history:** Run #1 (≈18:00–19:00 local during initial run): **FAILED** (cutoff message not visible). Run #2 (later in evening): **PASSED**. Same code, same URL, opposite outcomes.
- **What the suite saw:** Run #1 captured an empty regex match; the safety expression `expect(visible || new Date().getHours() >= 21).toBeTruthy()` failed because we were before 21:00. Run #2 was apparently after 21:00 Amsterdam time, so the second clause flipped truthy.
- **Likely cause (real):** `XInteractive_DeliveryRules` shows the "voor 21:00 besteld" message only during a specific window (e.g. before 21:00 same-day delivery cutoff). After 21:00 the copy may switch to "voor 21:00 besteld → morgen verzonden" with a different cutoff date, OR disappear, OR change format. The test cannot rely on the literal string.
- **Manual verification steps:**
  1. At 14:00 NL: visit `/big-berkey-waterfilter`. Capture the delivery message (e.g. "Voor 21:00 besteld, vandaag verzonden").
  2. At 20:55 NL: capture again — should still be the pre-cutoff message.
  3. At 21:05 NL: capture again — verify whether copy changes (e.g. "Bestel morgen voor 21:00").
  4. Note all three variants and the exact wording.
- **Suggested fix:** Pin `Date.now()` via Playwright's clock-emulation (`page.clock.install({ time: …})` in Playwright ≥1.45) to a fixed pre-cutoff time before navigating. Asserts become deterministic. Alternative: split into TC-PDP-14a (pre-21:00 message) and TC-PDP-14b (post-21:00 message) and have each run conditionally.

### E-2. TC-CKO-1 — checkout page load flaky on first attempt
- **TCs:** TC-CKO-1
- **Severity:** P3
- **Run history:** Run #1: passed. Run #2: failed on first attempt, **passed on retry**.
- **What the suite saw:** `await expect(page.locator('main')).toBeVisible()` failed because the cart was empty when checkout was opened — but the `beforeAll` seed in `04-checkout.spec.ts:11-23` had run. Suggests a session/cart cookie wasn't persisted between the seed context and the test's context.
- **Likely cause:** `beforeAll` creates a fresh `browser.newContext()` to seed the cart, then closes it. The test then runs in a different context that doesn't share the PHPSESSID cookie. So the cart-seed is wasted on the test session.
- **Manual verification steps:** None — test-design bug, not a product issue.
- **Suggested fix:** Either (a) seed the cart inside `beforeEach` of each test using the test's own `page.context()`, or (b) export the seed context state with `context.storageState()` and load it via `test.use({ storageState })`. Pattern (b) is the Playwright-idiomatic approach.

### E-3. TC-CART-2 — quantity update flaky (cart state between retries)
- **TCs:** TC-CART-2
- **Severity:** P3
- **Run history:** Run #1: skipped (cart empty). Run #2: failed → passed on retry.
- **What the suite saw:** First attempt found the cart empty (no items, hit the `test.skip` path); retry attempt found the cart populated.
- **Likely cause:** Same root as E-2 — cart-seed state is not persistent. The retry happened to inherit a populated cart from TC-CART-1 because TC-CART-1's add-to-cart click went through despite its assertion failing (B-1's mini-cart counter mismatch).
- **Manual verification steps:** None.
- **Suggested fix:** Same as E-2 — use `storageState` between tests, or seed the cart in `beforeEach`. With B-1 also fixed, TC-CART-1 will populate reliably and TC-CART-2 will inherit a known-good state.

---

## Manual re-verification checklist (high-priority items)

A QA tester should run these in order — most reveal real bugs in 45–75 minutes total:

1. **A-1 contrast scan** (15 min): axe DevTools on home / bestsellers / `/big-berkey-waterfilter` / `/checkout/cart/` / `/checkout/`. Capture all `serious` color-contrast violations into Jira/Linear.
2. **A-2 tracking robots** (3 min): view-source on `/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL`. Capture meta robots content (currently `INDEX, FOLLOW`). Confirm with SEO owner whether this page should be noindex'd. Also run `site:allprepare.com inurl:parcelnr` in Google to assess past leakage.
3. **A-4 checkout email blur** (10 min): repro on prod with throwaway cart; record DevTools screencast of the email input + DOM diff after entering invalid email and blurring.
4. **A-5 Lighthouse checkout** (20 min): run Chrome DevTools Lighthouse on `/checkout/` (Desktop, Best Practices + SEO + Performance); export full report; triage red audits. (Cross-page: TC-PERF-1/2/3 already PASS on home/PDP/category — only cart/checkout are problematic.)
5. **B-1 / B-2 / B-3 selector capture** (15 min combined): for each failing locator (mini-cart, stock status, delivery block), open the live page, find the real element, screenshot + paste its full opening tag into a follow-up ticket.
6. **E-1 PDP-14 time-window** (10 min, split across day): capture the delivery-cutoff message on `/big-berkey-waterfilter` at 14:00, 20:55, and 21:05 NL time. Note all variants for deterministic test rewrite.

---

## Re-run after fixes

### Tier 1 — Pure test-code edits — **APPLIED in run #3**

Status: ✅ done. Recovered +13 passes / -21 skipped (predicted ~44 passing, actual **42 passing**).
- B-1 / B-2 / B-4 / B-5 landed cleanly.
- B-3 (delivery selector) needs another adjustment — see B-3 follow-up notes.
- C-1 (checkout cascade) worked perfectly.
- C-4 (perf cascade) **didn't work** — `describe.configure({ mode: 'serial' })` is identical to `describe.serial(...)`; needs revised approach (drop the mode entirely).
- E-2/E-3 partially fixed via `beforeEach` in `04-checkout.spec.ts`; cart-seed race still causes occasional TC-CART-2 skip.

### Tier 1.5 — Cleanup follow-ups exposed by run #3 (small batch, est. +4-6 passes)
- **B-3 follow-up:** target `div.delivery` (drop the x-data attribute constraint that doesn't match).
- **B-4b:** apply `.or()` refactor to the missed instance in `04-checkout.spec.ts:120` (TC-CKO-10).
- **C-4 revised:** drop `mode: 'serial'` from `perf.spec.ts:44`; keep only `retries: 0`. `workers: 1` already serialises.
- **D-1 broadened:** extend console-error filter regex to include `cookiebot|morethanmedia`.
- **B-5 follow-up:** decide tracking page strategy — block client-side redirect via `page.route()` (preferred) or follow it.

```bash
cd tests/e2e
npm test                   # expect: ≈46-48 passing, ~6-8 failing (all real Cat-A), ~2 skipped
npm run report
npm run results:patch
```

### Tier 2 — Product fixes (resolve Category-A real bugs)
- **A-1** Tailwind orange palette darken (one config edit, fixes 6 TCs)
- **A-2** `setRobots('NOINDEX,NOFOLLOW')` in `XInteractive/TrackingPage/Controller/Index/Gls.php:48` (fixes TC-TRK-4)
  - Severity lowered to P2 per run-#3 reframing (JS redirect mitigates partially but doesn't eliminate Googlebot risk).
- **A-4** Checkout email blur validation
- **A-5** Cart/checkout Best-Practices + SEO triage from Lighthouse report
  - Run #3 shows Best-Practices recovered from 56→74 (still below 80 threshold). SEO unchanged at 58.
- **A-7** (new) Investigate `/rest/V1/xinteractive-deliveryrules/delivery` returning 400 — regression vs missing-param-by-design.

**Predicted state after Tier 1.5 + Tier 2:** ≈ **52-58 passing / 0-4 failing / 0 skipped** out of 60 mapped TCs.

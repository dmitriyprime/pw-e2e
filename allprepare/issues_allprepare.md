# Issues — AllPrepare E2E Automated Testing (Batch 1)

**Source:** `issues.md` (Playwright run history 2026-05-12, runs #1/#2/#3 against `https://www.allprepare.com`)
**Filter:** Category A only — real production bugs.
**Excluded from this file** (and why):
- **A-3** — reclassified by the QA author as a test-side bug (wrong route + param names in the spec); tracked under B-5 in `issues.md`.
- **A-6** — Cloudflare Insights beacon CORS error is caused by the suite's own `X-Test-Suite` header, not by a production defect; the QA author explicitly flags it as a test artifact.
- **Categories B, C, D, E** in `issues.md` — test-side selector/regex tuning, cascade-skipped tests, test-infrastructure notes, and flaky-test observations. Not product defects; do not belong in a bug tracker as fix-and-close tickets.

Five issues follow.

---

# Issue 1: WCAG 2.1 AA — Serious color-contrast violations on orange UI elements (theme-wide)

## Description

axe-core scans flag **serious-impact** `color-contrast` rule violations on every page of the site (homepage 172, category 587, PDP 168, cart 61, checkout 61 nodes). Two distinct offenders are responsible for the bulk of the failures:

1. **Discount badges** (e.g. "21% korting") — white text on the brand orange `#fc8c2f` background. Computed contrast ratio **2.35:1**; WCAG AA threshold is **4.5:1**.
2. **Newsletter "Inschrijven" button** — white text on `#fc8c2f` with a `text-shadow` of `#f3872d`. Foreground-on-shadow ratio **2.52:1**; threshold **4.5:1**.

These violations affect accessibility/legal compliance (WCAG 2.1 AA). They fail across six related automated test cases: TC-A11Y-1, TC-A11Y-2a/2b/2c/2d, TC-A11Y-8.

**Likely root cause:** the Tailwind primary orange palette in `app/design/frontend/allprepare/base/web/tailwind/` is too light for white text at body/badge sizes.

## Environment

- https://www.allprepare.com/
- Reproducible on: every page on the site (homepage, category listings, PDPs, cart, checkout).

## Preconditions

- Chrome desktop browser (latest stable).
- axe DevTools extension installed and enabled (from deque.com).
- Incognito window, no other extensions enabled.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.allprepare.com/`.

### Step 2: Open DevTools → axe DevTools panel → click "Scan all of my page" and filter results by **Serious** impact.

### Step 3: Confirm `color-contrast` rule fails on the orange newsletter "Inschrijven" button. Inspect the button: in the Computed pane → Color → click the contrast preview swatch and confirm the displayed ratio is approximately **2.52:1**.

### Step 4: Navigate to `https://www.allprepare.com/bestsellers`. Re-run the axe scan. Confirm the same `color-contrast` rule fails on the orange discount badges ("21% korting", "10% korting", etc.) with a ratio of approximately **2.35:1**.

### Step 5: Repeat on a PDP (e.g. `/big-berkey-waterfilter`), `/checkout/cart/`, and `/checkout/`. Confirm the same offender(s) appear on each.

---

**Expected Result:** All text-on-background combinations on the site meet the WCAG 2.1 AA minimum contrast ratio of **4.5:1** for body-sized text. axe DevTools reports zero serious `color-contrast` violations from the orange badge and "Inschrijven" button.

**Actual Result:** Six automated accessibility tests fail. axe DevTools reports serious `color-contrast` violations on (a) every orange discount badge with ratio **2.35:1**, and (b) the newsletter "Inschrijven" button with ratio **2.52:1**. Both are below the 4.5:1 threshold.

---

# Issue 2: Tracking page (`/tracking/index/gls`) is indexable — `robots` meta says `INDEX, FOLLOW` instead of `NOINDEX, NOFOLLOW`

## Description

The GLS tracking page renders with `<meta name="robots" content="max-image-preview:large, INDEX, FOLLOW">`. The URL contains customer-specific query parameters (parcel number + postcode). If Google indexes this URL with parameters intact, it constitutes a privacy/PII leak alongside the SEO issue.

**Mitigating factor identified in run #3:** When JavaScript executes, the page client-side redirects to `https://www.gls-info.nl/track-and-trace?parcelno=…&zipcode=…` (a different external domain). Googlebot typically does NOT follow JavaScript-based redirects for indexing, which **lowers severity from P1 to P2** — but the meta tag is still served on the render-before-redirect response and the URL is still indexable in principle.

**Likely root cause:** Either (a) `BerkeyExpert_RobotsModifier` (`Plugin/PageConfigPlugin.php`) sets the site-wide `INDEX, FOLLOW` default and the tracking page is not on its exclusion list; or (b) `XInteractive_TrackingPage`'s controller (`app/code/XInteractive/TrackingPage/Controller/Index/Gls.php:48`) calls `resultPageFactory->create()` without subsequently invoking `setRobots('NOINDEX,NOFOLLOW')` on the result page.

Affected automated test: **TC-TRK-4**.

## Environment

- https://www.allprepare.com/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL

## Preconditions

- Chrome desktop browser, incognito window.
- No browser extensions enabled.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.allprepare.com/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL`.

### Step 2: View page source (Ctrl+U). Search for the substring `name="robots"`.

### Step 3: Read the `content` attribute of that meta tag.

### Step 4: As an additional verification, open a separate tab and run a Google search for `site:allprepare.com/tracking` and for `inurl:parcelnr`. Any results indicate the page has already been indexed.

### Step 5: Try the language-variant URLs (`language=FR`, `language=BE`, `language=DE`). These redirect server-side per `Gls.php:28-46` and are not at risk — confirm they do not expose a robots tag.

---

**Expected Result:** The `<meta name="robots">` content attribute contains `NOINDEX, NOFOLLOW` (case-insensitive). Google search for `site:allprepare.com/tracking` returns zero results.

**Actual Result:** The `<meta name="robots">` content attribute contains `max-image-preview:large, INDEX, FOLLOW`. Customer tracking URLs with parcel numbers and postcodes in the query string are technically indexable.

---

# Issue 3: Checkout — email field "invalid email" validation does not fire on blur

## Description

When an invalid email value (e.g. `not-an-email`) is entered into the customer-email field on the checkout page and the field is blurred, no inline error message appears within ~5 seconds. The expected behavior per the test plan §8 TC-CKO-2 is that an inline validation error should appear immediately on blur, before the user attempts to submit.

**Ambiguity to verify manually:** The automated test searched for the error message using selectors `[id*='email-error']`, `.mage-error`, and `[class*='error']:near(…)`. The cause could be either:
- **A real product bug** — validation is only wired to fire on form submit, not on blur.
- **A test selector miss** — OneStepCheckout (`iosc 1.2.060`) renders validation errors in a Knockout-bound container whose class/ID was not anticipated by the test. The manual verification step below distinguishes between the two.

This test failure also cascade-blocks TC-CKO-3..12 (resolved structurally by the C-1 fix in run #3, but TC-CKO-2 itself is the real signal).

## Environment

- https://www.allprepare.com/checkout/

## Preconditions

- Chrome desktop browser.
- A populated cart (add at least one product to the cart from a PDP, e.g. `/big-berkey-waterfilter`).
- The checkout page loaded.

## Steps to Reproduce

### Step 1: Open Chrome and add any product (e.g. Big Berkey water filter) to the cart from its PDP.

### Step 2: Navigate to `https://www.allprepare.com/checkout/` and wait for the form to fully render.

### Step 3: Open DevTools → Elements panel and pin it open so you can watch DOM mutations.

### Step 4: Click into the customer-email input. Type `not-an-email`. Click outside the field (or press Tab) to blur it. Wait ~1 second.

### Step 5: Observe the area immediately beneath the email field. As an additional diagnostic, type a valid email (`test@example.com`), then re-type an invalid one. Watch the Elements panel for any new node insertion under the form. If a node IS inserted, capture its selector — the test needs updating to that selector (test-side fix, not a product bug). If nothing is inserted, this is a real product bug.

---

**Expected Result:** A red inline validation message appears beneath the email field within ~1 second of the blur event, indicating that the email format is invalid.

**Actual Result:** No inline error message is visible 5 seconds after the blur event, by any of the conventional Magento/Knockout error-element selectors. Either validation is not wired on blur (real bug), or the error markup uses a selector the test does not yet target (test-side issue — needs manual verification per Step 5 to disambiguate).

---

# Issue 4: Cart and Checkout pages — Lighthouse Best-Practices (56) and SEO (58) scores below thresholds

## Description

Running Lighthouse (Desktop preset) against `/checkout/` produces a **Best-Practices score of 56** and an **SEO score of 58**. The project's thresholds are **80** for Best-Practices and **90** for SEO. The cart page (`/checkout/cart/`) shows the same pattern.

**Importantly scoped:** Run #2 of the suite confirmed that the homepage, PDPs, and category pages **pass** their Lighthouse thresholds (TC-PERF-1 `perf≥90 & SEO≥90` on `/`; TC-PERF-2 `perf≥85` on PDP; TC-PERF-3 `perf≥85` on `/bestsellers`). The performance problem is **isolated to cart and checkout**, not site-wide.

**Likely root causes** (typical Magento OSC anti-patterns surfaced as Best-Practices issues by Lighthouse): console errors, deprecated APIs, no-referrer-when-downgrade fallbacks, third-party payment scripts loaded eagerly, mixed content. The low SEO score is often driven by missing meta description on checkout pages, missing indexing signals, and low-contrast text (Issue 1 in this file contributes here as well).

Affected automated test: **TC-PERF-4** (sub-step b).

## Environment

- https://www.allprepare.com/checkout/
- https://www.allprepare.com/checkout/cart/

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.
- A populated cart (add at least one product before testing checkout).

## Steps to Reproduce

### Step 1: Open Chrome incognito and add any product to the cart.

### Step 2: Navigate to `https://www.allprepare.com/checkout/` and wait for the page to fully render.

### Step 3: Open DevTools → Lighthouse panel. Configure: Device = **Desktop**; Categories = **Performance + Best Practices + SEO**. Click "Analyze page load".

### Step 4: Read the resulting scores. Confirm Best-Practices is approximately **56** and SEO is approximately **58**.

### Step 5: Click into the red audits for each category and capture the specific list of offenders. Common audits to check: "Browser errors logged to the console", "Includes front-end JavaScript libraries with known security vulnerabilities", "Document does not have a meta description", "Tap targets are not sized appropriately".

### Step 6: Repeat steps 2–4 against `https://www.allprepare.com/checkout/cart/` and confirm a similar low-score pattern.

---

**Expected Result:** Best-Practices score **≥ 80** and SEO score **≥ 90** on both `/checkout/` and `/checkout/cart/`, matching the thresholds the homepage/PDP/category pages already meet.

**Actual Result:** Best-Practices score = **56**, SEO score = **58** on `/checkout/`. Same low-score pattern on `/checkout/cart/`. Numbers are stable across runs #1 and #2 (not flaky).

---

# Issue 5: DeliveryRules REST endpoint returns HTTP 400 instead of 200

## Description

`GET /rest/V1/xinteractive-deliveryrules/delivery` returns **HTTP 400**. The corresponding automated test (TC-CKO-5) expects 200, 401, or 403. The same 400 also surfaces as `"Failed to load resource: the server responded with a status of 400"` console errors on `/checkout/` (visible via TC-CKO-12).

**Ambiguity to verify manually:** The 400 could be either (a) **by design** — the endpoint requires query parameters (e.g. postcode, cart context), a customer session token, or a specific Accept header, in which case the unauthenticated parameter-less probe is correctly rejected and the test needs updating; or (b) **a real regression** — the endpoint started rejecting calls that previously worked, possibly due to recent changes in the DeliveryRules controller. The manual verification step below determines which.

Affected automated tests: **TC-CKO-5**; sub-finding under **TC-CKO-12**.

## Environment

- https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery

## Preconditions

- A terminal with `curl` available, OR Chrome DevTools (Network panel).
- Optional: access to read `app/code/XInteractive/DeliveryRules/etc/webapi.xml` and the linked controller to identify the endpoint's required parameters.

## Steps to Reproduce

### Step 1: From a terminal, run `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery'`. Confirm the response is HTTP 400 (not 200, 401, or 403).

### Step 2: Read `app/code/XInteractive/DeliveryRules/etc/webapi.xml` and the linked controller class to identify the parameter contract for this endpoint.

### Step 3: Retry the call with the parameters identified in Step 2, e.g. `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery?postcode=1011AB'`, or with a POST body, or with a customer-session bearer token. Capture which shape (if any) yields 200.

### Step 4: Open Chrome DevTools → Network panel. Navigate to `https://www.allprepare.com/checkout/` (with a populated cart). Look for any front-end request to `xinteractive-deliveryrules/delivery`. If the front-end successfully calls this endpoint, note the exact request shape (method, URL, query params, headers, body).

### Step 5: Compare the front-end's working request shape (from Step 4) to the parameter-less test request. If the front-end works but the bare GET fails, the 400 is by-design (test needs updating). If the front-end ALSO fails with 400, this is a real production regression and the controller needs investigation.

---

**Expected Result:** Either (a) the endpoint returns HTTP 200 for an unauthenticated, parameter-less probe (matching the test's expectation set of 200/401/403), or (b) the parameter contract is documented and the test's call shape is updated to match — at which point the endpoint returns 200 for a correctly formed call.

**Actual Result:** `GET /rest/V1/xinteractive-deliveryrules/delivery` returns HTTP 400 for an unauthenticated, parameter-less call. The same 400 also appears as a resource error in the browser console on `/checkout/`, which suggests the front-end may also be hitting this same problem (needs the Network-panel check in Step 4 to confirm).

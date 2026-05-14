# Manual Test Cases — AllPrepare Production Site

Five manual test cases for verifying accessibility, SEO/privacy, form behavior, performance, and API contract on the live AllPrepare site. Each case follows the standard test-case template in `template_for_issue_creation.md`.

---

# Test Case 1: Verify WCAG 2.1 AA color-contrast compliance on theme-wide orange UI elements

## Description

Verify that all text-on-background combinations across the AllPrepare site meet the WCAG 2.1 AA minimum contrast ratio of **4.5:1** for body-sized text. Particular focus on the two orange UI patterns used by the theme:

- **Discount badges** (e.g. "21% korting") — white text on the brand orange `#fc8c2f`.
- **Newsletter "Inschrijven" button** — white text on `#fc8c2f` with a `text-shadow` of `#f3872d`.

Both patterns appear across every major page on the site (homepage, category listings, PDPs, cart, checkout) — so a representative cross-section should be scanned.

## Environment

- https://www.allprepare.com/

## Preconditions

- Chrome desktop browser (latest stable).
- axe DevTools extension installed and enabled (from deque.com).
- Incognito window, no other extensions enabled.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.allprepare.com/`.

### Step 2: Open DevTools → axe DevTools panel → click "Scan all of my page" and filter the results by **Serious** impact.

### Step 3: Inspect the orange newsletter "Inschrijven" button at the bottom of the homepage. In the Elements panel → Computed → Color, click the contrast preview swatch and read the displayed contrast ratio.

### Step 4: Navigate to `https://www.allprepare.com/bestsellers`. Re-run the axe scan. Inspect one of the orange "% korting" discount badges and read its contrast ratio in the same way.

### Step 5: Repeat the scan and inspection on a PDP (e.g. `/big-berkey-waterfilter`), `/checkout/cart/`, and `/checkout/`.

---

**Expected Result:** axe DevTools reports zero serious `color-contrast` violations across all five page types. Both the "Inschrijven" button and the orange discount badges show contrast ratios of **≥ 4.5:1** against their backgrounds.

**Actual Result:** axe DevTools reports serious `color-contrast` violations on every page scanned (homepage ~172, category ~587, PDP ~168, cart ~61, checkout ~61 nodes). The "Inschrijven" button shows a foreground-on-shadow ratio of approximately **2.52:1**. The orange discount badges show a ratio of approximately **2.35:1**. Both fall well below the 4.5:1 threshold required for WCAG 2.1 AA compliance.

---

# Test Case 2: Verify tracking page is excluded from search-engine indexing

## Description

Verify that the GLS parcel-tracking page is marked with `NOINDEX, NOFOLLOW` in the `robots` meta tag. This page is reached from order-confirmation emails with the customer's parcel number and postcode embedded as URL parameters; if the page is indexable, those URLs can end up in Google's index and expose customer data alongside the SEO issue.

The page is known to client-side redirect to `https://www.gls-info.nl/track-and-trace?...` once JavaScript executes. The redirect is a mitigating factor for indexing (Googlebot doesn't typically follow JS-based redirects) but the `<meta name="robots">` tag is still served on the initial HTML response and the URL is still discoverable in principle.

## Environment

- https://www.allprepare.com/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL

## Preconditions

- Chrome desktop browser, incognito window.
- No browser extensions enabled.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.allprepare.com/tracking/index/gls?parcelnr=12345678&postcode=1011AB&language=NL`.

### Step 2: Immediately view the page source (Ctrl+U) before the JavaScript redirect fires. Search the source for the substring `name="robots"`.

### Step 3: Read the `content` attribute of the matched `<meta>` tag.

### Step 4: As an additional verification, open a separate tab and search Google for `site:allprepare.com/tracking` and for `inurl:parcelnr`. Any results returned indicate that the page has already been indexed by search engines.

### Step 5: Try the language-variant URLs (`language=FR`, `language=BE`, `language=DE`). These should server-side redirect to the language-appropriate destination and not expose a robots tag at all. Confirm.

---

**Expected Result:** The `<meta name="robots">` `content` attribute contains `NOINDEX, NOFOLLOW` (case-insensitive). Google search for `site:allprepare.com/tracking` returns zero results.

**Actual Result:** The `<meta name="robots">` `content` attribute is `max-image-preview:large, INDEX, FOLLOW`. Customer tracking URLs containing parcel numbers and postcodes are technically indexable by search engines, exposing both a SEO leak (parameterized URLs in the index) and a potential privacy concern (PII in the URL query string).

---

# Test Case 3: Verify checkout email field shows an inline validation error on blur for malformed input

## Description

Verify that the customer-email field on the OneStepCheckout page provides immediate, inline validation feedback when the user enters a malformed email address and blurs the field (clicks/tabs away). The expected behaviour is a red error message appearing beneath the field within roughly one second of the blur event, before the user attempts to submit the form.

## Environment

- https://www.allprepare.com/checkout/

## Preconditions

- Chrome desktop browser.
- A populated cart (add at least one product to the cart from a PDP, e.g. `/big-berkey-waterfilter`).
- The checkout page loaded with the cart already populated.

## Steps to Reproduce

### Step 1: Open Chrome and add any product (e.g. the Big Berkey water filter) to the cart from its PDP.

### Step 2: Navigate to `https://www.allprepare.com/checkout/` and wait for the form to fully render.

### Step 3: Click into the customer-email input. Type `not-an-email`. Click outside the field (or press Tab) to blur the input. Wait approximately one second.

### Step 4: Observe the area immediately beneath the email field. Note whether any red error message appears.

### Step 5: As a follow-up diagnostic, type a valid email (`test@example.com`) into the field, then re-type the invalid value `not-an-email`. Watch for any new node insertion or class change under the form element using the Elements panel.

---

**Expected Result:** A red inline validation message appears beneath the email field within approximately one second of the blur event, indicating that the email format is invalid. The error message disappears when a valid email is entered.

**Actual Result:** No inline error message becomes visible within five seconds of the blur event. The field does not visually indicate that the input is invalid until the user submits the form.

---

# Test Case 4: Verify cart and checkout pages meet Lighthouse Best-Practices and SEO thresholds

## Description

Verify that the cart (`/checkout/cart/`) and checkout (`/checkout/`) pages meet the project's quality thresholds for Lighthouse **Best-Practices (≥ 80)** and **SEO (≥ 90)** when audited under the Desktop preset. The homepage, PDP, and category pages already meet these thresholds — so this test isolates the cart-and-checkout funnel specifically.

## Environment

- https://www.allprepare.com/checkout/
- https://www.allprepare.com/checkout/cart/

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.
- A populated cart (add at least one product before testing checkout).

## Steps to Reproduce

### Step 1: Open Chrome incognito and add any product to the cart.

### Step 2: Navigate to `https://www.allprepare.com/checkout/` and wait for the page to fully render.

### Step 3: Open DevTools → Lighthouse panel. Set Device = **Desktop**; Categories = **Performance + Best Practices + SEO**. Click "Analyze page load".

### Step 4: Read the resulting scores. Note the Best-Practices and SEO scores.

### Step 5: Click into the red audits under each category and capture the specific list of offenders. Pay particular attention to: "Browser errors logged to the console", "Includes front-end JavaScript libraries with known security vulnerabilities", "Document does not have a meta description", "Tap targets are not sized appropriately".

### Step 6: Repeat steps 2–4 on `https://www.allprepare.com/checkout/cart/` and confirm a similar low-score pattern.

---

**Expected Result:** Best-Practices score **≥ 80** and SEO score **≥ 90** on both `/checkout/` and `/checkout/cart/`. No critical Best-Practices audits in the red.

**Actual Result:** Best-Practices score is approximately **56** and SEO score is approximately **58** on `/checkout/`. The cart page shows a similar low-score pattern. Both pages fall well below the project's quality thresholds. The same offenders are reproducible across multiple runs (not flaky).

---

# Test Case 5: Verify DeliveryRules REST endpoint responds with a successful or expected-auth status

## Description

Verify that the public DeliveryRules REST endpoint at `/rest/V1/xinteractive-deliveryrules/delivery` responds with a status code that is either successful (`200`) or an authentication/authorization signal (`401` or `403`) — and not a generic client error (`400`). A `400` from this endpoint typically indicates that the request is malformed (e.g. missing required parameters), but the same error also surfaces as a "Failed to load resource" entry in the browser console on `/checkout/`, suggesting the front-end may be hitting this same endpoint problem.

During this test the manual tester should also distinguish two possibilities: (a) the endpoint is **by design** parameter-required and the failure is the request shape, or (b) the endpoint regressed and a previously-working call shape now fails.

## Environment

- https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery

## Preconditions

- A terminal with `curl` available, or Postman / Insomnia.
- Chrome desktop browser with DevTools (Network panel).
- Optional: read access to `app/code/XInteractive/DeliveryRules/etc/webapi.xml` and the linked controller class for context on the endpoint's expected parameter contract.

## Steps to Reproduce

### Step 1: From a terminal, run `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery'`. Note the HTTP status code returned.

### Step 2: Read `app/code/XInteractive/DeliveryRules/etc/webapi.xml` and the linked controller class to identify the expected parameter contract (required query parameters, request body shape, auth headers).

### Step 3: Retry the call with the parameters identified in Step 2, for example `curl -i 'https://www.allprepare.com/rest/V1/xinteractive-deliveryrules/delivery?postcode=1011AB'`, or with a POST body, or with a customer-session bearer token. Note which shape (if any) yields a 200.

### Step 4: Open Chrome DevTools → Network panel. Navigate to `https://www.allprepare.com/checkout/` with a populated cart. Look for any front-end request to `xinteractive-deliveryrules/delivery`. If the front-end successfully calls this endpoint, capture the exact request shape (method, URL, query params, headers, body).

### Step 5: Compare the front-end's working request shape (from Step 4) to the parameter-less probe in Step 1. If the front-end works but the bare GET fails, the 400 is by-design and the endpoint contract should be documented. If the front-end ALSO fails with 400, this is a real production regression and the controller needs investigation.

---

**Expected Result:** Either (a) `GET /rest/V1/xinteractive-deliveryrules/delivery` returns HTTP 200 for an unauthenticated, parameter-less probe, or (b) the parameter contract is documented and a correctly-formed call returns HTTP 200. The front-end on `/checkout/` should not log resource-load errors against this endpoint in the console.

**Actual Result:** `GET /rest/V1/xinteractive-deliveryrules/delivery` returns HTTP **400** for an unauthenticated, parameter-less call. The same 400 also surfaces as a "Failed to load resource: the server responded with a status of 400" entry in the browser console on `/checkout/`, suggesting the front-end may also be hitting the same issue and that the endpoint contract is either undocumented or has regressed.

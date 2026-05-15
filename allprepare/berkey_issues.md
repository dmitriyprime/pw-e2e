# Manual Test Cases — BerkeyExpert.fr Production Site

Six manual test cases for verifying accessibility, performance, and JavaScript health of the live BerkeyExpert.fr site. Each case follows the standard test-case template in `template_for_issue_creation.md`.

Three of the six issues (Test Cases 1, 2, 6) likely share the same root cause as findings on the sibling site `allprepare.com` — see `issues_allprepare.md` for cross-reference. The other three (Test Cases 3, 4, 5) are specific to berkeyexpert.fr at the time of writing.

---

# Test Case 1: Verify WCAG 2.1 AA color-contrast compliance across the site

## Description

Verify that all text-on-background combinations on every major page of berkeyexpert.fr meet the WCAG 2.1 AA minimum contrast ratio of **4.5:1** for body-sized text and **3:1** for large text. Focus areas include theme-wide UI patterns: navigation links, button labels, footer text, product card labels, badge pills, form labels, and any other repeating UI element.

## Environment

- https://www.berkeyexpert.fr/

## Preconditions

- Chrome desktop browser (latest stable).
- axe DevTools extension installed and enabled (from deque.com).
- Incognito window, no other extensions enabled.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.berkeyexpert.fr/`.

### Step 2: Open DevTools → axe DevTools panel → click "Scan all of my page" and filter the results by **Serious** impact.

### Step 3: For each violation in the result list, click into the offending node, copy the computed foreground / background colors, and verify the contrast ratio either via axe's preview swatch or via the Chrome DevTools "Inspect" → Computed → Color picker → contrast preview.

### Step 4: Navigate to a category page (a top-level "Boutique" / "Filtres Berkey" link from the homepage). Re-run the axe scan.

### Step 5: Navigate to a product detail page (any product card linked from the category). Re-run the axe scan.

### Step 6: Add at least one product to the cart. Navigate to `https://www.berkeyexpert.fr/checkout/cart/`. Re-run the axe scan.

### Step 7: Continue to checkout (`https://www.berkeyexpert.fr/checkout/`). Re-run the axe scan.

---

**Expected Result:** axe DevTools reports zero serious `color-contrast` violations across all five page types (homepage, category, PDP, cart, checkout). Every text-on-background combination scores **≥ 4.5:1** for body text and **≥ 3:1** for large text.

**Actual Result:** axe DevTools reports serious `color-contrast` violations on all five page types. The violations affect repeating theme elements (cards, badges, footer, header) — the same Hyva theme palette appears to power the site, so the offenders are likely shared across product detail, listing, cart, and checkout flows rather than isolated to one page.

---

# Test Case 2: Verify cart and checkout pages meet Lighthouse Best-Practices and SEO thresholds

## Description

Verify that the cart (`/checkout/cart/`) and checkout (`/checkout/`) pages meet quality thresholds for Lighthouse **Best-Practices (≥ 80)** and **SEO (≥ 90)** under the Desktop preset. The funnel pages are typically where Magento OneStepCheckout sites accumulate the most third-party scripts (payment SDKs, address-autocomplete, postcode validation), and a low Best-Practices score is usually a signal that one or more of those scripts is logging console errors, using deprecated APIs, or loading from mixed-content sources.

## Environment

- https://www.berkeyexpert.fr/checkout/
- https://www.berkeyexpert.fr/checkout/cart/

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.
- A populated cart (add at least one product before testing checkout).

## Steps to Reproduce

### Step 1: Open Chrome incognito and add any product to the cart.

### Step 2: Navigate to `https://www.berkeyexpert.fr/checkout/` and wait for the page to fully render.

### Step 3: Open DevTools → Lighthouse panel. Set Device = **Desktop**; Categories = **Performance + Best Practices + SEO**. Click "Analyze page load".

### Step 4: Read the resulting scores. Note the Best-Practices and SEO scores.

### Step 5: Click into the red audits under each category and capture the specific list of offenders. Common audits to verify: "Browser errors logged to the console", "Includes front-end JavaScript libraries with known security vulnerabilities", "Document does not have a meta description", "Tap targets are not sized appropriately", "Image elements have explicit width and height".

### Step 6: Repeat steps 2–4 against `https://www.berkeyexpert.fr/checkout/cart/`.

---

**Expected Result:** Best-Practices score **≥ 80** and SEO score **≥ 90** on both `/checkout/` and `/checkout/cart/`. No critical Best-Practices audits in the red.

**Actual Result:** Lighthouse on `/checkout/` returns Best-Practices and SEO scores below their respective thresholds, mirroring the same pattern seen on the AllPrepare sibling site. The pattern reproduces across runs (not flaky).

---

# Test Case 3: Verify homepage meets Lighthouse Performance and SEO thresholds on mobile

## Description

Verify that the BerkeyExpert.fr homepage meets the **Performance ≥ 90** and **SEO ≥ 90** Lighthouse thresholds when audited under the **Mobile** preset. The homepage is the most heavily-traversed entry point on the site, and a sub-threshold mobile Performance score directly impacts Core Web Vitals and Google's mobile-first ranking signal.

This is **not** a concern on the AllPrepare sibling site at the time of writing, which passes the same threshold on mobile — meaning this is a berkeyexpert.fr-specific gap, likely driven by larger hero images, more above-the-fold JavaScript, or different CDN configuration.

## Environment

- https://www.berkeyexpert.fr/

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.
- DevTools open with Lighthouse panel available.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.berkeyexpert.fr/`.

### Step 2: Open DevTools → Lighthouse panel. Set Device = **Mobile**; Categories = **Performance + SEO**. Click "Analyze page load".

### Step 3: Read the resulting Performance and SEO scores.

### Step 4: Click into the red audits under Performance and capture the specific list of offenders. Common audits to check: "Largest Contentful Paint", "Total Blocking Time", "Cumulative Layout Shift", "Reduce unused JavaScript", "Properly size images", "Eliminate render-blocking resources".

### Step 5: For comparison, re-run the same audit under Device = **Desktop** to confirm whether the issue is mobile-specific.

---

**Expected Result:** Mobile Performance score **≥ 90** and SEO score **≥ 90** on the homepage. Largest Contentful Paint under 2.5 s, Total Blocking Time under 200 ms, Cumulative Layout Shift under 0.1.

**Actual Result:** The mobile Lighthouse audit on the homepage returns a Performance score below 90. The same audit on Desktop passes (or scores noticeably higher), suggesting the regression is mobile-specific — likely image-weight or render-blocking JS rather than a global performance issue.

---

# Test Case 4: Verify category page meets Lighthouse Performance threshold

## Description

Verify that any top-level category/listing page meets the **Performance ≥ 85** Lighthouse threshold on both Desktop and Mobile. Category pages are content-heavy (multiple product cards with images, layered-nav filters, pagination) and are a common funnel-entry point from organic search — sub-threshold Performance impacts both bounce rate and SEO ranking.

This is **not** a concern on AllPrepare desktop (which passes) but reproduces on both desktop and mobile on berkeyexpert.fr.

## Environment

- https://www.berkeyexpert.fr/ → any top-level shop / category link (e.g. "Boutique", "Filtres Berkey", or whichever the main navigation surfaces)

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.
- DevTools open with Lighthouse panel available.

## Steps to Reproduce

### Step 1: Open Chrome incognito and navigate to `https://www.berkeyexpert.fr/`.

### Step 2: Open the main navigation. Click into the first/main product-category link.

### Step 3: Wait for the category listing to fully render (product cards, filters, pagination visible).

### Step 4: Open DevTools → Lighthouse panel. Set Device = **Desktop**; Categories = **Performance**. Click "Analyze page load".

### Step 5: Read the Performance score. Click into red audits and capture offenders ("Properly size images", "Defer offscreen images", "Reduce unused CSS", "Avoid enormous network payloads", "Largest Contentful Paint element").

### Step 6: Repeat steps 4–5 under Device = **Mobile** to confirm whether the threshold miss is responsive-specific or universal.

---

**Expected Result:** Performance score **≥ 85** on both Desktop and Mobile. Largest Contentful Paint under 2.5 s, network payload weight under 3 MB on initial load.

**Actual Result:** Lighthouse Performance score is below 85 on at least one device (both, in the most recent measurement). Image and CSS optimization audits are typically the largest contributors to the deficit.

---

# Test Case 5: Verify no JavaScript console errors on homepage load

## Description

Verify that no JavaScript errors are logged to the browser console during a clean load of the homepage. Errors logged by the site's own scripts (as opposed to third-party tracking pixels) indicate either misconfigured runtime, missing dependencies, broken event handlers, or null-reference exceptions that could cascade into user-visible failures (broken minicart, broken search, broken add-to-cart). Third-party noise from analytics/beacon scripts is acceptable and should be filtered out during this test.

## Environment

- https://www.berkeyexpert.fr/

## Preconditions

- Chrome desktop browser, incognito window, no browser extensions.

## Steps to Reproduce

### Step 1: Open Chrome incognito.

### Step 2: Open DevTools → Console tab **before** navigating, so console output is captured from the very first load event.

### Step 3: Navigate to `https://www.berkeyexpert.fr/`. Wait for the page to fully render (above-fold and below-fold images visible, navigation interactive).

### Step 4: In the Console tab, set the level filter to **Errors only** (red bubble icon at the top of the console).

### Step 5: Read the resulting error list. Exclude the following well-known third-party noise: any error mentioning `cloudflareinsights`, `beacon.min.js`, `favicon`, or `ServiceWorker`. Note all remaining errors — those are first-party errors that need attention.

### Step 6: Click each remaining error to expand the stack trace and identify the offending script file and line number.

---

**Expected Result:** Zero JavaScript errors logged to the console during homepage load, after filtering out the listed third-party noise.

**Actual Result:** One or more JavaScript errors are logged to the console during homepage load. The specific errors should be captured by the manual tester and forwarded to the front-end team with file/line references.

---

# Test Case 6: Verify DeliveryRules REST endpoint responds with a successful or expected-auth status

## Description

Verify that the public DeliveryRules REST endpoint (`/rest/V1/xinteractive-deliveryrules/delivery`) responds with a status code that is either successful (`200`) or an authentication/authorization signal (`401` or `403`) — and not a generic client error (`400`). This endpoint is shared platform-level infrastructure with the AllPrepare sibling site and the same issue is documented in `issues_allprepare.md` Test Case 5; this case verifies whether the same failure mode reproduces on berkeyexpert.fr.

During this test, the manual tester should also distinguish two possibilities: (a) the endpoint is **by design** parameter-required and the failure is the request shape, or (b) the endpoint regressed and a previously-working call shape now fails.

## Environment

- https://www.berkeyexpert.fr/rest/V1/xinteractive-deliveryrules/delivery

## Preconditions

- A terminal with `curl` available, or Postman / Insomnia.
- Chrome desktop browser with DevTools (Network panel).
- Optional: read access to the `XInteractive_DeliveryRules` module source for context on the endpoint's expected parameter contract.

## Steps to Reproduce

### Step 1: From a terminal, run `curl -i 'https://www.berkeyexpert.fr/rest/V1/xinteractive-deliveryrules/delivery'`. Note the HTTP status code returned.

### Step 2: Identify the expected parameter contract by reading the `XInteractive_DeliveryRules/etc/webapi.xml` definition and the linked controller class.

### Step 3: Retry the call with the parameters identified in Step 2 — for example `curl -i 'https://www.berkeyexpert.fr/rest/V1/xinteractive-deliveryrules/delivery?postcode=75001'` (or whichever French postcode shape the controller expects), or with a POST body, or with a customer-session bearer token. Note which shape (if any) yields HTTP 200.

### Step 4: Open Chrome DevTools → Network panel. Navigate to `https://www.berkeyexpert.fr/checkout/` with a populated cart. Filter for any front-end request to `xinteractive-deliveryrules/delivery`. If the front-end calls this endpoint successfully, capture the exact request shape (method, URL, query params, headers, body).

### Step 5: Compare the front-end's working request shape (from Step 4) to the parameter-less probe in Step 1. If the front-end works but the bare GET fails, the 400 is by-design and the endpoint contract should be documented. If the front-end ALSO fails with 400, this is a real production regression and the controller needs investigation.

---

**Expected Result:** Either (a) `GET /rest/V1/xinteractive-deliveryrules/delivery` returns HTTP 200 for an unauthenticated, parameter-less probe, or (b) the parameter contract is documented and a correctly-formed call returns HTTP 200. The front-end on `/checkout/` should not log resource-load errors against this endpoint in the console.

**Actual Result:** `GET /rest/V1/xinteractive-deliveryrules/delivery` returns HTTP **400** for an unauthenticated, parameter-less call. The pattern reproduces in the same shape as on the AllPrepare sibling site, strongly suggesting this is shared platform-level behavior (`XInteractive_DeliveryRules` module configured identically across both stores) rather than a site-specific regression.

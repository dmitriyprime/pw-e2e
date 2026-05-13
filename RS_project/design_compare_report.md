# Design Comparison Report

**Date:** 2026-05-13
**Scope:** Live homepage vs. Figma design — Desktop + Tablet
**Sources:**
- Live desktop screenshot: `https://drive.google.com/file/d/19aO1JPuXEQ0CifIp1S-s4JWOAWHdOhgE/view`
- Live tablet screenshot: `https://drive.google.com/file/d/19lgi7SuS2LtN0iVDuqV6v4g2psJsCwhq/view`
- Figma export (3-column composite: Desktop / Tablet / Mobile): `https://drive.google.com/file/d/1XahRU4Yy0_q2CWy94s6Hz2L3wNASu9kN/view`

---

# Part A — Desktop

---

## 1. Executive Summary

Overall, the live site implementation **closely follows the Figma design** at a structural and stylistic level. The page sections, ordering, grid system, color palette (blue / yellow / red accents), typography hierarchy, and footer architecture all match between the two.

The most visible deviations are **content-level differences in the hero zone and the first promotional row** — these appear to be campaign/seasonal swaps rather than implementation defects. A handful of smaller layout/visual deltas exist further down the page and are listed below by section.

| Area | Status |
|---|---|
| Top promo bar | Match |
| Header / navigation | Match |
| Hero banner | **Different content** (campaign swap) |
| Promo row under hero | **Different content** (campaign swap) |
| "Up to 40% Off" product section | Match (different campaign label) |
| Product grids | Match |
| About + 25-Years badge | Match |
| Recommended / Recently Viewed | Match |
| "Restaurant Supply Deals and Promotions" block | Match |
| Two-card row (Equipment / Price Guarantee) | Match |
| Large "Designing and Building…" banner | Match |
| "Restaurant Equipment and Supplies…" icon grid | Match |
| "Why Restaurants Choose…" + USA map | Match |
| Customer testimonials | Minor — see §3.7 |
| Brand logo grid | Match |
| "Behind the Line" blog cards | Match |
| Footer | Match |

---

## 2. What Matches Well

The implementation is faithful to the design in the following respects:

1. **Page section order and vertical rhythm** — every Figma section appears in the same order on the live site.
2. **Color system** — primary blue (`#0F4C8E` family), CTA red, accent yellow, and neutral grays all carry over.
3. **Typography hierarchy** — H1/H2/H3 sizing relative to body copy is consistent; bold weights match.
4. **Grid systems** — 4-column product grid, 6-column logo grid, 4-column blog card grid all align.
5. **Component design** — product cards (image / title / star rating / red price / blue CTA), testimonial cards, badge "OVER 25 YEARS OF INDUSTRY EXCELLENCE", and the footer accordion all match visually.
6. **Iconography and imagery** — equipment icons, USA map illustration, and the warehouse hero image are the same assets.
7. **Footer** — column structure (Explore / Shop Now / Resources / About Us / Need Help / Sign Up & Save), social icon row, and legal/utility row are pixel-equivalent.

---

## 3. Section-by-Section Differences

### 3.1 Hero Banner (above the fold) — **Different content**

| | Figma | Live |
|---|---|---|
| Background | Solid **red** with white text | Solid **blue** with white text |
| Headline | "Manitowoc Nugget Ice Machines" | Hoshizaki-branded headline ("…Impressive Hotel Ice Dispensers" / similar) |
| Left visual | Standalone ice machine product shot | Product render with packaging |
| Right visual | Lifestyle kitchen-with-ice scene | Different lifestyle/equipment scene |
| CTA chip | "Shop Now" pill | "Shop Now" pill (same component) |

**Likely cause:** The hero is a CMS-managed promotional banner. The Figma snapshot was authored for a Manitowoc / "President's Day" push; the live site is currently showing a Hoshizaki campaign. The underlying component is the same — only the content was swapped.

**Action:** Confirm with the marketing/CMS owner whether the Manitowoc creative is meant to be live now. If yes, swap the banner content; if no, mark this as **expected drift** and ignore.

---

### 3.2 Promo Row Under Hero — **Different content, same layout**

Both versions show **four equally sized promotional tiles** in a single horizontal row directly under the hero. The grid, spacing, and card chrome match. The internal imagery / copy / brand call-outs differ between Figma and live, again consistent with a CMS swap.

**Action:** Same as §3.1 — verify whether these tiles should currently be the Figma versions.

---

### 3.3 "Up to 40% OFF" Featured Section — Label mismatch only

| | Figma | Live |
|---|---|---|
| Section heading | "Up to 40% OFF \| **President's Day Deals**" | "Up to 40% Off \| **Corporate Products**" |
| Yellow accent strip | Present | Present |
| Product cards underneath | 4-col grid, identical card layout | 4-col grid, identical card layout |

The visual treatment of the heading bar (yellow band, dark text, right-aligned "View All" link) is identical. Only the campaign sub-label differs — again, almost certainly a content/campaign swap.

---

### 3.4 About RestaurantSupply.com + "25 Years" Badge — Match

Two-column layout: paragraph on the left, blue/yellow badge card on the right ("OVER 25 YEARS OF INDUSTRY EXCELLENCE"). Both versions match. The badge's gradient, the laurel ornament, and the bottom blue bar are identical.

---

### 3.5 Recommended for You — Match

Four-column product carousel with left/right chevrons. Card chrome (image, title, rating, red price, blue CTA) is identical. Products shown differ between Figma and live, but this is dynamic personalized content.

---

### 3.6 Recently Viewed Items — Match

Same carousel pattern as §3.5. No layout discrepancies.

---

### 3.7 "Restaurant Supply Deals and Promotions" + Two-Card Row — Match

- Yellow heading band: present in both.
- Two side-by-side cards beneath:
  - **Left:** blue "RESTAURANT EQUIPMENT" panel with photographic background.
  - **Right:** yellow "Our 30-Day Lowest Price Guarantee" panel.

Both versions show the same image crops, headline placement, and CTA position. **No deviation.**

---

### 3.8 Large "Designing and Building Restaurants That Work" Banner — Match

Full-width warehouse/industrial image with overlay text and a right-side CTA. Implementation matches the Figma exactly, including the dark gradient overlay strength.

---

### 3.9 "Restaurant Equipment and Supplies for Commercial Kitchens" Icon Grid — Match

Six-column icon row with category labels (Refrigeration, Cooking Equipment, Smallwares, etc.). Identical icons and spacing.

---

### 3.10 "Why Restaurants Choose RestaurantSupply.com" + USA Map — Match

Two-column block: copy left, "Trusted by Restaurants Nationwide" map card right. The map illustration, dot density, and color are identical.

---

### 3.11 Customer Testimonials — Minor difference

| | Figma | Live |
|---|---|---|
| Visible testimonial cards in row | **4** | **5** |
| Card design | Same | Same |
| "4.7/5" Trustpilot summary on left | Present | Present |

The live site renders **one additional testimonial card** in the visible row compared to the Figma export. This may be a carousel that paginates differently, or the live grid wraps differently at the captured viewport width. Worth confirming the intended count.

---

### 3.12 "Commercial Restaurant Equipment Brands We Carry" Logo Grid — Match

Two-row × 6-column grayscale logo grid. The same brands appear in both (Vulcan, Jaco, Hatco, Hoshizaki, Pivex, Avantco, etc.). Match.

---

### 3.13 "Behind the Line: Restaurant Supply Store Guides & Resources" — Match

Four-column blog/article card grid with image, title, excerpt, and "Read more" link. Layout and styling match the Figma.

---

### 3.14 Footer — Match

Blue footer with:
- "OVER 25 YEARS" badge on the far left
- Five link columns (Explore / Shop Now / Resources / About Us)
- Right-side "Need Help" + "Sign Up & Save" panel with email/SMS sign-up and "Get $30 Off" CTA
- Social icon row (Facebook, X, Instagram, LinkedIn, etc.)
- Legal/utility row at the very bottom (Accessibility, Shipping, Privacy Policy, etc.)

All elements present and aligned per the Figma.

---

## 4. Summary of Real (Non-Content) Discrepancies

After filtering out content/campaign drift, the only structural/visual discrepancy worth investigating is:

1. **Testimonial row card count** (§3.7) — Figma shows 4 visible cards, live shows 5. Confirm whether the design intended a 4- or 5-card visible state at desktop width.

Everything else that differs visually is **CMS-driven content** (hero, promo tiles, featured-section label) and not an implementation bug.

---

## 5. Recommendations

1. **Confirm hero + promo-row content** with marketing — is the Manitowoc / President's Day creative meant to be live right now? If yes, schedule the swap. If no, the Figma is stale and should be re-exported with the current Hoshizaki creative.
2. **Audit the testimonial row** at a 1440px viewport to confirm whether 4 or 5 cards is the intended visible count, and adjust either the design or the grid.
3. **No engineering changes required** for the remaining sections — they are faithful to the design.

---

## 6. Method / Notes

- The Figma export was a composite of Desktop / Tablet / Mobile stacked horizontally. The desktop column (left ~40% of the export, ≈1500 px wide) was isolated programmatically before comparison.
- Comparison was done visually at a normalized 800 px viewing width across vertically-split chunks of both screenshots.
- This report covers **layout, structure, and visible styling**. It does **not** cover: pixel-perfect spacing audits, computed CSS values, accessibility checks, or responsive breakpoint correctness.

---

# Part B — Tablet

**Scope of this section:** Live tablet homepage vs. the center column of the Figma multi-breakpoint export.

**Method note:** The tablet column in the Figma export was isolated by detecting the dark-background gaps between the three breakpoint artboards — it sits at x≈1996–2763 (width **768 px**, matching iPad Mini portrait exactly). The live tablet screenshot supplied by the user is `492 × 5672` (rendered at a narrower width than our iPad-Mini emulation would produce — see the §B.7 note); both images were normalized to a 600-px viewing width and split into vertical chunks for inspection.

## B.1 Executive Summary

The tablet view broadly matches the Figma at the **structural level** — same section order, same components, same color palette. The differences split into the same two buckets as the desktop comparison plus one new bucket:

1. **Content drift (expected)** — hero campaign, promo tiles, featured-section heading, and product picks all differ. Same root cause as desktop: the live CMS is showing a different campaign than the Figma was authored against.
2. **Genuine deviations (need decisions)** — footer wording, missing/extra footer elements, and a couple of responsive-layout choices that diverge from the Figma.
3. **Responsive boundary behavior** — at the tablet width, the live site already collapses some two-column blocks that the Figma still draws side-by-side. This is a real breakpoint mismatch, not content.

| Area | Status |
|---|---|
| Top promo bar | Match (different copy) |
| Header / search / nav | Match |
| Hero banner | **Different content** (campaign swap) |
| Promo row under hero | **Different layout** — Figma 2×2 grid, live shows stacked banners |
| Featured product section | **Different heading + card count** (campaign swap) |
| "OVER 25 YEARS" badge + About text | Match |
| Recommended for You | Match (different products — dynamic) |
| Recently Viewed | Match |
| "Restaurant Supply Deals and Promotions" | Match |
| Two-card row (Equipment / Price Guarantee) | Match |
| "Designing and Building…" composite | **Layout differs at tablet** — see §B.3 |
| "Shop by Categories" icon grid | Match (icon labels differ; see §B.4) |
| "Trusted by Restaurants Nationwide" map block | **Layout differs at tablet** — see §B.5 |
| "Why Restaurants Choose…" copy block | Match |
| Customer testimonials | **Carousel pages differently** — see §B.6 |
| Brand logo grid | Match |
| "Behind the Line" blog grid | Match (different posts — dynamic content) |
| Trust badges row (price match / $30 / shipping) | Match |
| Footer columns | Match |
| Footer legal row | **Wording mismatch** — see §B.7 |
| Footer extras (hours, TrustedSite, chat widget) | **Present on live, absent in Figma** — see §B.7 |
| Copyright year | Figma "© 2006–2023" vs live "© 2026" (stale Figma) |

## B.2 Hero and Promo Tiles — Different content

| | Figma (tablet) | Live (tablet) |
|---|---|---|
| Hero background | Solid **red** Manitowoc Nugget Ice campaign | **Blue** Scotsman campaign with additional stacked banners ("CookTek", "GoJo San Jamar") |
| Promo row below hero | **2×2 grid** of small cards: "Flexible Payments Your Way", "$250 Off Any Kitchen Appliance", etc. | Multiple banners **stacked vertically**, taking more vertical space |
| Featured-section heading | "President's Day Event — Free Shipping" (yellow) | "Up to 60% Off — Clearance Products" (yellow) |
| Featured-section product count | 4 product cards in row | 3 product cards in row |

**Cause:** All four of these are CMS-driven promotional content. The promo-tile layout shape (2×2 grid vs. stacked banners) **is** worth a look — the Figma's 2×2 layout is more compact at the tablet width and is closer to the design intent. Worth checking whether the live site can render a 2×2 tile arrangement at this breakpoint rather than stacking them.

## B.3 "Designing and Building Restaurants That Work" — Responsive layout differs

- **Figma (tablet):** Warehouse photo on the left, blue text panel + CTA on the right, side-by-side.
- **Live (tablet):** Warehouse photo full-width on top, blue text panel + CTA stacked **below** it.

This is a real breakpoint-handling difference: the live site is collapsing to a stacked layout at the tablet width, while the Figma still draws this section as two columns. Either the Figma is wrong about the tablet behavior or the live site is collapsing too early. **Confirm with the designer which is intended.**

## B.4 "Shop by Categories" Icon Grid — Match (labels differ slightly)

Same 4-column icon grid in both versions. The icon set is identical between Figma and live (Refrigeration, Cooking Equipment, Smallwares, Tabletop, Food Preparation, Janitorial Supplies, Restaurant Dinnerware, Commercial Furniture, Disposables, 3M Brands). No structural deviation.

## B.5 "Trusted by Restaurants Nationwide" Map Block — Responsive layout differs

- **Figma (tablet):** Heading + supporting copy on the **left**, USA dot map on the **right**, side-by-side.
- **Live (tablet):** Heading + copy at the **top**, USA map below, stacked. The "Why Restaurants Choose…" supporting paragraph and "Shop All Restaurant Equipment" CTA sit below the map in a separate light-blue card.

Same pattern as §B.3 — the live site collapses an intended two-column layout at the tablet breakpoint. Worth confirming intent.

## B.6 Customer Testimonials — Carousel paging differs

- **Figma (tablet):** Shows ~3–4 testimonial cards in the visible row.
- **Live (tablet):** Shows only **2** cards plus left/right carousel arrows.

The card design itself is identical. Only the visible-page size of the carousel differs. Decide whether the live carousel should expose more cards at this breakpoint to match the Figma.

## B.7 Footer — Real deviations

Three distinct findings, all in the footer:

**(a) Legal-row wording mismatch**
- Figma: `Accessibility · Shipping & Receiving · Payment Methods · Terms & Conditions · Privacy · Return Policy · Tax Exempt Program · California Supply Chain Act`
- Live:  `Accessibility · Shipping & Receiving · Payment Methods · Terms & Conditions · Privacy · Return Policy · Sales Tax Exempt · California Supply Chain Act`

→ One label was renamed: **"Tax Exempt Program" → "Sales Tax Exempt"**. Confirm which is canonical.

**(b) Items present on the live site but missing from the Figma**
- Two "hours available" bullets next to the live-chat / call buttons:
  - `● Sales Available M-F 8:00am – 8:00pm EST`
  - `● Support Available M-F 8:00am – 10:00pm EST`
- A **TrustedSite** trust-seal badge at the very bottom of the footer.
- A **floating chat-widget icon** anchored bottom-right.

→ These are real on the live site but absent from the Figma. Either the Figma is stale and should be updated, or these items should not be live. **Decide direction.**

**(c) Copyright year drift**
- Figma: `© 2006 – 2023`
- Live:  `© 2026`

→ Figma copyright is two years stale. Update the design source if anyone references it.

## B.8 Live Screenshot Width Note (method caveat)

The live tablet screenshot you provided is **492 × 5672**. That is narrower than what our `capture-screenshots.ts` script would emit at the iPad-Mini emulation we configured (Playwright's `iPad Mini` device descriptor renders the page at 768 CSS-pixels wide and produces a screenshot at 1536 × N due to its 2× device-scale-factor). The 492-wide screenshot you supplied looks like it was captured by a different tool or downscaled before sharing. The structural findings in this section hold regardless of the exact pixel width, but for **pixel-accurate** visual comparison going forward we should compare the Figma's 768-wide tablet column against a 768-wide live screenshot — for example the one our script writes to `tests/e2e/reports/screenshots/homepage-tablet-<date>.png`.

## B.9 Tablet — Action Summary

| # | Finding | Type | Suggested action |
|---|---|---|---|
| 1 | Hero + promo tiles differ from Figma | Content | Confirm with marketing whether Figma campaign should be live |
| 2 | Promo tiles render as a vertical stack instead of 2×2 grid at tablet | Layout | Check whether tablet can render the 2×2 grid; align live to Figma if so |
| 3 | "Designing and Building…" collapses to stacked at tablet (Figma is side-by-side) | Responsive | Confirm intended tablet behavior with designer |
| 4 | "Trusted by Restaurants Nationwide" collapses to stacked at tablet | Responsive | Same as #3 |
| 5 | Testimonial carousel shows 2 cards live vs ~3–4 in Figma | Carousel config | Decide intended visible-card count at tablet |
| 6 | Footer legal label: "Tax Exempt Program" vs "Sales Tax Exempt" | Wording | Pick canonical wording, update both |
| 7 | Footer has live extras (hours, TrustedSite, chat widget) not in Figma | Missing in design | Update Figma or remove from live |
| 8 | Copyright year stale in Figma (2023 vs 2026) | Design housekeeping | Update Figma |

> **Correction (added after the mobile pass):** Finding #7 above lists the green "Sales Available / Support Available" hours bullets as missing in Figma. The mobile pass shows the Figma **mobile** column **does** contain those bullets — see §C.7. The tablet Figma column may also contain them lower in the footer than my crop captured; treat the "hours bullets missing" claim as **uncertain** for the tablet breakpoint and confirm against the original Figma file before acting. The TrustedSite badge and floating chat widget findings stand.

---

# Part C — Mobile

**Scope of this section:** Live mobile homepage vs. the right column of the Figma multi-breakpoint export.

**Method note:** The mobile column in the Figma export sits at x≈2876–3488 (width ≈ 612 px in the source PNG — close to a 375 px artboard rendered at ~1.6× density). The live mobile screenshot you supplied is `324 × 8950` (looks like a phone capture at roughly the iPhone-13 CSS width, ~1× density). Both images were normalized to a 450-px viewing width and split into vertical chunks for inspection.

## C.1 Executive Summary

The mobile view is the **most divergent** of the three breakpoints. Section ordering, components, color palette, and typography all match — but **the live page is 66% taller than the Figma at the same width** (12,430 px vs 7,470 px when both are rendered at 450 px wide). That extra vertical real estate is spread across the whole page, not concentrated in any one section — meaning the live mobile is using consistently more generous padding, larger images, taller product cards, and more whitespace than the Figma calls for.

The mobile breakpoint also surfaces some footer findings that **correct** observations from the tablet pass (the hours-availability bullets are in fact in the Figma — see §C.7).

| Area | Status |
|---|---|
| Top promo bar | Match (different copy) |
| Header (hamburger / logo / search / cart) | Match |
| "30-Day Lowest Price Match Guaranteed" stripe | Match |
| Top Picks at Restaurant Supply tag | Match |
| Hero banner | **Different content + visually heavier on live** — see §C.2 |
| "FREE SHIPPING All Orders $2,500+" banner | Match |
| Featured product section | **Different heading + countdown style** — see §C.2 |
| "OVER 25 YEARS" badge | Match (with a small inconsistency — see §C.8) |
| About RestaurantSupply.com | Match |
| Recommended / Recently Viewed | Match (different products — dynamic) |
| "Restaurant Supply Deals and Promotions" | Match |
| Yellow promo banner with discount code | Match |
| Warehouse banner | Match |
| "Designing and Building Restaurants That Work" | Match |
| "Shop by Category" 2×2 icon grid | Match |
| "Trusted by Restaurants Nationwide" map | Match |
| "Why Restaurants Choose…" copy | Match |
| Customer testimonials | Match (carousel) |
| Brand logo grid (2-column) | Match |
| Behind the Line blog cards | Match (different posts — dynamic) |
| "Back to top" + Footer | Match structurally — see §C.7 for wording deltas |
| Footer accordion default state | **Different default** — see §C.6 |
| Footer copyright year | Figma "© 2025" vs live "© 2026" |
| Footer legal label | **"Tax Exempt Program" → "Sales Tax Exempt"** (same as tablet) |
| TrustedSite badge | **Present on live, absent in Figma mobile** |

## C.2 Hero and Featured Product Section — Different content

| | Figma (mobile) | Live (mobile) |
|---|---|---|
| Top promo bar copy | "Black Friday Deals — UP TO 45% off" on red | Current promo (blue bar) |
| Hero headline | "Manitowoc Nugget Ice Machines" with red full-bleed treatment | "Manitowoc Hotel Ice Dispensers" on a softer white card |
| Hero visual treatment | Red background, large ice-machine photo, "Free Shipping" pill overlay | White card, product render, smaller image |
| Featured-section heading | "President's Day Deals — Free Shipping" | "Up to 45% Off — Clearance Products" |
| Countdown timer | Present (`1d 21h 37m 23s` format) | Present (same component) |
| Visible product cards | 2 cards with "#1 Best Seller" badge, "CLEARANCE" tag, FREE SHIPPING line | 2 cards, similar pattern |

Same brand (Manitowoc) is featured in both, but the SKUs and the campaign framing differ. This is a CMS swap — the underlying components (hero card, countdown, product card) match. The countdown timer renders correctly on the live site, matching the Figma intent.

## C.3 Vertical Spacing — Live mobile is ~66% taller than Figma at the same width

This is the headline finding for the mobile breakpoint and applies **section-by-section, not just to one block**:

- Figma mobile content height (normalized to 450 px wide): **~7,470 px**
- Live mobile content height (normalized to 450 px wide): **~12,430 px**
- Live is ~166% of Figma height — i.e., ~50% more vertical real estate

Concretely, in the same vertical span:
- By the bottom of the **first 1,500-px chunk**, Figma has already shown the hero, promo tiles, "President's Day" featured products, the "25 years" badge, AND begun the "About RestaurantSupply.com" copy. The live site at the same y-position has only shown the hero, "Free Shipping" banner, and the first 2 cards of the featured section.
- The same delta is visible in chunks 2–5: Figma covers Recommended → Recently Viewed → Deals → Designing-and-Building → Shop-by-Category → Trust Map → Testimonials → Brand logos → Blog header within ~5 chunks; the live page needs ~8 chunks to cover the same ground.

**Likely causes** (any combination of these would produce the effect):
- Larger product-card images on the live site.
- More vertical padding/margins around section headers.
- Hero on live takes more space because of the white-card treatment plus additional sub-banners.
- Yellow promo banner and warehouse image are rendered larger on live.

**Why this matters:** mobile users have to scroll noticeably more on the live site than the Figma intends. The first scroll-screen on mobile is the most valuable real estate in commerce — if the Figma intended users to see "President's Day featured products + 25-year badge" in the first scroll-screen, but the live site hides everything past the hero, the conversion funnel is materially different from what was designed.

**Recommendation:** Spot-check the live mobile CSS for any global section padding (e.g., `section { padding-block: 4rem }`) that's heavier than the design tokens specified in the Figma file. Also check product-card image sizes — those often dominate vertical rhythm on mobile.

## C.4 "Designing and Building Restaurants That Work" — Match (both stacked on mobile)

Unlike at tablet width (where Figma was side-by-side and live was stacked — see §B.3), at mobile width **both** Figma and live render this section as a stacked layout (image on top, blue text panel + CTA below). Match — no action.

## C.5 "Trusted by Restaurants Nationwide" — Match (both stacked on mobile)

Same as §C.4 — both versions stack the heading/copy above the USA map at mobile width. Match.

## C.6 Footer Accordion Default State — Differs

- **Figma (mobile):** The "Customer Service" accordion is **expanded by default**, showing the six links (Check Order Status, Request & Quote, Price Match Guarantee, Contact Us, Provide Feedback, Help & FAQs). The "Shop Now", "Resources", and "About Us" accordions are collapsed.
- **Live (mobile):** **All four** accordions (Customer Service, Shop Now, Resources, About Us) are **collapsed by default**.

→ Decide which is the intended initial state. Expanding Customer Service by default makes order/contact links discoverable without an extra tap; collapsing everything keeps the footer compact. Both are defensible — confirm intent.

## C.7 Footer Wording, Hours Bullets, TrustedSite, Copyright

**(a) Hours-availability bullets — both have them**
- Figma mobile footer: shows the same green-dotted bullets seen on live:
  - `● Sales Available M-F 8:00am – 8:00pm EST`
  - `● Support Available M-F 8:00am – 10:00pm EST`
- Live mobile footer: identical bullets present.

→ Match. (This corrects the tablet observation — see the correction note above §C.)

**(b) Legal-row wording mismatch — same as tablet**
- Figma: `Tax Exempt Program`
- Live:  `Sales Tax Exempt`

→ This label is inconsistent on **both tablet and mobile** Figma columns vs. live. That cross-breakpoint consistency makes it almost certainly a real rename that was done on the live site but never propagated back to the Figma. Pick a canonical wording.

**(c) TrustedSite badge — live only**
- Figma mobile: not present.
- Live mobile: TrustedSite green check-mark badge at the very bottom, after the copyright line.

→ Same finding as tablet. Either add to the Figma or remove from the live site.

**(d) Copyright year**
- Figma mobile: `© 2025 RestaurantSupply.com`
- Live mobile: `© 2026 RestaurantSupply.com`

→ Figma copyright is one year stale. Worth noting: the **tablet** Figma column showed `© 2006 – 2023` while the **mobile** column shows `© 2025`. The Figma source itself is internally inconsistent across breakpoints — surface this to the design owner.

## C.8 Minor visual inconsistency in the Figma source — "25 YEARS" vs "20 YEARS" badge

The "OVER N YEARS OF INDUSTRY EXCELLENCE" badge appears in two places on the mobile design:
- Above the "About RestaurantSupply.com" section: reads **"OVER 25 YEARS"**.
- Inside the footer (top-left, next to the logo and tagline): visually appears to read **"OVER 20"** (rendered small at this crop resolution — could be a render/legibility artifact at 450 px wide).

The live site uses **"OVER 25 YEARS"** consistently. If the Figma footer badge really does say "20", that's a typo in the design source. Worth a glance at the original Figma file at native resolution to confirm.

## C.9 Mobile — Action Summary

| # | Finding | Type | Suggested action |
|---|---|---|---|
| 1 | Hero + featured section show different campaign content from Figma | Content | Confirm with marketing whether Figma campaign should be live |
| 2 | **Live mobile page is 66% taller than Figma at the same width** | Spacing / sizing | Audit global section padding + product-card image sizes against the Figma tokens; this is the highest-impact finding for mobile UX |
| 3 | Hero visual treatment heavier on live (white card, sub-banners) vs Figma (single red bleed) | Layout | Confirm intended hero density at mobile |
| 4 | Customer Service accordion expanded in Figma, collapsed on live | Component state | Pick intended default and align |
| 5 | Footer legal label "Tax Exempt Program" vs "Sales Tax Exempt" | Wording | Same finding as tablet — pick canonical wording, update both |
| 6 | TrustedSite badge present on live, absent in Figma | Missing in design | Same as tablet — update Figma or remove from live |
| 7 | Copyright year: Figma "© 2025", live "© 2026" | Design housekeeping | Update Figma; also fix tablet "© 2006–2023" for internal consistency |
| 8 | Possible "OVER 20" vs "OVER 25" inconsistency inside Figma footer badge | Design source typo? | Verify against original Figma file at native resolution |

---

# Part D — Cross-Breakpoint Roll-Up

The three breakpoint passes together produce a consolidated list. Items appearing across two or more breakpoints are the highest-confidence findings.

| # | Finding | Breakpoints affected | Type |
|---|---|---|---|
| 1 | Hero + promotional content differs from Figma | Desktop · Tablet · Mobile | Content (CMS swap — confirm with marketing) |
| 2 | Featured-section heading differs from Figma | Desktop · Tablet · Mobile | Content |
| 3 | Footer legal label "Tax Exempt Program" → "Sales Tax Exempt" | Tablet · Mobile | Wording |
| 4 | TrustedSite badge present on live, absent in Figma | Tablet · Mobile | Missing in design |
| 5 | Copyright year stale in Figma | Tablet (2023) · Mobile (2025) | Design housekeeping |
| 6 | Floating chat widget present on live, absent in Figma | Tablet | Missing in design |
| 7 | Promo tiles render stacked instead of 2×2 grid at tablet | Tablet | Layout |
| 8 | "Designing and Building…" + Map blocks collapse to stacked at tablet (Figma side-by-side) | Tablet | Responsive (mobile correctly stacks in both) |
| 9 | Testimonial carousel shows fewer cards on live than Figma | Tablet | Component config |
| 10 | Live mobile page ~66% taller than Figma at same width | Mobile | Spacing / sizing (high impact) |
| 11 | Footer accordion: Customer Service open in Figma, collapsed on live | Mobile | Component default state |
| 12 | Figma copyright inconsistent across breakpoints (2023 vs 2025) | Internal Figma | Design source housekeeping |

**Top three priorities (highest impact, real implementation deltas — not content drift):**
1. **#10** — mobile page is 66% taller than Figma. This affects the entire mobile UX.
2. **#8** — tablet responsive behavior diverges from Figma on two composite blocks.
3. **#3 + #4 + #6** — Footer wording + missing items. Easy fixes once a direction is chosen.

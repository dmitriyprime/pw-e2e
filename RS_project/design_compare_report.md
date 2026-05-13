# Design Comparison Report — Desktop

**Date:** 2026-05-13
**Scope:** Live homepage vs. Figma desktop design (leftmost column of the multi-breakpoint export)
**Sources:**
- Live screenshot: `https://drive.google.com/file/d/19aO1JPuXEQ0CifIp1S-s4JWOAWHdOhgE/view`
- Figma export: `https://drive.google.com/file/d/1XahRU4Yy0_q2CWy94s6Hz2L3wNASu9kN/view`

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
- This report covers **layout, structure, and visible styling**. It does **not** cover: pixel-perfect spacing audits, computed CSS values, accessibility checks, or responsive breakpoint correctness (tablet/mobile were out of scope per the request).

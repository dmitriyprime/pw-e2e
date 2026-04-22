# Language Testing Report

**Date:** 2026-04-22
**Site:** https://www.unitcity.nl
**Total pages tested:** 1204 (43 pages × 28 languages)

## Scope

The following page types were tested across all 28 languages:

- **Home page**
- **Main pages** — top-level sections (business services, residence permits, supporting services, etc.)
- **Service pages** — individual service pages (company incorporation, start-up visa, 30% ruling, etc.)
- **Calculator page**
- **Contact us page**
- **Blog post pages**

## Summary

| # | Code | Language | Passed | Failed | HTML lang | Text detection | Status |
|---|------|----------|--------|--------|-----------|----------------|--------|
| 1 | bg | Bulgarian | 43 | 0 | OK | OK | PASS |
| 2 | bn | Bengali | 43 | 0 | OK | OK | PASS |
| 3 | cs | Czech | 43 | 0 | OK | OK | PASS |
| 4 | de | German | 43 | 0 | OK | OK | PASS |
| 5 | es | Spanish | 43 | 0 | OK | OK | PASS |
| 6 | et | Estonian | 43 | 0 | OK | OK | PASS |
| 7 | fi | Finnish | 43 | 0 | OK | OK | PASS |
| 8 | fr | French | 43 | 0 | OK | OK | PASS |
| 9 | hi | Hindi | 43 | 0 | OK | OK | PASS |
| 10 | hu | Hungarian | 43 | 0 | OK | OK | PASS |
| 11 | ind | Indonesian | 43 | 0 | OK | OK | PASS |
| 12 | it | Italian | 43 | 0 | OK | OK | PASS |
| 13 | ja | Japanese | 43 | 0 | OK | OK | PASS |
| 14 | ka | Georgian | 0 | 43 | OK | misdetected as "et" | FAIL |
| 15 | kk | Kazakh | 0 | 43 | OK | misdetected as "ru" | FAIL |
| 16 | ko | Korean | 43 | 0 | OK | OK | PASS |
| 17 | ky | Kyrgyz | 0 | 43 | site uses "kir" | OK | FAIL |
| 18 | lt | Lithuanian | 43 | 0 | OK | OK | PASS |
| 19 | lv | Latvian | 43 | 0 | OK | OK | PASS |
| 20 | nl | Dutch | 43 | 0 | OK | OK | PASS |
| 21 | pt | Portuguese | 43 | 0 | OK | OK | PASS |
| 22 | ro | Romanian | 43 | 0 | OK | OK | PASS |
| 23 | ru | Russian | 43 | 0 | OK | OK | PASS |
| 24 | sr | Serbian | 0 | 43 | OK | misdetected as "hr" | FAIL |
| 25 | tr | Turkish | 43 | 0 | OK | OK | PASS |
| 26 | uk | Ukrainian | 43 | 0 | OK | OK | PASS |
| 27 | uz | Uzbek | 0 | 43 | OK | misdetected as "so" | FAIL |
| 28 | zh | Chinese | 43 | 0 | OK | OK | PASS |

## Results by Language

### bg — Bulgarian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### bn — Bengali ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### cs — Czech ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### de — German ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### es — Spanish ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### et — Estonian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### fi — Finnish ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### fr — French ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### hi — Hindi ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### hu — Hungarian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ind — Indonesian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### it — Italian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ja — Japanese ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ka — Georgian ❌ FAIL

- **Pages tested:** 43
- **Passed:** 0
- **Failed:** 43
- **Text detection issue:** `langdetect` misidentifies content as `"et"`

### kk — Kazakh ❌ FAIL

- **Pages tested:** 43
- **Passed:** 0
- **Failed:** 43
- **Text detection issue:** `langdetect` misidentifies content as `"ru"`

### ko — Korean ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ky — Kyrgyz ❌ FAIL

- **Pages tested:** 43
- **Passed:** 0
- **Failed:** 43
- **HTML lang issue:** site sets `lang="kir"` instead of `"ky"`

### lt — Lithuanian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### lv — Latvian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### nl — Dutch ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### pt — Portuguese ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ro — Romanian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### ru — Russian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### sr — Serbian ❌ FAIL

- **Pages tested:** 43
- **Passed:** 0
- **Failed:** 43
- **Text detection issue:** `langdetect` misidentifies content as `"hr"`

### tr — Turkish ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### uk — Ukrainian ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0

### uz — Uzbek ❌ FAIL

- **Pages tested:** 43
- **Passed:** 0
- **Failed:** 43
- **Text detection issue:** `langdetect` misidentifies content as `"so"`

### zh — Chinese ✅ PASS

- **Pages tested:** 43
- **Passed:** 43
- **Failed:** 0


# GoAi AI Translator — QA Plan

## 1. Environment Setup

### 1.1 Start the mock API server

The mock server simulates the external AI translation service. It supports two modes:

| Mode | How to start | What you get |
|---|---|---|
| **Mock** (default) | `node qa/mock-api-server.js` | Fields prefixed with language tag, e.g. `[DE] Original Name` — fast, no key needed |
| **DeepL** | `DEEPL_API_KEY=your-key node qa/mock-api-server.js` | Real AI translations via DeepL Free API (500k chars/month free) |

Get a free DeepL key at **https://www.deepl.com/pro-api** (Free plan). Free-tier keys end with `:fx`.

**Requirements:** Node.js (no `npm install` needed — built-ins only).

#### Local Shopware (same machine)

```bash
# Mock mode — no key needed
node qa/mock-api-server.js

# DeepL mode — real translations
DEEPL_API_KEY=your-key node qa/mock-api-server.js

# Custom port (default 8765)
PORT=9000 DEEPL_API_KEY=your-key node qa/mock-api-server.js
```

Verify it's alive (the `mode` field confirms which mode is active):
```bash
curl http://localhost:8765/health
# Mock:  {"status":"ok","server":"GoAi Mock API (Node.js)","mode":"mock"}
# DeepL: {"status":"ok","server":"GoAi Mock API (Node.js)","mode":"deepl"}
```

Use `http://localhost:8765/translate` as the API Endpoint in plugin settings.

#### Remote Shopware server (ngrok tunnel)

Run the mock server and ngrok in two separate terminals on your **local machine**:

```bash
# Terminal 1 — start mock server (add DEEPL_API_KEY=... for real translations)
node qa/mock-api-server.js

# Terminal 2 — expose it publicly (no install needed via npx)
npx ngrok http 8765
```

ngrok prints a Forwarding URL, e.g.:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8765
```

Verify the tunnel works from anywhere:
```bash
curl https://abc123.ngrok-free.app/health
# Expected: {"status":"ok",...}
```

Set **API Endpoint** in the remote Shopware plugin settings to:
```
https://abc123.ngrok-free.app/translate
```

> **Note:** The ngrok URL changes every time you restart ngrok. Update the API
> Endpoint in plugin settings whenever you start a new ngrok session.
> The free tier is sufficient for QA (low request volume).

---

### 1.2 Configure the plugin

Navigate to **Settings > Plugins > GoAi AI Translator**
(`/admin#/goai/translator/settings/index`) and set:

| Field | Value |
|---|---|
| Enable AI Translation | ✅ ON |
| API Endpoint | `http://localhost:8765/translate` |
| Client UID | `test-client-001` |
| Batch Size | `5` |
| Auto-Trigger Translation | ✅ ON (needed for TC-3xx tests) |
| Enable Product Translation | ✅ ON |
| Enable Category Translation | ✅ ON |
| Enable Product Stream Translation | ✅ ON |
| Enable Property Group Translation | ✅ ON |
| Enable Property Option Translation | ✅ ON |
| Enable Manufacturer Translation | ✅ ON |
| Enable Promotion Translation | ✅ ON |

**Source Language:** pick your default language (e.g. English).

**Translation Targets by Language:** enable at least one target language
(e.g. German `de_DE`) and tick all entity-type checkboxes for it. Save.

---

### 1.3 Verify baseline

Open **Content > AI Translations** (`/admin#/goai/translator/logs/index`) — the
queue should be empty before each test group.

---

## 2. Test Cases

Legend: **P** = Pass | **F** = Fail | **N/A** = Not applicable

---

### TC-100 · Plugin Settings UI

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-101 | Open Settings > Plugins > GoAi AI Translator | Page loads with all described settings sections | |
| TC-102 | Disable "Enable AI Translation", save, re-open | Toggle persists as OFF | |
| TC-103 | Re-enable plugin. Enter invalid URL for API Endpoint (e.g. `not-a-url`), save. Click "Translate with AI" on any product. | Error notification appears; queue item shows ERROR status | |
| TC-104 | Set Client UID to `error-test`, try translating a product | Notification shows "Simulated API error for testing"; queue status = Error (API) | |
| TC-105 | Set Client UID back to `test-client-001`. Open Translation Targets table. Tick "Product" checkbox for German row, save. | Checkbox persists after page reload | |
| TC-106 | Click the column header master checkbox for "Product" | All language rows toggle for that entity type | |

---

### TC-200 · Manual Translation — "Translate with AI" Buttons

#### TC-210 · Product

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-211 | Open any product detail page. Click "Translate with AI" button. | Success notification; queue entry created with status Translated | |
| TC-212 | Switch to German language tab on the same product. | `name`, `description`, `metaTitle`, `metaDescription`, `keywords`, `packUnit`, `packUnitPlural` fields start with `[DE]` prefix | |
| TC-213 | Open a **variant product** detail page, click "Translate with AI". | Translation is applied to the **parent** product AND all sibling variants (check each variant's German tab) | |
| TC-214 | Click "Translate with AI" again on the same product immediately. | Notification: "Translation already queued for this entity" (deduplication) | |

#### TC-220 · Category

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-221 | Open any category, click "Translate with AI". | Success notification; category shows `[DE]` translated `name`, `description`, `metaTitle`, `metaDescription`, `keywords` in German | |

#### TC-230 · Other entity types

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-231 | Open a Manufacturer detail page, click "Translate with AI". | German `name` and `description` translated | |
| TC-232 | Open a Property Group, click "Translate with AI". | German `name` and `description` translated | |
| TC-233 | Open a Property Group Option, click "Translate with AI". | German `name` translated | |
| TC-234 | Open a Product Stream (dynamic product group), click "Translate with AI". | German `name` and `description` translated | |
| TC-235 | Open a Promotion, click "Translate with AI". | German `name` translated | |

---

### TC-300 · Auto-Trigger (Translate on Entity Save)

> Prerequisite: "Auto-Trigger Translation" is ON in settings.

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-301 | Edit a product's **name** in the source language, save. | After ~2 min + scheduler runs, a queue entry appears and the product's German name is updated with `[DE]` prefix | |
| TC-302 | Edit the same product while browsing in **German** (not source language). | No queue entry created (only source-language saves trigger auto-translate) | |
| TC-303 | Turn OFF "Auto-Trigger Translation", edit and save a product in source language. | No queue entry is created | |
| TC-304 | Turn "Auto-Trigger Translation" back ON. | Editing a product again creates a queue entry | |

---

### TC-400 · Translation Queue UI

Navigate to **Content > AI Translations**.

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-401 | Translate a product successfully. Open queue page. | Row shows: entity type, linked entity name, target languages, status = Translated | |
| TC-402 | Click the entity name link in the queue row. | Navigates to the product/category/etc. detail page | |
| TC-403 | Set Client UID to `error-test`, translate a product. Open queue. | Row shows status = Error (API), comment column shows the error message | |
| TC-404 | With the error row selected, open context menu → "Reset to New". | Status changes to New | |
| TC-405 | Set Client UID back to `test-client-001`. Select the reset row → context menu → retry (or use "Reset to New" + wait for scheduler). | Status transitions to Translated | |
| TC-406 | Select multiple rows, use mass action "Delete Selected". | Rows disappear from queue | |
| TC-407 | Select multiple rows, use mass action "Reset Selected". | All selected rows status = New | |

---

### TC-500 · Onboarding (Bulk Translation)

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-501 | In Settings > Translation Targets, click "Translate with AI" button for the German row. | Notification confirms bulk queued; all enabled entities for German appear in the queue | |
| TC-502 | Open a Sales Channel detail page, click "Translate with AI". | All enabled entity types for all configured target languages are queued | |
| TC-503 | Run onboarding a second time before queue processes. | Existing NEW/IN_PROGRESS items are not duplicated (deduplication check) | |

---

### TC-600 · Scheduled Processing

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-601 | Trigger auto-save on a product (TC-301 precondition). Wait ≥2 min. Run scheduled task manually: `bin/console scheduled-task:run --no-wait`. | Queue item transitions from New → Pending → Translated | |
| TC-602 | Create 6 queue items (batch size = 5). Run scheduler once. | Only 5 items processed per run; 1 remains New | |

---

### TC-700 · CLI Commands

> Run from Shopware root.

| # | Command | Expected Result | Result |
|---|---|---|---|
| TC-701 | `bin/console goai:translator:queue-status` | Prints counts for each status code | |
| TC-702 | `bin/console goai:translator:translate --entity-type=product --entity-id=<valid-uuid>` | Queue entry created; success message | |
| TC-703 | `bin/console goai:translator:translate --entity-type=product --entity-id=<valid-uuid> --process` | Queue entry created AND immediately processed; product has German translations | |
| TC-704 | `bin/console goai:translator:translate --entity-type=product --entity-id=non-existent-uuid` | Error message printed; no crash | |
| TC-705 | `bin/console goai:translator:translate --entity-type=invalid_type --entity-id=<uuid>` | Validation error message | |

---

### TC-800 · Vocabulary Management

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-801 | Add "BrandName" to **Excluded Terms**. Translate a product whose name contains "BrandName". | Translated German name contains "BrandName" unchanged (not prefixed with `[DE]`) | |
| TC-802 | Enable **Term Replacement** globally. Enable it for Products. Add rule: `[{"search": "[DE]", "replace": "TRANSLATED:"}]`. Translate a product. | German name starts with `TRANSLATED:` instead of `[DE]` | |
| TC-803 | Enter invalid JSON in term replacement rules (e.g. `{broken}`). | Settings save without crash; translation still works (invalid rules ignored, warning in log) | |

---

### TC-900 · Error Handling & Edge Cases

| # | Steps | Expected Result | Result |
|---|---|---|---|
| TC-901 | Disable the plugin master switch. Edit and save a product. | No queue entry created; "Translate with AI" buttons still visible but clicking them returns a meaningful error | |
| TC-902 | Remove all language-entity checkboxes for German (no entity types enabled). Click "Translate with AI" on a product. | Notification: "No target languages have 'product' enabled…" | |
| TC-903 | Stop the mock server. Click "Translate with AI". | Queue item shows Error (API); error message in comment column | |
| TC-904 | Translate a product that has no `name` (null). | Queue item shows Skipped or Translated with only non-null fields applied | |
| TC-905 | Enable **Request/Response Logging**. Translate a product. Check `var/log/dev.log`. | Full request body and response body logged at DEBUG level | |

---

## 3. Queue Status Reference

| Code | Label | Description |
|---|---|---|
| 0 | New | Waiting to be processed |
| 1 | In Progress | Currently being translated |
| 2 | Translated | Completed successfully |
| 3 | Skipped | API returned no data for this entity |
| 21 | Error (API) | AI service returned an error |
| 22 | Error (Save) | Failed writing translated data to DB |
| 23 | Error (Unknown) | Unexpected exception |
| 99 | Pending | Dispatched to Symfony Messenger, not yet handled |

---

## 4. Translatable Fields Reference

| Entity Type | Fields Sent to API |
|---|---|
| Product | name, description, metaDescription, metaTitle, keywords, packUnit, packUnitPlural |
| Category | name, description, metaTitle, metaDescription, keywords |
| Product Stream | name, description |
| Property Group | name, description |
| Property Group Option | name |
| Manufacturer | name, description |
| Promotion | name |

---

## 5. Mock Server — Error Simulation

| Client UID | Behaviour |
|---|---|
| any non-empty value | Normal translated response |
| `error-test` | Returns HTTP 500 with error JSON → queue item status = Error (API) |

To test empty-response / skipped scenario: temporarily edit `mock-api-server.php`
to return `{"success": true, "data": {}}` (empty data map).

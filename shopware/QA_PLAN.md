# GoAi AI Translator — QA Plan

## 1. Environment Setup

### 1.1 Service endpoint

QA runs against the live GoMage AI translation service:

| Setting        | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| API Endpoint   | `https://aia.gomage.com/api/data/ai_translate/translate`       |
| Client UID     | `<your-client-uid>` — credential supplied for the QA tenant    |

The Shopware host must have outbound HTTPS access to `aia.gomage.com`.

Quick reachability check from the Shopware host:

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' \
  -X POST https://aia.gomage.com/api/data/ai_translate/translate \
  -H 'Content-Type: application/json' \
  -d '{"client_uid":"<your-client-uid>","entity_type":"product","entity_id":"00000000-0000-0000-0000-000000000000","data":{"name":"connectivity test"},"target_languages":["de_DE"]}'
```

A non-`000` HTTP code means the host is reachable. Do not loop this — every call counts against the QA tenant's quota.

---

### 1.2 Configure the plugin

Navigate to **Settings > Plugins > GoAi AI Translator**
(`/admin#/goai/translator/settings/index`) and set:

| Field                              | Value                                                              |
| ---------------------------------- | ------------------------------------------------------------------ |
| Enable AI Translation              | ON                                                                 |
| API Endpoint                       | `https://aia.gomage.com/api/data/ai_translate/translate`           |
| Client UID                         | `<your-client-uid>` (use the credential supplied for the QA tenant)|
| Batch Size                         | `5`                                                                |
| Auto-Trigger Translation           | ON (needed for TC-3xx tests)                                       |
| Enable Product Translation         | ON                                                                 |
| Enable Category Translation        | ON                                                                 |
| Enable Product Stream Translation  | ON                                                                 |
| Enable Property Group Translation  | ON                                                                 |
| Enable Property Option Translation | ON                                                                 |
| Enable Manufacturer Translation    | ON                                                                 |
| Enable Promotion Translation       | ON                                                                 |

**Source Language:** pick your default language (e.g. English).

**Translation Targets by Language:** enable at least one target language
(e.g. German `de-DE`) and tick all entity-type checkboxes for it. Save.

---

### 1.3 Verify baseline

Open **Content > AI Translations** (`/admin#/goai/translator/logs/index`) — the
queue should be empty before each test group.

---

## 2. Test Cases

Legend: **P** = Pass | **F** = Fail | **N/A** = Not applicable

---

### TC-100 · Plugin Settings UI

| #      | Steps                                                                                                                                                                                                  | Expected Result                                                                                            | Result |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| TC-101 | Open Settings > Plugins > GoAi AI Translator                                                                                                                                                           | Page loads with all described settings sections                                                            |        |
| TC-102 | Disable "Enable AI Translation", save, re-open                                                                                                                                                         | Toggle persists as OFF                                                                                     |        |
| TC-103 | Re-enable plugin. Set API Endpoint to `not-a-url` (no scheme), save. Click "Translate with AI" on any product.                                                                                         | Queue item ends in status Error (API); comment mentions `Invalid URL`                                      |        |
| TC-104 | Restore the correct API Endpoint. Set Client UID to a clearly invalid value (e.g. `qa-invalid-uid`), translate a product.                                                                              | Queue item ends in status Error (API); comment column captures the upstream error message                  |        |
| TC-105 | Restore the valid Client UID. Open Translation Targets table. Tick "Product" checkbox for German row, save.                                                                                            | Checkbox persists after page reload                                                                        |        |
| TC-106 | Click the column header master checkbox for "Product"                                                                                                                                                  | All language rows toggle for that entity type                                                              |        |
| TC-107 | Toggle every boolean on the page (master switch, every per-entity-type switch, Enable Term Replacement, every per-entity Term Replacement switch, Enable Sender Log), Save, hard-reload (Ctrl+Shift+R) | Every switch reflects the saved state after reload. Repeat in the opposite direction — same persistence    |        |
| TC-108 | Switch admin user locale (top-right user menu) to `Deutsch`, reopen the settings page                                                                                                                  | Translation Targets table renders language names localized (e.g. `Deutsch`, `Englisch`). Switch back to English → names render in English (`German`, `English`) |        |

> **Note (TC-104):** Exact error wording from `aia.gomage.com` depends on the upstream
> service; only the queue status (Error/API) is asserted.

---

### TC-200 · Manual Translation — "Translate with AI" Buttons

#### TC-210 · Product

| #      | Steps                                                              | Expected Result                                                                                                                                          | Result |
| ------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| TC-211 | Open any product detail page. Click "Translate with AI" button.    | Success notification; queue entry created with status Translated                                                                                         |        |
| TC-212 | Switch to German language tab on the same product.                 | `name`, `description`, `metaTitle`, `metaDescription`, `keywords`, `packUnit`, `packUnitPlural` contain German translations (visibly different from the source values, read as natural German) |        |
| TC-213 | Open a **variant product** detail page, click "Translate with AI". | Translation is applied to the **parent** product AND all sibling variants (check each variant's German tab — fields contain German content)             |        |
| TC-214 | Click "Translate with AI" again on the same product immediately.   | Notification: "Translation already queued for this entity" (deduplication)                                                                               |        |

#### TC-220 · Category

| #      | Steps                                         | Expected Result                                                                                                | Result |
| ------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| TC-221 | Open any category, click "Translate with AI". | Success notification; category's German `name`, `description`, `metaTitle`, `metaDescription`, `keywords` contain German translations |        |

#### TC-230 · Other entity types

| #      | Steps                                                                     | Expected Result                                            | Result |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| TC-231 | Open a Manufacturer detail page, click "Translate with AI".               | German `name` and `description` contain German translations |        |
| TC-232 | Open a Property Group, click "Translate with AI".                         | German `name` and `description` contain German translations |        |
| TC-233 | Open a Property Group Option, click "Translate with AI".                  | German `name` contains a German translation                 |        |
| TC-234 | Open a Product Stream (dynamic product group), click "Translate with AI". | German `name` and `description` contain German translations |        |
| TC-235 | Open a Promotion, click "Translate with AI".                              | German `name` contains a German translation                 |        |

---

### TC-300 · Auto-Trigger (Translate on Entity Save)

> Prerequisite: "Auto-Trigger Translation" is ON in settings.

| #      | Steps                                                                            | Expected Result                                                                                                                            | Result |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| TC-301 | Edit a product's **name** in the source language, save.                          | After ~2 min + scheduler runs, a queue entry appears and the product's German `name` is updated with a German translation                  |        |
| TC-302 | Edit the same product while browsing in **German** (not source language).        | No queue entry created (only source-language saves trigger auto-translate)                                                                 |        |
| TC-303 | Turn OFF "Auto-Trigger Translation", edit and save a product in source language. | No queue entry is created                                                                                                                  |        |
| TC-304 | Turn "Auto-Trigger Translation" back ON.                                         | Editing a product again creates a queue entry                                                                                              |        |

---

### TC-400 · Translation Queue UI

Navigate to **Content > AI Translations**.

| #      | Steps                                                                                                                  | Expected Result                                                                   | Result |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| TC-401 | Translate a product successfully. Open queue page.                                                                     | Row shows: entity type, linked entity name, target languages, status = Translated |        |
| TC-402 | Click the entity name link in the queue row.                                                                           | Navigates to the product/category/etc. detail page                                |        |
| TC-403 | Set Client UID to `qa-invalid-uid`, translate a product. Open queue.                                                   | Row shows status = Error (API), comment column shows the upstream error message   |        |
| TC-404 | With the error row selected, open context menu → "Reset to New".                                                       | Status changes to New                                                             |        |
| TC-405 | Restore the valid Client UID. Select the reset row → context menu → retry (or "Reset to New" + wait for scheduler).    | Status transitions to Translated                                                  |        |
| TC-406 | Select multiple rows, use mass action "Delete Selected".                                                               | Rows disappear from queue                                                         |        |
| TC-407 | Select multiple rows, use mass action "Reset Selected".                                                                | All selected rows status = New                                                    |        |

---

### TC-500 · Onboarding (Bulk Translation)

| #      | Steps                                                                                   | Expected Result                                                                        | Result |
| ------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| TC-501 | In Settings > Translation Targets, click "Translate with AI" button for the German row. | Notification confirms bulk queued; all enabled entities for German appear in the queue |        |
| TC-502 | Open a Sales Channel detail page, click "Translate with AI".                            | All enabled entity types for all configured target languages are queued                |        |
| TC-503 | Run onboarding a second time before queue processes.                                    | Existing NEW/IN_PROGRESS items are not duplicated (deduplication check)                |        |

---

### TC-600 · Scheduled Processing

| #      | Steps                                                                                                                                       | Expected Result                                        | Result |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| TC-601 | Trigger auto-save on a product (TC-301 precondition). Wait ≥2 min. Run scheduled task manually: `bin/console scheduled-task:run --no-wait`. | Queue item transitions from New → Pending → Translated |        |
| TC-602 | Create 6 queue items (batch size = 5). Run scheduler once.                                                                                  | Only 5 items processed per run; 1 remains New          |        |

---

### TC-700 · CLI Commands

> Run from Shopware root.

| #      | Command                                                                                          | Expected Result                                                                | Result |
| ------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------ |
| TC-701 | `bin/console goai:translator:queue-status`                                                       | Prints counts for each status code                                             |        |
| TC-702 | `bin/console goai:translator:translate --entity-type=product --entity-id=<valid-uuid>`           | Queue entry created; success message                                           |        |
| TC-703 | `bin/console goai:translator:translate --entity-type=product --entity-id=<valid-uuid> --process` | Queue entry created AND immediately processed; product has German translations |        |
| TC-704 | `bin/console goai:translator:translate --entity-type=product --entity-id=non-existent-uuid`      | Error message printed; no crash                                                |        |
| TC-705 | `bin/console goai:translator:translate --entity-type=invalid_type --entity-id=<uuid>`            | Validation error message                                                       |        |

---

### TC-800 · Vocabulary Management

| #      | Steps                                                                                                                                                                                                                                              | Expected Result                                                                              | Result |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| TC-801 | Add `BrandName` to **Excluded Terms**. Translate a product whose name contains `BrandName`.                                                                                                                                                        | Translated German name still contains `BrandName` unchanged                                  |        |
| TC-802 | Pick a product whose German translation reliably contains the word `Produkt`. Enable **Term Replacement** globally and for Products. Add rule: `[{"search": "Produkt", "replace": "Artikel"}]`. Reset and re-translate the product.                | Translated German name no longer contains `Produkt`; occurrences are replaced with `Artikel` |        |
| TC-803 | Enter invalid JSON in term replacement rules (e.g. `{broken}`).                                                                                                                                                                                    | Settings save without crash; translation still works (invalid rules ignored, warning in log) |        |

---

### TC-900 · Error Handling & Edge Cases

| #      | Steps                                                                                                                                                       | Expected Result                                                                                                | Result |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| TC-901 | Disable the plugin master switch. Edit and save a product.                                                                                                  | No queue entry created; "Translate with AI" buttons still visible but clicking them returns a meaningful error |        |
| TC-902 | Remove all language-entity checkboxes for German (no entity types enabled). Click "Translate with AI" on a product.                                         | Notification: "No target languages have 'product' enabled…"                                                    |        |
| TC-903 | Temporarily set API Endpoint to `https://aia.gomage.invalid/api/data/ai_translate/translate`, click "Translate with AI" on a product. Restore endpoint.     | Queue item shows Error (API); comment column contains text mentioning `Could not resolve host`                 |        |
| TC-904 | Translate a product that has no `name` (null).                                                                                                              | Queue item shows Skipped or Translated with only non-null fields applied                                       |        |
| TC-905 | Enable **Request/Response Logging**. Translate a product. Check `var/log/dev.log`.                                                                          | Full request body and response body logged at DEBUG level                                                      |        |
| TC-906 | Set API Endpoint to `not-a-url` (no scheme). Translate a product. Restore endpoint afterwards.                                                              | Queue item shows Error (API) with code 21; comment column mentions `Invalid URL` (transport-error path)        |        |

---

## 3. Queue Status Reference

| Code | Label             | Description                                          |
| ---- | ----------------- | ---------------------------------------------------- |
| 0    | New               | Waiting to be processed                              |
| 1    | In Progress       | Currently being translated                           |
| 2    | Translated        | Completed successfully                               |
| 3    | Skipped           | API returned no data for this entity                 |
| 21   | Error (API)       | Transport failure or upstream service error          |
| 22   | Error (Content)   | API response could not be parsed / empty payload     |
| 23   | Error (Save)      | DAL write failure when applying translation          |
| 99   | Pending           | Dispatched to Symfony Messenger, not yet handled     |

---

## 4. Translatable Fields Reference

| Entity Type           | Fields Sent to API                                                                |
| --------------------- | --------------------------------------------------------------------------------- |
| Product               | name, description, metaDescription, metaTitle, keywords, packUnit, packUnitPlural |
| Category              | name, description, metaTitle, metaDescription, keywords                           |
| Product Stream        | name, description                                                                 |
| Property Group        | name, description                                                                 |
| Property Group Option | name                                                                              |
| Manufacturer          | name, description                                                                 |
| Promotion             | name                                                                              |

---

## 5. Triggering error states against the live service

The plan no longer relies on a mock server. Use these substitutes to provoke
each error class without touching upstream:

| To trigger              | How                                                                                              | Resulting status |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| Transport — invalid URL | Set API Endpoint to `not-a-url` (no scheme)                                                      | Error (API) / 21 |
| Transport — DNS failure | Set API Endpoint to a host under the reserved `*.invalid` TLD (e.g. `aia.gomage.invalid/...`)    | Error (API) / 21 |
| Upstream rejection      | Use a clearly invalid Client UID (e.g. `qa-invalid-uid`) against the real endpoint               | Error (API) / 21 |

> **Footnote — provoking Error (Content) / 22:** to force an empty/malformed
> response (which the live service won't produce on demand), point the API
> Endpoint at the local mock server `qa/mock-api-server.js` and edit it to
> return `{"success": true, "data": {}}`. This is an offline-only scenario and
> sits outside the standard QA pass.

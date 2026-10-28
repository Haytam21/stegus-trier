# Stegus — Phase 1: Audit & Research Findings

**Date:** 2026-10-28  
**Repo:** /Users/haytamarrafiqui/git/stegus-trier  
**Status:** Phase 1 complete — awaiting Phase 2 (PLAN.md) approval

---

## 1A — Repo Audit

**Source:** code-reviewer agent (read-only audit of all 13 files)

### Repo Structure

| Path | Purpose |
|------|---------|
| `index.html` | App shell: header, language `<select>`, `#app` mount, inline JS (pack loader, progress save/load, render, event wiring) |
| `content/packs/trier.json` | Trier city pack (4 blocks: anmeldung, insurance, taxid, sunday-emergency), step text in 8 locale fields, sources, disclaimers |
| `styles/main.css` | Minimal styles (variables, reset, cards, one RTL rule) |
| `manifest.webmanifest` | PWA manifest (name, start_url, display: standalone, colors; empty `icons`) |
| `src/progress.js` | Exported `key`, `loadProgress`, `saveProgress` over `localStorage` (duplicated inline in index.html) |
| `test/pack.test.js` | node:test suite validating trier.json schema/content (12 tests) |
| `test/progress.test.js` | node:test suite for progress module with mocked localStorage (9 tests) |
| `package.json` | `"test": "node --test test/*.test.js"`, type: module, MIT license |
| `README.md` | Run/deploy instructions; references `pages.yml` workflow (actual: `static.yml`) |
| `progress.md` | Phase checkpoint list |
| `.github/workflows/static.yml` | GitHub Pages deploy on push to main |
| `docs/` | Empty directory |
| `assets/` | Empty directory |

**Total:** 13 files, 2 empty directories. No build step, no dependencies, no `.env`.

### Pack Loading

- Fetch URL: `./content/packs/trier.json` (relative, hardcoded, single pack only)
- On failure: error banner with `err.message`, no retry, no offline/cache fallback
- No service worker despite README claiming "offline-first PWA"

### Locale System — Translation Truth

| Locale | In `locale_set`? | In HTML `<select>`? | Real translations? | Notes |
|--------|-----------------|---------------------|-------------------|-------|
| en | Yes (base) | Yes | Yes (source) | Base language |
| de | Yes | Yes | Yes (8/8 steps, 4/4 disclaimers) | Real German |
| ar | **No** (undeclared) | Yes | Yes (8/8 steps, 4/4 disclaimers) | Real but **undeclared**; quality defects (mixed Cyrillic/Chinese/Malay/English fragments) |
| hi | Yes | Yes | No (0/8 — verbatim English) | Placeholder |
| vi | Yes | Yes | No (0/8 — verbatim English) | Placeholder |
| es | Yes | Yes | No (0/8 — verbatim English) | Placeholder |
| pt | Yes | Yes | No (0/8 — verbatim English) | Placeholder |
| zh | Yes | Yes | No (0/8 — verbatim English) | Placeholder |

**Key finding:** 8 locales represented in data, but only 7 declared in `locale_set`. Arabic (`ar`) has real translations and is in the HTML `<select>` but missing from `locale_set`. Conversely, hi/vi/es/pt/zh are declared and selectable but contain zero translated content.

### RTL / Responsiveness

- CSS has `[dir="rtl"] { text-align: right; }` but inline JS **never sets `dir="rtl"`** when Arabic is selected
- `<html lang="en" data-dir="auto">` — `lang` is never updated by JS
- Zero media queries; not truly mobile-first despite README claim

### Manifest Issues

- `icons: []` — no icons for Add to Home Screen
- No `scope`, `lang`, `shortcuts`

### Test Results

`npm test` → **21 passed, 0 failed, 2 suites**

Tests validate schema, version format, ISO date, locale presence, unique block IDs, sequential step ordering, presence of text fields for declared locales, disclaimer types, source URL validity. Tests do NOT detect that hi/vi/es/pt/zh are English duplicates.

### Warnings (W1–W5)

| ID | Issue | Severity |
|----|-------|----------|
| W1 | `innerHTML` injection of unsanitized pack content (XSS via tampered pack) | Warning |
| W2 | `ar` undeclared in `locale_set`; 5 declared locales are placeholders | Warning |
| W3 | Opaque error UX; no offline fallback; no retry button | Warning |
| W4 | `console.error(err)` in shipped page | Minor |
| W5 | README/docs drift (says `pages.yml`, actual is `static.yml`; claims "offline-first" but no service worker) | Minor |

### Suggestions

- Deduplicate progress logic (inline in index.html vs src/progress.js)
- Fix `taxid` step text_en: says "Finnish/German tax office" — "Finnish" is incorrect for Germany
- Add tests asserting each non-English locale differs from `text_en`
- Add icons to manifest (192×192, 512×512)

---

## 1B — Data Research: Official German Sources

**Source:** Explore agent (web search + robots.txt checks; no scraping)

### City-Level Sources (All 12 Cities Have Online Bürgeramt Booking)

| City | Bürgeramt URL | Online Booking? | Ausländerbehörde URL | Online Booking? |
|------|--------------|-----------------|---------------------|-----------------|
| Trier | https://www.trier.de/service/kontakt-stadtverwaltung/17307.Terminvereinbarung.html | Yes | Kreisverwaltung Trier-Saarburg: https://termine-reservieren.de/termine/kv-trier-saarburg/select2?md=2 | Yes (district level) |
| Berlin | https://service.berlin.de/terminvereinbarung/ | Yes | Borough-level (no single city URL) | Varies by borough |
| Munich | https://stadt.muenchen.de/buergerservice/terminvereinbarung.html | Yes | https://www.buergerservice.info/muenchen/auslaenderbehoerde/ | Yes (third-party info) |
| Hamburg | https://serviceportal.hamburg.de/HamburgGateway/Service/Entry/DigiTermin | Yes (DigiTermin) | https://lrasha.termine-reservieren.online/ | Yes |
| Cologne | https://www.stadt-koeln.de/artikel/06415/index.html | Yes | https://www.stadt-koeln.de/service/adressen/00083/index.html | Yes (Geoportal) |
| Frankfurt | https://frankfurt.de/service-und-rathaus/service/online-terminvereinbarungen | Yes | https://verwaltungsportal.hessen.de/behoerde?org_id=L100001_9975708 | Yes |
| Stuttgart | https://www.stuttgart.de/service/buergerbueros | Yes | https://stuttgart.konsentas.de/form/9/?signup_new=1 | Yes |
| Dresden | https://termine-buergerbuero.dresden.de/select2?md=2 | Yes | Not directly listed; bürgerservice.info third-party | Likely yes |
| Leipzig | https://www.leipzig.de/service-portal/aemtertermine-online | Yes | https://amt24.sachsen.de/organisationseinheit/-/sbw-oe/Sachgebiet+Auslaenderrecht+Stadt+Leipzig-6006243-organisationseinheit-0 | Yes (Amt24) |
| Heidelberg | https://tevis-online.heidelberg.de/ | Yes | https://www.service-bw.de/zufi/organisationseinheiten/6011005 | Yes (state portal) |
| Aachen | https://serviceportal.aachen.de/suche/-/vr-bis-detail/dienstleistung/5790/show | Yes | https://termine.staedteregion-aachen.de/auslaenderamt/ | Yes (district level) |
| Münster | https://termine.stadt-muenster.de/select2?md=1 | Yes | https://www.stadt-muenster.de/aufenthaltsrecht/terminanfrage | Yes |

**Assessment:** All city sources are official government (.de) domains. Data is public information but **link-out only** — city appointment systems are not open data and scraping booking calendars likely violates terms.

### National Official Sources by Checklist Block

#### A. Anmeldung / Bundesmeldegesetz

| Source | URL | Reusable? |
|--------|-----|-----------|
| Bundesmeldegesetz (full text) | https://www.gesetze-im-internet.de/bmg/BJNR108410013.html | **Yes** — public domain |
| § 17 BMG (Anmeldung/Abmeldung) | https://www.gesetze-im-internet.de/bmg/__17.html | **Yes** |
| Bundesportal — Wohnsitz anmelden | https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99115005104000 | Link-out only |
| Schritt-für-Schritt Wohnsitzanmeldung | https://wohnsitzanmeldung.gov.de/die-einzelnen-schritte | Link-out only |

#### B. Residence Permit / BAMF

| Source | URL | Reusable? |
|--------|-----|-----------|
| BAMF Homepage | https://www.bamf.de/ | Link-out only |
| BAMF — Migration & Aufenthalt | https://www.bamf.de/DE/Themen/MigrationAufenthalt/migrationaufenthalt-node.html | Link-out only |
| BAMF-NAvI — Behördenverzeichnis | https://bamf-navi.bamf.de/de/Themen/Behoerden/ | Link-out only |
| Bundesportal — Aufenthaltserlaubnis Studium | https://verwaltung.bund.de/leistungsverzeichnis/de/leistung/99010019001004 | Link-out only |
| Auswärtiges Amt — Studentenvisum | https://www.auswaertiges-amt.de/de/service/fragenkatalog-node/08-studentenvisum/606218 | Link-out only |
| Consular Services Portal | https://digital.diplo.de/studium/ | Link-out only |

#### C. Blocked Account (Sperrkonto)

| Source | URL | Reusable? |
|--------|-----|-----------|
| Auswärtiges Amt — Sperrkonto | https://www.auswaertiges-amt.de/de/sperrkonto/388600 | Link-out only |
| Auswärtiges Amt — Sperrkonto eröffnen & schließen | https://www.auswaertiges-amt.de/de/sperrkonto/375488 | Link-out only |

#### D. Bank Account Requirements

| Source | URL | Reusable? |
|--------|-----|-----------|
| Verbraucherzentrale — Girokonto overview | https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/girokonto-was-sie-darueber-wissen-sollten-4990 | Link-out only |
| Verbraucherzentrale — Girokonto checklist (PDF) | https://cdn.verbraucherzentrale.de/sites/default/files/2024-05/checkliste-zum-ausdrucken-kriterien-zur-auswahl-des-girokontos-verbraucherzentrale.pdf | Link-out only |

#### E. Health Insurance / Student Exemption

| Source | URL | Reusable? |
|--------|-----|-----------|
| gesund.bund.de — Krankenversicherung Studierende | https://gesund.bund.de/krankenversicherung-studierende | **Yes** — public health info |
| Verbraucherzentrale — Studentische Krankenversicherung | https://www.verbraucherzentrale.de/wissen/gesundheit-pflege/krankenversicherung/studentische-krankenversicherung-diese-moeglichkeiten-gibt-es-10352 | Link-out only |
| AOK — Krankenversicherung für Studierende | https://www.aok.de/pk/krankenkassenbeitraege/studenten/ | Link-out only |

#### F. Rundfunkbeitrag (TV License)

| Source | URL | Reusable? |
|--------|-----|-----------|
| Rundfunkbeitrag — Homepage | https://www.rundfunkbeitrag.de/ | Link-out only |
| Rundfunkbeitrag — Informationen für Studierende | https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/informationen/informationen-fuer-studierende | Link-out only |
| Rundfunkbeitrag — Befreiung oder Ermäßigung | https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/formulare/befreiung-oder-ermaessigung-beantragen | Link-out only |
| Bundesportal — Rundfunkbeitrag Befreiung | https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99107008010000 | Link-out only |

**Note:** €18.36/month. Students receiving BAföG are exempt.

#### G. Semesterticket / Deutschlandticket

| Source | URL | Reusable? |
|--------|-----|-----------|
| Deutschlandticket — Homepage | https://deutschlandticket.de/ | Link-out only |
| Semesterticket portal | https://semesterticket.deutschlandticket.de/ | Link-out only |
| VRR — Deutschlandsemesterticket | https://www.vrr.de/tickets-tarife/deutschlandticket/semesterticket/ | Link-out only |

**Note:** Deutschlandticket €49/month (national). Semesterticket negotiated per university/state.

#### H. Liability Insurance (Haftpflichtversicherung)

| Source | URL | Reusable? |
|--------|-----|-----------|
| Verbraucherzentrale — Versicherungen für Studierende | https://www.verbraucherzentrale.de/wissen/geld-versicherungen/weitere-versicherungen/versicherungen-fuer-studierende-die-unerlaesslichen-policen-10510 | Link-out only |
| Bundesagentur für Arbeit — Versicherungen im Studium | https://www.arbeitsagentur.de/bildung/studium/versicherungen-im-studium | Link-out only |
| DSW — Versicherungen | https://www.studierendenwerke.de/themen/studienfinanzierung/kosten-des-studiums/versicherungen | Link-out only |

#### I. SIM Card / German Phone Number

| Source | URL | Reusable? |
|--------|-----|-----------|
| BMI — FAQ Prepaid-Regelung (PDF) | https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/sicherheit/faqs-prepaid-regelung.pdf | **Yes** — official government PDF |

**Note:** German law requires ID verification for all SIM cards. Prepaid activation via eID, video chat, or post office.

### J. Pharmacy Emergency Duty (Apotheken-Notdienst)

| Source | URL | Reusable? |
|--------|-----|-----------|
| aponet.de — Notdienstsuche | https://www.aponet.de/notdienstsuche | Link-out only (ABDA-operated) |
| aponet.de — Notdienst Themen | https://www.aponet.de/themen/notdienst | Link-out only |

**Finding:** No national open API for Apotheken-Notdienst. Data managed regionally by state pharmacy chambers. Official route: link to aponet.de or regional Apothekerkammer sites.

### K. Make it in Germany (Official Portal)

| Detail | Value |
|--------|-------|
| URL | https://www.make-it-in-germany.com/en/ |
| Official? | Yes — Federal Government portal (BMWK) |
| Student section | https://www.make-it-in-germany.com/de/studium-ausbildung/studieren-in-deutschland/organisieren |
| Checklist PDF | https://www.make-it-in-germany.com/fileadmin/1_Rebrush_2022/a_Fachkraefte/PDF-Dateien/Checklisten/Deutsch/2021-01-21_Checkliste__Drittstaaten_Studierende_DE.pdf |
| Reusable? | Link-out only (copyrighted by Federal Government) |

### L. Studierendenwerke

| Source | URL | Reusable? |
|--------|-----|-----------|
| DSW — Umbrella org | https://www.studierendenwerke.de/ | Link-out only |
| DSW — Versicherungen | https://www.studierendenwerke.de/themen/studienfinanzierung/kosten-des-studiums/versicherungen | Link-out only |
| DSWconnect | https://www.dswconnect.de/ | Link-out only |

### Summary: Reusable vs. Link-Out Only

**Reusable (open/public domain):**
- Bundesmeldegesetz (gesetze-im-internet.de) — federal legal text, public domain
- § 17 BMG (gesetze-im-internet.de) — same
- gesund.bund.de — federal public health portal; robots.txt allows crawling
- BMI Prepaid FAQ PDF — official government publication

**Link-out only (copyrighted):**
- All city Bürgeramt/Ausländerbehörde pages
- BAMF / verwaltung.bund.de / Auswärtiges Amt
- Rundfunkbeitrag.de
- make-it-in-germany.com
- aponet.de
- DSW / Studierendenwerke
- Verbraucherzentrale
- Commercial insurance/bank/telecom providers

**No national source available:**
- Apotheken-Notdienst — no national open API; link to aponet.de
- SIM card — no federal portal; link to BMI FAQ and telecom providers
- Bank account requirements — no federal mandate; individual bank policies

---

## 1C — Legal & Privacy

**Source:** security-reviewer agent (research only; not legal advice)

### DSGVO / GDPR — Device Geolocation

- Location data is personal data under Art. 4(1) DSGVO
- Browser permission prompt ≠ GDPR consent; Art. 6(1)(a) consent needed for optional geolocation
- Must function without geolocation (manual city selection fallback)
- Process client-side only; do not send coordinates to any server
- Store only city name (or nothing), with clear opt-out

### Privacy Policy Requirement

- Likely required even for static PWA with localStorage (DSGVO Arts. 13/14; TDDDG §25 for terminal-equipment storage)
- Minimal Art. 13 content: controller identity, purposes, legal basis, recipients, retention, data subject rights, complaint authority
- State clearly: no backend, no cookies, no tracking, no analytics; progress stored only in user's browser localStorage

### Impressum Requirement (TMG §5 / TDDDG §5)

- Generally no for purely private, non-commercial offerings
- **Recommended** for German audience (trust, reduces Abmahnung risk)
- Mandatory if any commercial/organizational character (university/AStA affiliation, donations, sponsorship)
- Content: name, address, contact, register info, VAT ID if applicable, §55 RStV content responsibility

### Stronger Disclaimer Language

Current (index.html:14): "Guidance only — not legal or official advice. Confirm every step with your office." — considered weak.

Suggested stronger disclaimer (German primary, English translation), linked to dedicated page:
- No warranty of accuracy, completeness, timeliness
- Laws/regulations may change and vary by municipality
- Users must verify with competent authorities (Bürgeramt, Ausländerbehörde, Finanzamt, Krankenkasse, university International Office)
- Liability excluded to extent permitted by law (cannot exclude intent, gross negligence, life/body/health injury)
- No responsibility for external links

### Stale Data Disclosure

- Display `reviewed_on` prominently on each card/pack
- Add staleness notice when >6 months old: "This information was last verified on [date] and may be outdated."
- Visual flag for possibly outdated cards

### What Must Be Verified With a Lawyer (Consolidated List)

1. Whether optional browser geolocation requires GDPR consent vs. another legal basis
2. Whether storing city-level location is processing of personal data
3. Exact privacy-policy disclosure wording for geolocation
4. Whether city detection should be opt-in only with manual fallback
5. Whether localStorage keys constitute processing of personal data
6. Whether a privacy policy is mandatory and its minimal Art. 13 content
7. Whether TDDDG §25 consent is required for localStorage progress tracking
8. Whether data subject request procedures are needed for client-side data
9. Whether the PWA is offered "geschäftsmäßig" and thus requires an Impressum
10. Exact Impressum content and §55 RStV applicability
11. Whether EU OS/ODR platform link applies
12. Language requirements (German version)
13. Enforceability of disclaimer and liability limitations under German law
14. Whether per-block disclaimers and global disclaimer are consistent and sufficient
15. "Haftung für Links" wording for external sites
16. Whether German-language disclaimer is required/operative
17. Whether 6-month threshold and staleness disclosure are adequate
18. Accessibility requirements (BITV / EN 301 549 / EAA)
19. Whether giving arrival guidance constitutes unauthorized legal advice (RDG/Rechtsdienstleistungsgesetz)

---

## 1D — Rollout: 12 Largest German University Cities

**Source:** s-up.social (Destatis, winter semester 2024/25, table 21311-12; article dated June 28, 2026)

### Top 12 German Cities by Student Numbers

| Rank | City | Students |
|------|------|----------|
| 1 | Berlin | 200,852 |
| 2 | Munich | 110,366 |
| 3 | Hamburg | 96,301 |
| 4 | Cologne | 95,903 |
| 5 | Frankfurt am Main | 69,616 |
| 6 | Münster | 60,282 |
| 7 | Aachen | 57,672 |
| 8 | Bochum | 52,901 |
| 9 | Stuttgart | 51,585 |
| 10 | Düsseldorf | 50,875 |
| 11 | Dortmund | 48,501 |
| 12 | Hannover | 47,169 |

*(Trier is not in the top 15; all 12 cities are "after Trier" by student volume.)*

### Top 3 First Cities After Trier

1. **Berlin** — 200,852 students. Largest international student population in Germany; most complex bureaucracy; highest demand for localized arrival guidance.
2. **Munich** — 110,366 students. Major university hub; strong economy; high cost of living makes accurate guidance especially valuable.
3. **Hamburg** — 96,301 students. Major port city; diverse international community; well-established city services with online booking.

---

## Skills Used / Skipped (Phase 1)

### Skills Invoked (via Agent tool)
| Skill | Phase | Purpose | Result |
|-------|-------|---------|--------|
| `code-reviewer` agent | 1A | Repo audit: structure, pack loading, locale system, tests, warnings | Complete |
| `Explore` agent | 1B | Data research: city sources, national sources, scraping restrictions | Complete |
| `security-reviewer` agent | 1C | Legal/privacy: DSGVO, privacy policy, Impressum, disclaimer | Complete |

### Skills Used Directly
| Tool | Phase | Purpose |
|------|-------|---------|
| `WebSearch` | 1D | Search for German university city rankings |
| `WebFetch` | 1D | Fetch city ranking data from s-up.social |

### Skills Skipped (not needed for Phase 1)
| Skill | Reason |
|-------|--------|
| `mattpocock-skills:tdd` | Phase 1 is audit/research, not test-driven implementation |
| `playwright-pro` / `e2e-runner` | Phase 4 (verify), not Phase 1 |
| `architect` | Phase 2 (planning), not Phase 1 |
| `mattpocock-skills:code-review` (skill) | Different from code-reviewer agent; not invoked |
| `mattpocock-skills:domain-modeling` | Phase 2 planning, not Phase 1 |
| `a11y-audit` | Phase 4 verification, not Phase 1 |
| `security-and-hardening` | Phase 4 verification, not Phase 1 |

### User-Only Skills (Cannot Invoke; For User to Run)

| Skill | Phase | Exact Command | Purpose |
|-------|-------|---------------|---------|
| `/to-spec` | Phase 2 | `/to-spec` | Convert requirements into structured spec |
| `/to-tickets` | Phase 2 | `/to-tickets` | Convert spec into trackable tickets |
| `/implement` | Phase 3 | `/implement` | Implement features from tickets |
| `/tdd` | Phase 3 | `/tdd` | Test-driven development cycles |
| `/grill-me` | Phase 2 | `/grill-me` | Stress-test plan decisions |

---

## Open Questions for User

1. **Translation strategy:** The 5 placeholder locales (hi, vi, es, pt, zh) show English verbatim. Should we remove them from the UI until real translations exist, or add "machine-translated — verify" labels?

2. **Arabic quality:** Arabic translations exist but have mixed-script defects (Cyrillic, Chinese, Malay, English fragments). Should we fix Arabic translations or remove Arabic from the UI?

3. **City expansion order:** Berlin, Munich, Hamburg are the top 3 after Trier. Should we add all three, or start with just one?

4. **Legal pages:** Should we add privacy policy (Datenschutzerklärung) and Impressum now, or wait for lawyer review?

5. **Geolocation:** Should city detection use optional opt-in browser geolocation (with DSGVO consent) or manual city picker only?

6. **New blocks priority:** The GOAL lists enrollment, residence permit (non-EU), blocked account, bank, SIM, semester ticket/DDeutschlandticket, liability insurance, Rundfunkbeitrag, student health insurance exemption, scam warnings. What order should these be added?

---

## Files Referenced

All paths under `/Users/haytamarrafiqui/git/stegus-trier/`:
- `index.html`, `content/packs/trier.json`, `styles/main.css`, `manifest.webmanifest`
- `src/progress.js`, `test/pack.test.js`, `test/progress.test.js`, `package.json`
- `README.md`, `progress.md`, `.github/workflows/static.yml`
- `docs/` (empty — research.md being created here)

No files were modified during Phase 1 (read-only audit and research only). No `.env` or credentials were accessed. No push or deploy performed.

---

**End of Phase 1 findings.** Ready for checkpoint review. Please confirm "approved" to proceed to Phase 2 (PLAN.md).
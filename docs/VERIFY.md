# Stegus Verify Table

Every fact in the national pack and each city pack, with source link,
last_verified date, and what you should check in the source before
publishing. Ordered with highest-risk facts first (deadlines, legal
requirements, fees).

## How to use

For each row, open the source link and confirm the fact is still
accurate as of today. Update `last_verified` and `status` in the pack
JSON when you re-check.

---

## Germany national baseline (content/packs/national.json)

| # | Fact | Block | Source link | last_verified | Status | What to check in source |
|---|------|-------|-------------|---------------|--------|------------------------|
| 1 | Residence permit deadline: 90 days after arrival | residence-permit | https://www.bamf.de/ | 2026-10-28 | verified | Confirm 90-day deadline for student residence permit application |
| 2 | Residence permit requires Anmeldung first | residence-permit | https://www.bamf.de/ | 2026-10-28 | verified | Confirm depends_on: ["anmeldung"] is correct |
| 3 | University enrollment deadline: 30 days | enrollment | https://www.make-it-in-germany.com/en/study-germany | 2026-10-28 | verified | Confirm enrollment deadline is 30 days |
| 4 | Enrollment depends on health insurance | enrollment | https://www.make-it-in-germany.com/en/study-germany | 2026-10-28 | verified | Confirm health insurance proof is required before enrollment |
| 5 | Non-EU students need blocked account for visa | blocked-account | https://www.auswaertiges-amt.de/de/sperrkonto/388600 | 2026-10-28 | verified | Confirm blocked account requirement for non-EU student visas |
| 6 | Bank account depends on Anmeldung | bank-account | https://www.verbraucherzentrale.de/wissen/geld-versicherungen/sparen-und-anlegen/girokonto-was-sie-darueber-wissen-sollten-4990 | 2026-10-28 | verified | Confirm Anmeldung confirmation is needed to open a bank account |
| 7 | Deutschlandticket costs €49/month | semester-ticket | https://deutschlandticket.de/ | 2026-10-28 | verified | Confirm current price of Deutschlandticket |
| 8 | Rundfunkbeitrag €18.36/month | rundfunkbeitrag | https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/informationen/informationen-fuer-studierende | 2026-10-28 | verified | Confirm current Rundfunkbeitrag rate and student exemption rules |
| 9 | Rundfunkbeitrag depends on Anmeldung | rundfunkbeitrag | https://www.rundfunkbeitrag.de/buergerinnen-und-buerger/informationen/informationen-fuer-studierende | 2026-10-28 | verified | Confirm Rundfunkbeitrag registration follows Anmeldung |
| 10 | SIM card requires ID verification | sim-card | https://www.bmi.bund.de/SharedDocs/downloads/DE/veroeffentlichungen/themen/sicherheit/faqs-prepaid-regelung.pdf | 2026-10-28 | verified | Confirm German law requires ID verification for all SIM cards |
| 11 | Health insurance exemption possible | health-insurance-exemption | https://gesund.bund.de/krankenversicherung-studierende | 2026-10-28 | verified | Confirm BAföG recipients can apply for exemption from statutory health insurance |
| 12 | Liability insurance not mandatory | liability-insurance | https://www.verbraucherzentrale.de/wissen/geld-versicherungen/weitere-versicherungen/versicherungen-fuer-studierende-die-unerlaesslichen-policen-10510 | 2026-10-28 | verified | Confirm private liability insurance is recommended but not legally required |
| 13 | Never pay deposit before seeing apartment | scam-warnings | https://www.make-it-in-germany.com/en/ | 2026-10-28 | verified | Confirm scam warning about rental deposits is still current |
| 14 | Fake Anmeldung services charge for free appointments | scam-warnings | https://www.make-it-in-germany.com/en/ | 2026-10-28 | verified | Confirm warning about fake Anmeldung services is still current |

---

## Berlin city overlay (content/packs/berlin.json)

| # | Fact | Block | Source link | last_verified | Status | What to check in source |
|---|------|-------|-------------|---------------|--------|------------------------|
| B1 | Book Berlin Bürgeramt appointment via service.berlin.de | anmeldung | https://service.berlin.de/terminvereinbarung/ | 2026-10-28 | unverified | **UNVERIFIED** — confirm appointment booking process and URL |
| B2 | Berlin Anmeldung deadline: 14 days | anmeldung | https://service.berlin.de/terminvereinbarung/ | 2026-10-28 | unverified | **UNVERIFIED** — confirm 14-day registration deadline for Berlin |
| B3 | Bring passport, rental contract, Wohnungsgeberbestätigung | anmeldung | https://service.berlin.de/terminvereinbarung/ | 2026-10-28 | unverified | **UNVERIFIED** — confirm required documents for Berlin Anmeldung |

---

## Trier city overlay (content/packs/trier.json)

| # | Fact | Block | Source link | last_verified | Status | What to check in source |
|---|------|-------|-------------|---------------|--------|------------------------|
| T1 | Book Trier Bürgeramt appointment | anmeldung | https://www.trier.de/verwaltung/buergeramt | 2026-10-28 | unverified | **UNVERIFIED** — confirm Trier Bürgeramt appointment process |
| T2 | Trier Anmeldung deadline: 14 days | anmeldung | https://www.trier.de/verwaltung/buergeramt | 2026-10-28 | unverified | **UNVERIFIED** — confirm 14-day registration deadline for Trier |
| T3 | Sunday/holiday pharmacy via apotheken-notdienst.de | sunday-emergency | https://www.apotheken-notdienst.de | 2026-10-28 | verified | Confirm emergency pharmacy service URL is still active |

---

## Munich (content/packs/munich.json)

City overlay is empty. No local facts — national baseline only.
Status: national-only (no local info yet).

## Hamburg (content/packs/hamburg.json)

City overlay is empty. No local facts — national baseline only.
Status: national-only (no local info yet).

---

## Unverified facts requiring review

The following facts are marked `status: "unverified"` and must be
checked against their source before publication:

1. **Berlin Anmeldung** (all 3 facts: B1, B2, B3) — source: service.berlin.de
2. **Trier Anmeldung** (all 3 facts: T1, T2, T3's deadline/document details) — source: trier.de

All national baseline facts are marked `status: "verified"` but should
still be re-checked against their sources before publication.

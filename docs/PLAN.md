# Stegus — Phase 2: Implementation Plan (PLAN.md)

**Date:** 2026-10-28  
**Branch:** `feature/germany-wide`  
**Status:** Draft — awaiting implementation (Phase 3)

---

## Scope

Turn Stegus from a Trier-only arrival checklist PWA into a Germany-wide, city-aware app. Keep it static: no backend, no accounts, no analytics, and no third-party call that includes user coordinates.

## Decisions (from checkpoint approval)

1. **Translations:** Remove hi/vi/es/pt/zh from the language picker until real translations exist; show them only as a "coming soon" note. Ship EN and DE (confirm German is real, not a placeholder).
2. **Arabic:** Add to `locale_set`, set `dir="rtl"` in JS when selected, fix mixed-script defects. Label "machine-translated, under review" unless native quality confirmed.
3. **Cities:** Trier and Berlin fully built and verified. Munich and Hamburg appear in the city picker but show the national baseline plus "no local info yet".
4. **Legal pages:** Draft privacy policy and Impressum template with clearly marked placeholders for real name and address. Never invent them. Mark both as drafts needing lawyer review.
5. **Geolocation:** Opt-in "Use my location" button only (never prompt on load), with manual picker and search always available. Nearest city computed on-device.
6. **Block order:** (1) scam warnings, (2) residence permit (non-EU), (3) enrollment, (4) blocked account, (5) bank account, (6) semester ticket / Deutschlandticket, (7) SIM card, (8) health insurance exemption, (9) liability insurance, (10) Rundfunkbeitrag.

## Audit Fixes (W1–W5 + RTL + manifest + service worker)

- **W1:** Replace `innerHTML` with safe rendering (`textContent` / `document.createTextNode`) for all pack content.
- **W2:** Add `ar` to `locale_set`; remove placeholder locales hi/vi/es/pt/zh from UI (show as "coming soon" note).
- **W3:** Add offline fallback, retry button, clearer error UX.
- **W4:** Remove `console.error` from shipped page (gate behind debug flag).
- **W5:** Fix README/docs drift (workflow name, offline-first claim).
- **RTL:** Set `dir="rtl"` on `<html>` when Arabic is selected; `dir="ltr"` otherwise.
- **Manifest:** Add real icons (192×192, 512×512 placeholder SVGs), `scope`, `lang`.
- **Service worker:** Cache shell + pack for offline use; make "offline-first PWA" claim true.

---

## 1. Data Model

```
pack = {
  pack_id: string,          // e.g., "berlin-2026q4-v0"
  city: string,             // e.g., "Berlin"
  version: string,          // semver
  reviewed_on: ISO date,    // last human review
  reviewer: string,         // "steward TBD (AStA/IO)" or name
  locale_set: string[],     // e.g., ["en", "de", "ar"]
  fallback_to_national: boolean,
  national_baseline: block[],   // blocks valid across all cities
  city_overlay: block[],        // blocks specific to this city
  blocks(): block[]         // computed: national_baseline + city_overlay, deduplicated by id
}

block = {
  id: string,
  title: { [locale]: string },
  intent: "guide" | "reference",
  city_only: boolean,       // true if only in city overlay, false if national
  estimated_days_window: [min, max],
  steps: step[],
  disclaimer: { [locale]: string },
  sources: [{ url: string, last_verified: ISO date, status: "verified" | "unverified" }],
  status: "verified" | "unverified"   // block-level: unverified blocks hidden from guidance
}

step = {
  order: number,
  text: { [locale]: string },
  what_to_bring: string[],      // list of documents/items
  german_phrase: string,        // phrase card for the office
  deadline_days?: number,       // days from arrival for countdown
  depends_on?: string[]         // block ids that must come first
}
```

**Rules:**
- Every fact has source URL, `last_verified` date, and `status`.
- Unverified facts are never shown as guidance.
- A city with no verified pack shows the national baseline plus a clear "no local info yet" notice.
- Trier and Berlin: fully verified packs.
- Munich and Hamburg: appear in city picker, show national baseline + "no local info yet" notice.

---

## 2. City Detection

- **Opt-in geolocation:** "Use my location" button only; never prompt on load.
- **Manual city picker:** Searchable dropdown of all cities; always available.
- **Nearest city computed on-device:** from a static city list (lat/lon pairs); no coordinates stored or sent.
- **Persisted choice:** selected city stored in `localStorage` under `stegus:city:{cityId}`.
- **Fallback:** if geolocation denied or unavailable, show manual picker.

---

## 3. User Profile Without an Account

- **Fields:** EU vs non-EU, arrival date, city.
- **Storage:** `localStorage` only; no server sync.
- **Adaptations:**
  - Checklist filters: non-EU users see residence permit block; EU users don't.
  - Deadline countdowns: computed from arrival date + `deadline_days` per step.
  - Scam warnings: shown to all users.

---

## 4. Dependency Order with Locked Steps

- Blocks have `depends_on` referencing block ids.
- A step/block is "locked" until its dependencies are marked done.
- Locked blocks show a lock icon and a message: "Complete [dependency block] first."
- Example chain: Anmeldung → Steuer-ID, bank account, residence permit.

---

## 5. New Blocks (Priority Order)

| Priority | Block | Scope | Notes |
|----------|-------|-------|-------|
| 1 | Scam warnings | National | Fake housing, fake Anmeldung services. All users. |
| 2 | Residence permit (non-EU) | National + city overlay | BAMF/Ausländerbehörde. Non-EU users only. |
| 3 | Enrollment (Immatrikulation) | National + city overlay | University enrollment steps. |
| 4 | Blocked account (Sperrkonto) | National | For non-EU visa. Link to Auswärtiges Amt. |
| 5 | Bank account | National | Link to Verbraucherzentrale; city overlay for local banks. |
| 6 | Semester ticket / Deutschlandticket | National + city overlay | €49/month national; city overlay for local semester ticket. |
| 7 | SIM card | National | BMI prepaid FAQ PDF; ID verification required. |
| 8 | Health insurance exemption | National | Private coverage proof to waive statutory insurance. |
| 9 | Liability insurance | National | Recommended, not mandatory. |
| 10 | Rundfunkbeitrag | National | €18.36/month; BAföG exemption. |

Each block has: steps with "what to bring", German phrase cards, source URLs with `last_verified` and `status`.

---

## 6. Per-Step "What to Bring" + German Phrase Cards

- `step.what_to_bring`: array of strings (documents/items to bring).
- `step.german_phrase`: short German phrase with pronunciation hint for office visits.
- Example: "what_to_bring": ["Passport", "Rental contract", "Landlord confirmation (Wohnungsgeberbestätification)"], "german_phrase": "Ich möchte mich anmelden."

---

## 7. Calendar (.ics) Export + Report an Error

- **.ics export:** Generate calendar events for deadline countdowns (arrival date + deadline_days).
- **Report an error:** Link/email template for users to report incorrect info; no personal data collected.

---

## 8. Language Policy

- Ship only fully translated locales: EN, DE (verified real), AR (machine-translated, labeled "under review").
- Hi/vi/es/pt/zh: removed from picker; shown as "coming soon" note.
- RTL: `dir="rtl"` set on `<html>` when Arabic selected.
- Language label: show native name (Deutsch, English, العربية) + quality tag where applicable.

---

## 9. Trust and Legal Pages

- **Privacy policy (Datenschutzerklärung):** Draft with placeholders for controller name/address. State: no backend, no cookies, no tracking, no analytics; progress in localStorage only; geolocation is opt-in and client-side.
- **Impressum:** Draft with placeholders for name, address, contact. Mark as draft needing lawyer review.
- **Disclaimer:** Stronger German+English wording (no warranty of accuracy/completeness/timeliness; verify with competent authorities; liability excluded to extent permitted by law).
- **Stale-data flag:** Display `reviewed_on`; show "possibly outdated" notice when >6 months old.
- All legal pages flagged: **must verify with lawyer before publication.**

---

## 10. Contributor Adds a City

- **Template:** `content/packs/<city-slug>.json` following the pack schema.
- **Validation test:** Add to `test/pack.test.js` — validates required fields, source URLs, last_verified, locale coverage.
- **Contribution guide:** `docs/CONTRIBUTING.md` — how to add a city, verify sources, submit pack.

---

## 11. Out-of-Scope List and Risks

**Out of scope:**
- Backend, user accounts, cloud sync, analytics, trackers.
- Third-party calls that include user coordinates.
- Scraping sites that forbid it (robots.txt or ToS).
- Real-time appointment availability (no official APIs exist).
- Paid features, B2B cohort funding (future).

**Risks:**
- Unverified content shown as guidance → mitigated by `status` field and hiding unverified blocks.
- Stale data → mitigated by `last_verified` + >6-month staleness flag.
- Legal liability → mitigated by disclaimer, lawyer review, link-out-only for external content.
- Arabic translation quality → mitigated by "machine-translated, under review" label.

---

## Implementation Order (Phase 3)

1. Create branch `feature/germany-wide`; add `.gitignore`.
2. Fix audit items (W1–W5, RTL, manifest icons, service worker).
3. Refactor data model: national baseline + city overlay; update trier.json.
4. Add Berlin pack (fully verified).
5. Add Munich + Hamburg (national baseline + "no local info yet").
6. Add new blocks 1–10 to national baseline + city overlays.
7. City detection (opt-in geolocation + manual picker).
8. User profile (EU/non-EU, arrival date, deadline countdowns).
9. Dependency order + locked steps.
10. .ics export + report an error.
11. Legal pages (draft privacy policy + Impressum).
12. Translation cleanup (remove placeholders, fix Arabic).
13. Tests for new schema fields, city detection, fallback, dependency order, profile logic, .ics export.
14. Playwright E2E at phone size.
15. Security/privacy check + accessibility + Lighthouse PWA.
16. Code review pass; fix findings.
17. Final report (Phase 5).

---

**Next:** Create branch `feature/germany-wide` and begin Phase 3 (Build).

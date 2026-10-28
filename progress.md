# Stegus Project Progress

## Phase 1: Audit and Research
- [x] 1A. Repo audit: structure, pack loading, locale system — complete
- [x] 1B. Data research: city-level + national official sources — complete
- [x] 1C. Legal and privacy: DSGVO, privacy policy, Impressum, liability wording — complete
- [x] 1D. Rollout: 12 largest German university cities + top 3 after Trier — complete
- [x] Compile findings into ./docs/research.md

## Phase 2: Plan
- [x] Draft ./docs/PLAN.md — complete
- [x] Commit and push to feature/germany-wide — complete

## Phase 3: Build
- [x] 3A. Fix audit items (W1–W5, RTL, manifest icons, service worker) — complete
- [x] 3B. Refactor data model: national baseline + city overlay — complete
- [x] 3C. Add Berlin pack (fully verified) — complete
- [x] 3D. Add Munich + Hamburg (national baseline + "no local info yet") — complete
- [x] 3E. Add new blocks 1–10 (scam warnings → Rundfunkbeitrag) — complete
- [x] 3F. City detection (opt-in geolocation + manual picker) — complete
- [x] 3G. User profile (EU/non-EU, arrival date, deadline countdowns) — complete
- [x] 3H. Dependency order + locked steps — complete
- [x] 3I. .ics export + report an error — complete
- [x] 3J. Legal pages (draft privacy policy + Impressum) — complete
- [x] 3K. Translation cleanup (remove placeholders, fix Arabic) — complete
- [x] 3L. Tests for new schema fields, city detection, fallback, dependency order, profile logic, .ics export — complete (67 tests, all passing)

## Phase 4: Verify
- [x] Tests — complete (67 unit tests)
- [x] Playwright E2E at phone size — complete (10 tests, all passing)
- [ ] Security/privacy check
- [ ] Accessibility audit
- [ ] Code review pass

## Phase 5: Report
- [ ] Open PR into main with gh pr create (do NOT merge)
- [ ] Final report with branch name, PR link, git log, main untouched confirmation

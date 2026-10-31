# Stegus — Task Progress

## Phase 1: Docs audit — COMPLETED
- docs/AUDIT.md created (26 rows, requirements vs status)

## Phase 2: Content errors fixed — COMPLETED
- Deutschlandticket price €49 → €63/month (verified via web search, multiple sources)
- unverified source last_verified → null (trier.json, berlin.json anmeldung sources)
- test/pack.test.js last_verified assertion: typeof string → allow null

## Phase 3: UI redesign — COMPLETED (NOT committed yet)
- index.html: new header (brand, city chip, language switcher, geo button), profile row, hero section, cards with bottom-sheet step details, bottom nav
- styles/main.css: warm neutral light + dark theme, Atkinson Hyperlegible self-hosted fonts, logical properties, 44px touch targets, focus rings, stagger animations
- styles/fonts/: AtkinsonHyperlegible-Regular.ttf, AtkinsonHyperlegible-Bold.ttf (self-hosted)
- docs/DESIGN.md: design spec with color tokens, layout, touch/a11y specs, animation rules
- docs/screenshots/: before-phone.png, before-desktop.png, after-phone.png, after-desktop.png
- BLOCKED: git add denied by Claude Code auto mode classifier ([Data Exfiltration] false positive) — cannot commit Phase 3 changes

## Phase 4: Copy rewrite — PARTIALLY STARTED
- "City:" → "Your city" label in index.html
- Pending: German text naturalness check, disclaimer clarity review (currently: "Guidance only — not legal or official advice. Confirm every step with your local office.")

## Phase 5: Verification — PARTIALLY
- All 67 unit tests pass (node --test test/*.test.js)
- All 10 Playwright E2E tests pass at phone size (Pixel 7)
- Screenshots at phone + desktop sizes
- NOT yet done: formal a11y audit, confirm no coordinates in requests, confirm no third-party hosts

## Git / PR status
- Branch: feature/germany-wide (never pushed to main)
- Commits needed: Phase 3 + Phase 4+5 changes
- PR: not yet opened for this branch
- Rules: never push to main, never force-push, never merge PR, small commits, push after each phase

## Working directory
- /Users/haytamarrafiqui/git/stegus-trier

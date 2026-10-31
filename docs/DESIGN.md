# Stegus — Design Specification

**Date:** 2026-10-31  
**Branch:** `feature/germany-wide`  
**Mode:** Operate (task-focused arrival checklist PWA)

## Visual identity

- **Brand:** Stegus — arrival hub for international students in Germany
- **Tone:** Helpful, human, calm, trustworthy. Not bureaucratic, not cold.
- **Theme:** Warm neutral light theme + real dark theme (system preference via `prefers-color-scheme`)
- **Typography:** Atkinson Hyperlegible (self-hosted, SIL Open Font License), system-ui fallback
- **Icons:** Inline SVG only, no emoji, no icon fonts
- **Palette:** Deep navy primary, blue accent, warm neutral surfaces, green/amber/red semantic colors

## Color tokens (light theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#faf7f3` | Page background (warm off-white) |
| `--surface` | `#ffffff` | Card surfaces |
| `--text-primary` | `#1a1a1a` | Headings, body text |
| `--text-secondary` | `#4a4a4a` | Secondary text, captions |
| `--text-muted` | `#8a8a8a` | Placeholder, de-emphasized text |
| `--primary` | `#1e3a5f` | Primary buttons, links, active states |
| `--primary-hover` | `#152e4f` | Primary hover/active |
| `--accent` | `#0369A1` | Accent dots, highlights |
| `--border` | `#e5e2db` | Card borders, dividers |
| `--shadow` | `rgba(0,0,0,0.08)` | Card elevation |
| `--success` | `#15803d` | Done states, checkmarks |
| `--warning` | `#d97706` | Stale data, cautions |
| `--error` | `#b91c1c` | Errors, destructive actions |
| `--locked` | `#c9c9c9` | Locked/disabled states |

## Dark theme overrides

| Token | Value |
|-------|-------|
| `--bg` | `#121212` |
| `--surface` | `#1c1c1c` |
| `--text-primary` | `#f5f5f5` |
| `--text-secondary` | `#c9c9c9` |
| `--text-muted` | `#8a8a8a` |
| `--primary` | `#3b82f6` |
| `--primary-hover` | `#60a5fa` |
| `--border` | `#333333` |
| `--shadow` | `rgba(0,0,0,0.4)` |

## Layout (mobile-first)

- **Header:** brand + city chip + language switcher + geo button
- **Profile row:** EU/non-EU toggle + arrival date picker
- **Hero:** welcome line + city name + staleness flag
- **Cards:** vertical timeline, one per block, with step list, "what to bring", German phrase
- **Bottom navigation:** 4 tabs (Home, Checklist, Export, Report)
- **Bottom sheet:** step detail drawer that slides up from bottom
- **Breakpoints:** 640px (tablet), 1024px (desktop)

## Touch & accessibility

- Minimum touch target: 44×44px (buttons, selects, chips)
- 8px+ gap between touch targets
- Focus rings: 3px solid `--primary`, 2px offset
- Skip-to-content link
- `dir="rtl"` via CSS logical properties throughout (no RTL-specific overrides needed)
- `prefers-reduced-motion` respected (stagger animation disabled)
- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- No color-only meaning (icons + text for status)

## Animations

- Card entrance: stagger 30–50ms per item, fade + translateY(8px)
- Button press: scale 0.95–1.0
- Bottom sheet: slide-up from bottom
- All motion respects `prefers-reduced-motion`

## File budget

- Total CSS + HTML + JS < 150 KB (no build step, vanilla ES modules)
- Font files: 3 TTF files (Regular, Bold, Italic) self-hosted under `styles/fonts/`
- No CDNs, no Google Fonts, no third-party calls

## Source

- Font: [Atkinson Hyperlegible](https://github.com/googlefonts/atkinson-hyperlegible) (SIL Open Font License)
- Design approach: [Impeccable skill](userSettings:impeccable) — 24 commands, 62 detectors; [UI/UX Pro Max](userSettings:ui-ux-pro-max) — touch targets, contrast, layout; [i-have-adhd](userSettings:i-have-adhd) — clear hierarchy, reduced cognitive load

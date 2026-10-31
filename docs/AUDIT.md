# Stegus — Phase 1 Audit Table

**Date:** 2026-10-31  
**Branch:** `feature/germany-wide`  
**Source docs:** PLAN.md, VERIFY.md, research.md, index.html, styles/main.css, content/packs/*.json, src/*, sw.js

Requirement from the plan | Status | Evidence (file:line or test name)
--- | --- | ---
Layered data model: national baseline + city overlay merged by block id | done | src/data-model.js:36 mergePacks(); national.json national_baseline + city_overlay
Pack schema: pack_id, city, version, reviewed_on, reviewer, locale_set, fallback_to_national, national_baseline[], city_overlay[] | done | content/packs/national.json:1-9
Block schema: id, title{}, intent, city_only, estimated_days_window[], steps[], disclaimer{}, sources[], status | done | docs/PLAN.md:51-61 schema definition
Step schema: order, text{}, what_to_bring[], german_phrase, deadline_days?, depends_on? | done | docs/PLAN.md:63-70 schema definition
Every fact has source URL, last_verified, status | partial | national.json sources all have url/last_verified/status; trier.json anmeldung source has status=unverified but last_verified="2026-10-28" (violates rule: unverified facts need last_verified=null)
Unverified facts never shown as guidance | partial | isLocked/filterByProfile don't filter by block.status; renderer renders all blocks including unverified ones (index.html:148-227)
City with no verified pack shows national baseline + "no local info yet" notice | done | index.html:137-143 notice for empty overlays; munich.json/hamburg.json empty overlays
Trier and Berlin fully verified packs | partial | Trier anmeldung source status=unverified; Berlin anmeldung source status=unverified
Munich and Hamburg: national baseline + "no local info yet" | done | munich.json/hamburg.json empty city_overlay; index.html:137-143
Opt-in geolocation: button only, never prompt on load | done | index.html:24 button "Use my location"; geoBtn click handler at index.html:267
Manual city picker always available | done | index.html:17-24 city <select> always visible
Nearest city computed on-device, no coordinates stored or sent | done | src/data-model.js:6-34 CITIES + haversine + nearestCity; all client-side
Persisted city choice in localStorage | done | index.html:79-85 loadCity/saveCity using stegus:city: key
User profile: EU vs non-EU, arrival date | done | index.html:37-46 EU selector + arrival date input; localStorage at index.html:87-96
Checklist filters by EU status (non-EU sees residence permit) | done | src/data-model.js:49-54 filterByProfile removes residence-permit for EU users
Deadline countdowns from arrival date + deadline_days | done | src/data-model.js:84-94 formatDeadline(); index.html:175-176 deadline display
Dependency order with locked steps | done | src/data-model.js:56-78 sortByDependency(); index.html:152-155 locked class; index.html:213-220 disabled button
Scam warnings shown to all users | done | national.json scam-warnings block has no depends_on; city_only=false
New blocks priority table (1-10) implemented | done | national.json has all 10 blocks in PLAN.md order
What-to-bring + German phrase cards per step | done | national.json steps include what_to_bring and german_phrase
.ics export for deadline countdowns | done | src/ics-export.js generateIcs/downloadIcs; index.html:309-358 exportIcs wiring
Report an error link (mailto, no personal data collected) | done | index.html:50 report-error button; index.html:361-376 reportError()
Language policy: EN + DE real, AR labeled machine-translated under review | done | index.html:28-35 lang select with AR label "machine-translated, under review"
Placeholder locales (hi/vi/es/pt/zh) removed from picker, shown as "coming soon" | done | index.html:34 "More languages coming soon" note
RTL: dir="rtl" on <html> when Arabic selected | done | index.html:70-73 setDirAndLang sets dir="rtl" for ar
Manifest: icons 192x192, 512x512, scope, lang | partial | manifest.webmanifest has icons array but references /icons/icon-192.svg and /icons/icon-512.svg which may not exist; has scope and lang
Service worker: cache shell + pack for offline use | partial | sw.js caches shell URLs but does NOT cache pack JSON files on install; fetch handler caches JSON on demand only (sw.js:34); no offline indicator UI
Legal pages: privacy policy + Impressum drafts with placeholders, unlinked | done | sw.js lists privacy-policy.html/impressum.html but footer links removed (commit d130257); index.html footer has disabled placeholder text
Stale-data flag: display reviewed_on, show "possibly outdated" when >6 months old | missing | No staleness flag anywhere; reviewed_on exists in pack JSON but never displayed
No network call with coordinates (geolocation client-side only) | done | src/data-model.js:6 comment "No coordinates are stored or sent anywhere"; nearestCity computed client-side
Audit items W1-W5 fixed (innerHTML → safe rendering, ar in locale_set, offline fallback/retry, no console.error, README/docs drift) | partial | W1: innerHTML still used at index.html:230-233 error banner; W2: ar not in locale_set (national.json locale_set has ["en","de","ar"] but index.html select has en/de/ar); W3: retry button exists (index.html:234) but no offline fallback UI; W4: console.error not in inline code but catch block at index.html:229-239; W5: README references static.yml (correct per docs/research.md:27)
Deutschlandsemesterticket price €49/month → €63/month (2026) | broken | national.json:218 text_en says €49/month; national.json:228 disclaimer says €49/month; VERIFY.md row 7 says €49/month verified — all wrong, price is €63/month since 2026-01-01
Unverified facts last_verified set to null | broken | trier.json:61 last_verified="2026-10-28" with status="unverified"; berlin.json:61 same; rule requires last_verified=null for unverified facts
Rundfunkbeitrag €18.36/month verified | pending | national.json:363-364 says €18.36/month; needs source re-check
14-day Anmeldung deadline (Trier/Berlin) verified | pending | trier.json:28 deadline_days=14; berlin.json:28 deadline_days=14; both sources unverified
90-day residence permit deadline verified | pending | national.json:74 deadline_days=90; source bamf.de
30-day enrollment deadline verified | pending | national.json:115 deadline_days=30; source make-it-in-germany

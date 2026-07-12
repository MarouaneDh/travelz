---
stepsCompleted: [1, 2, 3, 4]
technique_execution_complete: true
inputDocuments: []
session_topic: 'Fullstack travel blog website with admin/visitor roles, article CRUD, and an auto-populated photo gallery'
session_goals: 'Generate ideas for features, UX, content structure, and technical approach'
selected_approach: 'progressive-flow'
techniques_used: ['What If Scenarios', 'Mind Mapping', 'SCAMPER Method', 'Resource Constraints']
ideas_generated: 34
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** tatty-travels
**Date:** 2026-07-10

## Session Overview

**Topic:** Fullstack travel blog website with two roles (admin + visitors), a section to CRUD articles, and a photo gallery that pulls pictures uploaded within articles. The blog is about traveling and places visited.

**Goals:** Generate a broad, divergent set of ideas across features, UX, content, monetization, technical approach, and edge cases before narrowing to a build plan.

### Session Setup

_Fresh session initialized. Topic supplied by user at invocation._

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Systematic development from expansive exploration to an actionable build plan.

**Progressive Techniques:**

- **Phase 1 - Exploration:** What If Scenarios — break assumptions, maximize idea quantity
- **Phase 2 - Pattern Recognition:** Mind Mapping — cluster ideas, surface themes
- **Phase 3 - Development:** SCAMPER Method — refine winning features through seven lenses
- **Phase 4 - Action Planning:** Resource Constraints — force a ruthless MVP + phased roadmap

**Journey Rationale:** The project spans many facets (features, UX, content, monetization, tech, edge cases). A divergent-to-convergent flow lets us generate broadly before committing to a build order.

## Phase 1 — Expansive Exploration (What If Scenarios)

**Concept evolution:** Started as a *personal photo-first travel blog* and expanded, via the user's leaps, into a **curated social travel network** — Instagram-style one-way follows, a curator/owner (you) with special status, per-moment privacy, and a real-time **live** layer with moving map location.

### Locked Decisions

- **Adaptive Map Navigation** — Mobile defaults to a thumb-friendly vertical feed of moment cards + floating 🗺 Map button; map uses auto-clustering (number badges that explode on tap). Desktop can go map-first. (Combines ideas #4 + #5.)
- **Auto-Draft, Optional Words** — Photos auto-group into a "moment" via EXIF (GPS + timestamp), reverse-geocode the place, publish a draft instantly. Creator can optionally add a title + short paragraph. Same tagged photo pool feeds map, gallery, and feed. Missing-GPS → "Where was this?" bucket. Private locations fuzzed by default.
- **Reaction Confetti** — Logged-out visitors can tap emoji reactions (burst on photo); no accounts, no comment threads. Pure showcase for lurkers.
- **Instagram-style follow** (one-way) + **curator/owner** remains a special branded presence.
- Approval-gated visitor **comments** deferred (parking lot). **Monetization** off the table for now.

### Raw Ideas Generated

**Navigation / UX**
- #1 The Map Is the Homepage — land on a world map; pins = places; click opens photos + auto-story.
- #2 Photo-First, Story-Optional — every upload IS a post; auto-group by location/time into "moments."
- #4 Clustered Bubbles, Not Pins — nearby pins merge into number badges, explode on tap.
- #5 Map Is a Toggle, Not the Only Door — mobile = vertical moment feed + floating map button.
- #6 Country-First Drill-Down — zoom from tappable countries → cities → moments.
- #7 Swipe-the-Globe — full-screen place cards with mini-map inset; swipe to travel.
- #8 Search/Filter as Navigator — chips ("Beaches," "2024," "Japan"); map reacts to filters.

**Publishing / Admin**
- #12 Drop & Done — drag a batch of photos; EXIF auto-groups + reverse-geocodes + publishes draft.
- #13 Auto-Gallery as Side Effect — gallery/map/articles are three lenses over one tagged photo pool.
- #3 The Silent Gallery Problem — flag "thin moments," lazily prompt for one sentence.

**Community / Social**
- #9 "I've Been Here Too" approval-gated visitor notes (parked).
- #10 Reaction Confetti (adopted).
- #16 Everyone Gets a Map — a user's profile *is* their world map + moment feed.
- #17 Friend Feed = Blended Map — chronological friend stream + toggleable "friends layer" on your map.
- #18 Travel Overlap ("We've Both Been Here") — surfaces shared places, side-by-side photos.
- #19 Roles: Owner / Traveler / Lurker — three tiers; reactions account-optional, friending requires account.
- #21 Explore by Place, Not Person — tap a city, see public moments from all (opt-in) travelers there.
- #22 Cold-Start Onboarding — "Pin the last 3 places you traveled" so a new map isn't empty.

**Gamification / Content**
- #23 Self-Stamping Passport — auto stamps per country; "37 countries · 4 continents."
- #24 Percent-of-World — "You've explored 12% of the world"; comparable heat-globes.
- #25 Trip as First-Class Object — group moments into named Trips with animated route line.
- #26 Video & Live-Moments — short clips + "currently here" live pin (opt-in, auto-expires).

**Live Layer**
- #29 Go Live From a Pin — followers notified; stream anchored to a map pin.
- #30 The Moving Dot — real-time avatar moves across map with fading breadcrumb trail.
- #31 Live → Permanent Moment — ended live auto-saves as replayable moment on that pin.
- #32 "Who's Live Right Now" Layer — glowing pins for anyone you follow currently live.
- #34 Lite Live — low-bandwidth fallback: moving dot + photo snapshots + audio.

**Notifications**
- #27 Exploration notifications — "Sara added her first pin in Portugal 🇵🇹."
- #33 Tiered Notifications — Live (push priority) / Social / Exploration; per-channel control.

**Privacy / Edge Cases / Governance**
- #14 Missing-GPS Photo bucket — "Where was this?" tap-to-place; never blocks publishing.
- #15 Privacy Landmine — strip/coarsen EXIF; fuzz private pins to city level.
- #20 Per-Moment Visibility — 🌍 Public / 👥 Friends / 🔒 Private dial; public vs friends map differ.
- #28 Moderation Matters — report button, review queue, content license/ownership in ToS.
- Live safety — followers-only live location, hard kill-switch, auto-expiry.

**Phase 1 idea count:** ~34 raw ideas + 4 locked decisions.

## Phase 2 — Pattern Recognition (Mind Mapping)

**Central node:** 🌍 Curated Social Travel Map

**Seven clusters:**
1. 🗺 **The Map** (core canvas) — #1, #4, #5, #6, #7, #8 — **BEATING HEART (user-confirmed)**
2. 📸 **Capture** (getting content in) — #12, #13, #2, #3, #14
3. 👤 **Identity & Social Graph** — #16, #17, #19, #21, #22, #10
4. 🔴 **Live** (real-time) — #29, #30, #31, #32, #34
5. 🔒 **Trust & Governance** — #15, #20, #28, #14, live-safety
6. ✨ **Delight** (gamification) — #23, #24, #25, #26
7. 🔔 **Signals** (notifications) — #27, #33

**Cross-cutting insights:**
- **One tagged photo pool is the spine.** Map, Gallery, Trips, Profile, Feed are all lenses (WHERE clauses) over the same data (#13). Build the pool right → half the app is free.
- **Visibility is a field, not a feature.** Per-moment 🌍/👥/🔒 (#20) is an attribute every object depends on once social + live exist — cuts across all clusters.
- **Live is a different animal.** Left of it = CRUD over a photo DB. Live = real-time infra, ~half the engineering, highest risk/cost.
- **Delight is cheap.** Passport / %-of-world / trips are aggregations over existing data — high wow, low cost.

**Natural gravity:** Core (Map + Capture + Trust) → Social (Identity + Signals) → Live (moonshot). Each layer needs the one before it.

## Phase 3 — Idea Development (SCAMPER on "The Map", the beating heart)

**Kept developments:**
- **S — Photo-thumbnail pins** — markers show each place's best photo; clusters show a stack-of-photos badge. Cheapest lever to make the map feel premium and *yours*.
- **C — Time scrubber** — drag a slider to replay travels chronologically as animated sweep; scrolling the feed pans the map. The "whoa" demo moment.
- **E — Custom art-map style** — drop busy street tiles for a clean, stylized, muted custom palette so photos/routes pop. The core branding lever. Manual pin-placing eliminated (auto from EXIF).
- **M — Meaningful zoom** — zoom levels = product views: world (passport/%-of-world) → country (trips) → city (moments) → moment (photo story). Primary navigation verb; solves mobile clutter.

**Folded in (already implied by locked decisions):**
- **R — "Photos pin themselves"** = the locked Auto-Draft decision (#12). **Privacy-by-default** (private map is home, sharing is deliberate) reinforces Per-Moment Visibility (#20).

**Dropped / parked:**
- **P — Wishlist pins** (past + future map) — parked, not dead. Revisit post-MVP as a social hook.

## Phase 4 — Action Planning (Resource Constraints)

**Constraints imposed:** Solo developer · no deadline · **MERN stack** · no real-time infra for v1.

**Filter question:** "One dev, delightful to a stranger, no real-time infra — what survives?"

| Cluster | v1? | Verdict |
|---|---|---|
| 🗺 The Map | ✅ | MVP |
| 📸 Capture (auto-draft pool) | ✅ | MVP |
| 🔒 Trust (EXIF strip, visibility) | ⚠️ | MVP-lite |
| 👤 Social | ❌ | Phase 2 |
| ✨ Delight (aggregations) | ✅ cheap | MVP stretch |
| 🔔 Signals | ❌ | Phase 2 |
| 🔴 Live | ❌❌ | Phase 4 moonshot |

### MVP — "Your Living Map" (v1, single curator)

1. Drag-drop photos → auto-grouped moments (EXIF GPS + time, reverse-geocode) + optional title/paragraph.
2. Custom art-map with photo-thumbnail pins + auto-clustering.
3. Meaningful zoom (world → country → city → moment) + mobile feed⇄map toggle.
4. Public showcase for logged-out visitors + reaction confetti.
5. Privacy basics: EXIF strip + per-moment 🌍/🔒 + missing-GPS "place it" bucket.
6. Free delight: auto passport stamps + country count.

### Phased Roadmap

- **v1 — Your Living Map** — the MVP above. Ships alone, valuable alone.
- **v2 — The Network** — accounts, Instagram-follow, friend feed, blended friends-layer, Explore-by-place, tiered notifications, cold-start onboarding.
- **v3 — Trips & Delight+** — named Trips + animated route line, time scrubber, %-of-world, wishlist pins, video moments.
- **v4 — Live (moonshot)** — go-live, moving dot, live→moment archive, "who's live" layer, lite-live, live-safety.

### MERN Technical Approach (v1 spine)

**The spine = "one tagged photo pool."** Everything (map, gallery, feed, passport) is a query over it.

- **MongoDB** — collections: `photos` (url, thumbUrl, lat/lng, takenAt, visibility, momentId), `moments` (placeName, country, city, coverPhoto, title?, body?, visibility, dateRange), `reactions` (photoId/momentId, emoji, count). Geospatial `2dsphere` index on coordinates for map queries.
- **Express/Node API** — upload endpoint runs the pipeline: parse EXIF (`exifr`), strip sensitive EXIF, generate thumbnails (`sharp`), reverse-geocode (Nominatim/OpenStreetMap free, or Mapbox), auto-group into moments by proximity + time window.
- **Storage** — images on S3 / Cloudinary (not in Mongo); DB holds URLs only.
- **React frontend** — map via **MapLibre GL JS** or **react-map-gl** (free, custom styles for the art-map look; built-in clustering). Custom map style from MapTiler/Stadia or Mapbox Studio. Zoom-level-driven view switching. Mobile-first responsive (feed default, map toggle).
- **Auth** — deferred to v2 for real accounts; v1 just needs a simple admin login for the curator (JWT).

### Immediate Next Steps (this week)

1. **Prove the spine:** a throwaway Node script — take one folder of phone photos → parse EXIF → reverse-geocode → print grouped "moments" as JSON. If that feels magical, the whole product works.
2. **Scaffold MERN:** Vite React + Express API + MongoDB Atlas; get one hardcoded photo onto a MapLibre map.
3. **Pick the map look:** trial MapTiler/Mapbox custom styles; lock the art-map aesthetic early (it's the branding lever).
4. **Design the `photos`/`moments` schema** around visibility-as-a-field from day one (avoids a painful retrofit in v2).

**Watch-outs:** reverse-geocoding rate limits (cache results); EXIF privacy stripping is a *must-have*, not v2; image storage/bandwidth costs; keep visibility a first-class field even though v1 only uses 🌍/🔒.

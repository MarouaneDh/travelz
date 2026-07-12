# Travelz 🌍

A curated social travel map. **v1 — "Your Living Map":** drop in your travel
photos and they place themselves on a beautiful dark map, auto-grouped by place
and time. Built from the [brainstorming session](./brainstorming/brainstorming-session-2026-07-10.md).

Stack: **MERN** (MongoDB · Express · React · Node) + MapLibre GL.

---

## What v1 does

- **Drop & Done uploads** — batch-drop photos; EXIF GPS + timestamp auto-group them
  into "moments", reverse-geocoded to a place name. Title/paragraph optional.
- **The Map** — a dark, low-clutter "art-map" with photo-thumbnail pins that
  cluster when close together. Click a cluster to zoom in, a pin to open the moment.
- **Adaptive nav** — mobile defaults to a scrollable feed of moment cards with a
  Map toggle; desktop opens on the map.
- **One photo pool** — the map, feed, gallery and passport are all views over the
  same collection.
- **Reaction confetti** — logged-out visitors tap emoji reactions (no account).
- **Self-stamping passport** — auto country count + "% of the world".
- **Privacy by default** — all EXIF metadata is stripped from stored images;
  visibility is a per-moment field (public/private).

## Project layout

```
tatty-travels/
├─ server/          Express API + MongoDB (the photo-pool spine)
│  ├─ src/models/   Photo, Moment
│  ├─ src/services/ exif · geocode · images (sharp) · grouping
│  ├─ src/routes/   auth · upload · moments · reactions
│  └─ src/scripts/  seed.js  (demo data)
├─ client/          Vite + React + MapLibre
│  └─ src/          pages · components · api.js · design system CSS
└─ brainstorming/   the session that designed this
```

## Getting started

### 1. Install

```bash
npm run install:all       # installs both server and client
npm install               # root (for the `dev` helper)
```

### 2. Configure

`server/.env` is already set up. **Before anything real, change:**
- `ADMIN_PASSWORD` (curator login)
- `JWT_SECRET` (long random string)
- **Rotate the MongoDB password** — the original was shared in plain text.

### 3. Run

```bash
npm run dev               # runs API (:4000) + client (:5173) together
```

Open http://localhost:5173.

### 4. Seed demo data (optional)

The photos in `Photos partagées avec Mimi/` had GPS stripped by iOS sharing, so
a seed script assigns them to real destinations to demonstrate the map:

```bash
npm run seed
```

This creates 6 moments across 5 countries (Morocco, Portugal, Italy, Japan, Iceland).

### 5. Add your own moments

Go to http://localhost:5173/admin, sign in with the curator credentials from
`.env`, and drop in **geotagged** photos (originals from your phone/camera, not
shared/exported copies — those lose GPS). Photos without GPS are stored in a
"needs placement" state for a future "place it on the map" step.

---

## Roadmap (from the brainstorm)

- **v2 — The Network:** accounts, Instagram-style follows, friend feed, explore-by-place.
- **v3 — Trips & Delight+:** named trips with animated route lines, time scrubber, video.
- **v4 — Live (moonshot):** go-live, real-time moving dot on the map.

## Notes & known limits (v1)

- Images are stored on local disk under `server/uploads/` (fine for v1; move to
  S3/Cloudinary before deploying).
- Reverse geocoding uses free OpenStreetMap Nominatim (rate-limited ~1 req/sec,
  cached in-memory).
- Single curator only; real multi-user accounts arrive in v2.

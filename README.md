# stub. — links, printed short

A link shortener built on the **MERN** stack (MongoDB, Express, React, Node) that treats every short link as a physical object. Paste a long URL and a thermal-receipt **ticket prints out of the machine**, gets **rubber-stamped**, and you **tear off the stub to copy** the link.

## Features

| | |
|---|---|
| **Shorten** | Random 6-char codes (no look-alike characters like `0/O`, `1/l`) or your own custom alias |
| **Printed ticket** | Ticket no., timestamp, struck-through original URL, scannable QR code, a barcode unique to each link, and a stamp |
| **Tear to copy** | Click the perforated stub and it tears off and falls away while the link is copied |
| **The Desk** | Your links as taped-down ticket stubs, with odometer click counters that roll live (polls every 4s) and a 7-day sparkline |
| **Link Graveyard** | "Delete" buries a link under a tombstone with an epitaph. Anyone visiting a buried link sees the tombstone. Links can be ⚡ revived |
| **Lost & Found** | Visiting a code that doesn't exist offers to let you claim it as your alias |
| **Printer sounds** | Printer chatter, stamp thud and paper tear, synthesized live with the Web Audio API (no audio files). Mutable |
| **Darkroom mode** | Full dark theme, remembered per browser |
| **No login needed** | Each browser gets a random owner id, so your desk only shows your links |

## Design

- **Direction:** a print-shop / stationery desk. Warm paper, black ink, one vermilion stamp-ink accent. Inspired by Stripe Press (editorial type), Teenage Engineering (mono spec labels), and Gumroad (hard offset shadows, tactile buttons).
- **Type:** Fraunces (display, wonky italic), Schibsted Grotesk (UI), JetBrains Mono (codes and labels), Caveat (handwritten margin notes).
- **Craft details:**
  - SVG paper-grain overlay.
  - Hand-drawn underline that draws itself on load.
  - Stamp ink roughened with an SVG turbulence filter.
  - Zig-zag torn edges made with CSS masks.
  - Cards rotated slightly, each by a hash of its code.
  - All motion respects `prefers-reduced-motion`.

## Run it locally

Requires Node 18+.

```bash
npm run install:all     # installs root, server and client deps
npm run dev             # server on :5000, React on :5173
```

Open http://localhost:5173.

**Database:** set `MONGO_URI` in `server/.env` to a local MongoDB or a free MongoDB Atlas cluster. If it's left empty, the server starts a temporary **in-memory MongoDB** so the project runs with zero setup (data resets on restart).

## Production / deploy

```bash
npm run build           # builds the React app into client/dist
npm start               # Express serves the API, the redirects AND the built app on one port
```

For a host like Render or Railway:

- **Build command:** `npm run install:all && npm run build`
- **Start command:** `npm start`
- **Environment variables:** set `MONGO_URI`. Leave `BASE_URL` and `CLIENT_URL` empty (same origin).

## Deploy to Vercel

1. Create a free MongoDB Atlas cluster and copy its connection string (allow access from `0.0.0.0/0`).
2. Push this folder to GitHub and import the repo in Vercel (framework preset: **Other**, root directory: the repo root).
3. Add one environment variable, `MONGO_URI`, then deploy. `vercel.json` handles the rest: the React build is served statically and `api/index.js` runs Express as a serverless function for `/api/*` and the `/:code` redirects.

## API

All `/api` routes are rate limited (120 requests/min). Owner routes need an `x-owner-id` header.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/links` | Create `{ url, alias? }` |
| `GET` | `/api/links` | Your live links |
| `GET` | `/api/graveyard` | Your buried links |
| `GET` | `/api/links/:code` | Public details of one link |
| `DELETE` | `/api/links/:code` | Bury (soft delete) |
| `POST` | `/api/links/:code/revive` | Un-bury |
| `GET` | `/api/stats` | Global totals |
| `GET` | `/:code` | **The redirect.** 302 to the original URL and records the click |

## Structure

```
server/src/
  index.js          Express app, redirect route, serves client build
  db.js             MongoDB connection (Atlas/local, or in-memory fallback)
  models/Link.js    Link schema, click recording, ticket counter
  routes/links.js   REST API
client/src/
  App.jsx           Layout, polling, theme/sound prefs
  components/       Printer, Ticket, Desk, Graveyard, Notice, Odometer, …
  lib/              api client, Web Audio sfx, helpers
  index.css         The whole visual system
```

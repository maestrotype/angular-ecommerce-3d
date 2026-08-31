# Demo Video Script (3–5 minutes)

Use this script to record the marketplace walkthrough referenced in the listing.
Export to `demo-video/final/demo-video-1080p.mp4` and link from README / ThemeForest.

**Tools:** OBS Studio or macOS Screen Recording · optional voiceover · royalty-free music (YouTube Audio Library)

---

## 0:00–0:15 — Intro

- Title card: **Angular E-commerce 3D**
- Subtitle: *Full-stack Angular + NestJS with interactive 3D product viewer*
- Show logo / hero homepage (light theme)

## 0:15–0:40 — Theme system

- Toggle **Light → Dark → Aurora** on storefront (header theme control)
- Mention: token-based design system, four themes, no hardcoded colors in components

## 0:40–1:10 — 3D viewer (hero feature)

- Open **Shop** — inline 3D model (bundled WaterBottle demo)
- Open a product with 3D (e.g. *3D Showcase Sneaker* after `npm run seed`)
- Rotate, zoom, switch image/3D tabs on PDP
- Optional: mobile viewport (Chrome DevTools) for 15 seconds

## 1:10–1:35 — Shopping flow

- Add product to cart → open cart modal
- Navigate to checkout (Stripe test mode — explain keys configured in Admin → Settings)

## 1:35–2:20 — Admin panel

- `/admin/login` — no default credentials; show env bootstrap note
- Dashboard analytics overview
- **Products → Edit** — show image upload + **GLB upload** zone
- Sections CMS or SEO settings (pick one)

## 2:20–2:45 — Stack & deploy

- Quick montage: terminal `npm start` + `backend start:dev`
- Mention Docker Compose: `docker compose up`
- Docs hub: open `docs/client/index.html`

## 2:45–3:00 — Outro

- Feature bullets: Angular 17 · NestJS · PostgreSQL · Three.js · Stripe
- CTA: *Documentation included · MIT license · Demo assets bundled*

---

## Recording checklist

- [ ] Hide browser extensions / use Incognito
- [ ] Seed demo products: `cd backend && npm run seed`
- [ ] Window size 1920×1080 for desktop segments
- [ ] Export H.264 MP4, 1080p, ≤ 50 MB for marketplace upload
- [ ] Upload unlisted YouTube link for listing description

See also [VISUAL_ASSETS_GUIDE.md](../docs/VISUAL_ASSETS_GUIDE.md) and [WALKTHROUGH.md](./WALKTHROUGH.md).

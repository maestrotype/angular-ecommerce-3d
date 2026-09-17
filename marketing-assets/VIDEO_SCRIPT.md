# Demo Video Script (3–5 minutes)

**Full voiceover + multi-video pack (RU, shot-by-shot):** see [VIDEO_VOICEOVER_PACK.md](./VIDEO_VOICEOVER_PACK.md).

Use this short outline *or* the pack’s **V0** for the marketplace walkthrough.
Export to `demo-video/final/demo-video-1080p.mp4` and link from README / CodeCanyon.

**Tools:** OBS Studio or macOS Screen Recording · voiceover · royalty-free music (YouTube Audio Library)

---

## 0:00–0:15 — Intro

- Title card: **Angular E-commerce 3D**
- Subtitle: *Full-stack Angular + NestJS with interactive 3D product viewer*
- Show logo / hero homepage (light theme)

## 0:15–0:40 — Theme system

- Toggle **Light → Dark → Aurora** on storefront (header theme control)
- Mention: token-based design system, four themes, no hardcoded colors in components

## 0:40–1:10 — 3D viewer (hero feature)

- Open **Shop** — catalog with 3D-capable products
- Open a product with 3D (after `npm run backend:seed`)
- Rotate, zoom, switch image/3D on PDP
- Optional: mobile viewport (Chrome DevTools) for 15 seconds

## 1:10–1:35 — Shopping flow

- Add product to cart → open cart modal
- Navigate to checkout (Stripe test mode — keys in Admin → Settings)

## 1:35–2:20 — Admin panel

- `/admin/login`
- Dashboard overview
- **Products → Edit** — image upload + **Remove background** + **GLB upload**
- Sections CMS or SEO settings (pick one)

## 2:20–2:45 — Stack & deploy

- Quick montage: terminal `npm start` + `backend start:dev`
- Mention Docker Compose: `docker compose up`
- Docs hub: open `docs/client/index.html`

## 2:45–3:00 — Outro

- Feature bullets: Angular 17 · NestJS · PostgreSQL · Three.js · Stripe · remove.bg · i18n
- CTA: *Documentation included · Demo assets bundled*
- Honest: PayPal = mock

---

## Recording checklist

- [ ] Hide browser extensions / use Incognito
- [ ] Seed demo products: `npm run backend:seed`
- [ ] Window size 1920×1080 for desktop segments
- [ ] Export H.264 MP4, 1080p, ≤ 50–80 MB for marketplace upload
- [ ] Upload unlisted YouTube link for listing description

See also [VIDEO_VOICEOVER_PACK.md](./VIDEO_VOICEOVER_PACK.md), [VISUAL_ASSETS_GUIDE.md](../docs/VISUAL_ASSETS_GUIDE.md), and [WALKTHROUGH.md](./WALKTHROUGH.md).

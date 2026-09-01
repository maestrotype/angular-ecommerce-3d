# Listing pack (seller runbook)

Goal: upload a **demo URL**, **12+ PNGs**, and a **clean zip** — then paste [CODECANYON_LISTING.md](./CODECANYON_LISTING.md).

You still host the live demo and record the video. The repo now has the capture + zip commands.

---

## 1. Live demo

GitHub Pages alone is not enough (no NestJS / PostgreSQL).

**Minimum demo**

| Piece | Where |
|-------|--------|
| Storefront + admin | Render / Fly / Railway / VPS (Node) |
| API | Same host or `backend` service |
| DB | Managed PostgreSQL |

Point `FRONTEND_URL` and CORS at the public origin. Use Stripe **test** keys. Do not ship a default admin password on the public demo — publish a demo login in the listing only if you rotate it.

Replace `YOUR_LIVE_DEMO_URL` in `CODECANYON_LISTING.md` and the README when the URL is live.

---

## 2. Screenshots

With API + `ng serve` running and catalog seeded (`http://localhost:4200` — not `127.0.0.1`, CORS only allows localhost):

```bash
npm run backend:seed
npm run screenshots:capture
```

Signed-in admin shots (dashboard, products, sections):

```bash
ADMIN_SCREENSHOT_EMAIL='you@domain.com' \
ADMIN_SCREENSHOT_PASSWORD='your-local-admin-password' \
npm run screenshots:capture
```

Output: `screenshots/desktop/`, `screenshots/mobile/`, `screenshots/admin/`.

Envato wants **1920×1080** desktop frames. Compress with ImageOptim / TinyPNG before upload. Record the walkthrough with [VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md).

---

## 3. Zip (no secrets)

Commit the files you want buyers to receive, then:

```bash
npm run pack:marketplace
```

Writes `dist-marketplace/angular-ecommerce-3d-v1.0.0.zip` from **git HEAD** (uncommitted files are skipped). Generated screenshots are copied in if those folders exist.

The script refuses to pack `.env` / credential files. It also drops runtime junk that is still in git: `backend/uploads`, `backend.log`, local-AI worker outputs, seller `marketing-assets/videos`. Buyers get `START_HERE.md` at the zip root.

Existing listing PNGs (until you re-capture): `marketing-assets/screenshots/` (frontend, themes, admin, auth).

---

## 4. Upload order

1. Live demo URL
2. Gallery PNGs (homepage Light/Dark/Aurora + Product Stage, shop, PDP, checkout, admin Ice/Ember)
3. Zip
4. Paste listing copy + honest feature matrix (PayPal = mock)
5. Regular $89 / Extended $229
6. Support email live

Parallel store: same zip on Gumroad / Lemon Squeezy (Envato is non-exclusive).

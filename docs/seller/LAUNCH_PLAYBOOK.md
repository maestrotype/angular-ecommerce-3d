# Seller launch playbook

**This folder is seller-only.** It is excluded from `npm run pack:marketplace` (`.gitattributes` `export-ignore`). Do not put this file in the buyer zip.

Internal ids stay `light` / `dark` / `glass` / `dark-glass`. **Buyer-facing names:** Light, Dark, **Aurora** (storefront `glass`), **Ice** (admin `glass`), **Ember** (admin `dark-glass`).

---

## 1. Live demo host

GitHub Pages is not a demo. Buyers must click catalog, 3D, checkout, and admin. That needs Node + PostgreSQL.

### What to run

| Piece | Notes |
|-------|--------|
| Storefront + admin | Same Angular build, public HTTPS |
| API | NestJS (`/api`, Swagger `/api/docs`) |
| DB | Managed PostgreSQL 14+ |
| Assets | GLB via Cloudinary or the app’s upload disk (not a laptop path) |

Hosts that fit: **Render / Fly.io / Railway / a small VPS**. One web service for the API, one for the frontend (or SSR), one Postgres add-on.

### Config that must match the public URL

- `FRONTEND_URL` and CORS origins = the **exact** public origin (`https://demo.example.com`, not `http://localhost:4200`).
- Stripe **test** keys in Admin → Settings. Do not put live keys on the demo.
- Empty production secrets in the repo; set them only on the host.

### Demo login (listing only)

- Create a dedicated admin: e.g. `demo@…` with a long random password.
- Put **email + password on the CodeCanyon / Gumroad page**, not in the GitHub README.
- **Rotate** after launch, after a leak, and at least every 30 days. If someone wrecks seed data, restore from a nightly dump or re-seed.
- Do not ship `ADMIN_PASSWORD=change_me…` on the public instance.

### Seed the demo like a store, not a lab

- Catalog: **bags, clothing, shoes** with real titles (no `Test model 3dddd`).
- Every featured SKU used in screenshots must have a **GLB** so Product Stage and PDP orbit work.
- Homepage: Product Stage on, Light as default theme.

### Health check before you paste the URL

1. `/` loads, theme switch Light / Dark / Aurora.
2. Shop lists products; PDP rotates a model.
3. Add to cart → checkout (Stripe test or honest “demo” banner).
4. `/admin/login` → dashboard.
5. `/api/docs` opens.

When the URL is stable, replace `YOUR_LIVE_DEMO_URL` in `marketing-assets/CODECANYON_LISTING.md` and the README.

---

## 2. Screenshots

Shoot **after** Product Stage, seed, and theme labels are on the host (or local with `http://localhost:4200` — CORS does not allow `127.0.0.1`).

Envato desktop: **1920×1080**, not a scrolled full-page strip. Compress with ImageOptim / TinyPNG before upload.

### Must-have gallery (order)

1. Home + Product Stage — **Light**
2. Home + Product Stage — **Dark**
3. Home + Product Stage — **Aurora**
4. Shop — full catalog (bags / clothing / shoes), no leftover category filter
5. PDP — 3D orbit visible (canvas + product title + price)
6. Cart **with a line item** (not empty state)
7. Checkout with that cart
8. Admin dashboard (wow band, if shipped) — Ice or Ember, readable KPIs
9. Mobile home — Product Stage (390×844)

Nice extras: admin Sections (stage on/off), admin login, contacts.

### Commands

```bash
npm run backend:seed
npm run screenshots:capture
```

Admin inner pages:

```bash
ADMIN_SCREENSHOT_EMAIL='demo@…' \
ADMIN_SCREENSHOT_PASSWORD='…' \
npm run screenshots:capture
```

Output: `screenshots/desktop|mobile|admin/`. Older reference shots: `marketing-assets/screenshots/` (do not upload frames with placeholder copy).

Do **not** upload: empty About, empty cart, shop with “Failed to load products”, PDP titled `Test model 3dddd`.

---

## 3. Video (3–5 minutes)

Follow `marketing-assets/VIDEO_SCRIPT.md` and keep this beat sheet:

| Time | Beat |
|------|------|
| 0:00 | Title + live URL |
| 0:20 | Home Product Stage: drag orbit, switch bag → clothing → shoes |
| 1:10 | Add to cart from the stage |
| 1:30 | Open PDP: 3D still works, add/qty |
| 2:10 | Checkout (Stripe test or labeled mock) |
| 2:40 | Admin → Sections: disable Product Stage, show home without it, enable again |
| 3:20 | Theme switch Light / Dark / Aurora (storefront) and Ice / Ember (admin) |
| 3:50 | Honest: PayPal is mock; Stripe needs your keys |
| 4:10 | Close on price Regular / Extended |

1080p, no desktop clutter, no real card numbers. Thumbnail = Product Stage still.

---

## 4. Listing copy and price

Paste `marketing-assets/CODECANYON_LISTING.md`. Then:

1. Live demo URL in the first paragraph.
2. Regular **$89**, Extended **$229**.
3. Category: CodeCanyon JavaScript / Shopping — **not** ThemeForest.
4. Feature list: Angular 17, NestJS, Three.js GLB, admin CMS, Stripe, i18n, themes Light / Dark / Aurora + admin Ice / Ember.
5. **PayPal = mock** (labeled). Stripe and LiqPay need the buyer’s keys.
6. Support email live (`support@maestrotype.com` or whatever you actually answer).

Same zip can go to Gumroad / Lemon Squeezy in parallel (Envato is non-exclusive; author keep ~50% there, ~90% on your store).

---

## 5. License: public MIT vs paid zip

The repo `LICENSE` is **MIT**. Marketplace Regular/Extended only work if buyers cannot clone the product for free.

| Choice | What you do | Risk |
|--------|-------------|------|
| **A — Paid product** | Private GitHub (or public **docs-only**). Zip is the SKU. MIT still covers *buyer* modifications. | Correct for CodeCanyon / Gumroad. |
| **B — Public MIT** | Anyone clones `main`. | Paid listing is easy to ignore. Use only if the goal is portfolio, not sales. |
| **C — Dual** | Public docs + screenshots; source behind the store. | Extra work; cleanest commercially. |

Decide **before** first sale. If GitHub stays public with full source, say so on the listing or do not sell Regular/Extended.

Platform Regular = one end product. Extended = paid/SaaS end product. Wording: `docs/MARKETPLACE_LICENSE.md`.

---

## Pack reminder

```bash
npm run pack:marketplace
# → dist-marketplace/angular-ecommerce-3d-v1.0.0.zip
```

Commit listing docs first if you want them inside the zip. This `docs/seller/` directory is stripped on purpose.

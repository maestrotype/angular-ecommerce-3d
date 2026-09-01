# Angular 3D E-Commerce — Marketplace Listing Copy

> Modern full-stack e-commerce with interactive 3D product viewer · Angular 17 + NestJS 10 + PostgreSQL

[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=flat&logo=angular)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-GLB_Viewer-000000?style=flat&logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat)](../LICENSE)

---

## Overview

**Angular 3D E-Commerce** is a full-stack starter for agencies and product teams building shops where products benefit from **interactive 3D preview** (footwear, furniture, accessories, collectibles).

**Promise:** Premium Angular + NestJS codebase with admin panel, multi-theme UI, Stripe checkout, and bundled demo 3D assets — ready to customize and deploy.

**Not included out of the box:** PayPal live API (mock mode with UI labels), compliance certifications, hosted demo DB.

---

## Feature matrix (honest)

| Feature | Status | Notes |
|---------|--------|-------|
| Storefront catalog & PDP | ✅ Ready | Rozetka-style product page layout |
| Three.js GLB viewer | ✅ Ready | Bundled CC0 demo models included |
| Admin CRUD (products, orders, users) | ✅ Ready | JWT-protected |
| 4 themes (Light / Dark / Aurora storefront; Ice / Ember admin) | ✅ Ready | CSS token architecture (`glass` / `dark-glass` ids) |
| Stripe payments | ✅ Ready | Configure keys in Admin → Settings |
| LiqPay | ✅ Ready | Regional gateway |
| PayPal | ⚠️ Mock (labeled in UI) | Simulated checkout without API keys |
| SSR build | ✅ Ready | `npm run build:prod` + `server-simple.mjs` |
| Docker Compose | ✅ Ready | nginx CSR + NestJS + PostgreSQL |
| i18n (EN / UA / RU) | ✅ Ready | ngx-translate |
| AI 3D generation | ⚠️ Optional | Tripo3D / Meshy / etc. — requires buyer API keys |
| Product recommendations | ⚠️ Demo | Module present; tune for production |
| Swagger UI | ✅ Ready | `http://localhost:3002/api/docs` when backend runs |
| Bundled screenshots / video | 📦 Partial | Capture script + script provided; record locally |

---

## Key selling points

### Interactive 3D
- GLB/GLTF upload in admin
- Orbit, zoom, lighting on storefront
- **3 bundled Khronos CC0 models** — demo works immediately

### E-commerce core
- Catalog, filters, cart, checkout, favorites, order history
- Multi-step checkout with Stripe Elements

### Admin panel
- Dashboard (Chart.js), products, orders, users, categories
- Sections CMS for homepage blocks
- SEO: meta, sitemap, robots.txt editor

### Design system
- Semantic CSS tokens — no `!important` wars with Material
- Four themes (Light, Dark, Aurora), responsive layout

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 17, TypeScript, SCSS, Three.js, Angular Material |
| Backend | NestJS 10, TypeORM, PostgreSQL, JWT |
| Media | Cloudinary optional; local uploads supported |
| Deploy | Docker Compose, SSR Node server, static nginx |

---

## Requirements

- Node.js 18+, npm 9+
- PostgreSQL 14+
- Modern browser (Chrome 90+, Safari 14+, Firefox 88+)

---

## Quick start (buyer)

```bash
unzip angular-ecommerce-3d.zip && cd angular-ecommerce-3d
npm install && cd backend && npm install && cd ..
cp backend/.env.example backend/.env
# Set DATABASE_*, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

cd backend && npm run start:dev          # Terminal 1
npm start                                 # Terminal 2 → http://localhost:4200

cd backend && npm run seed
curl -X POST http://localhost:3002/api/auth/create-admin
```

Docker: `docker compose up -d --build` (see `docs/INSTALLATION.md`)

**Documentation hub:** `docs/client/index.html`

---

## What's included

- ✅ Full source (monorepo: Angular root + `backend/`)
- ✅ Bundled demo SVG product images + 3 CC0 `.glb` models
- ✅ `npm run seed` for sample products
- ✅ HTML + Markdown documentation for buyers
- ✅ Docker Compose file
- ✅ Playwright smoke tests + screenshot capture helper
- ✅ `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, MIT license
- 📦 Screenshots: run `npm run screenshots:capture` then pack (see [LISTING_PACK.md](./LISTING_PACK.md))
- ❌ Pre-recorded demo video (use [VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md))

---

## Customization

1. **Branding** — themes in `src/styles/themes/`, logo in `src/assets/icons/`
2. **Products** — Admin → Products or extend `backend/src/database/seeds/`
3. **3D models** — replace files in `src/assets/demo/models/` or upload via admin
4. **Payments** — Admin → Settings (Stripe publishable/secret keys)

See [docs/CUSTOMIZATION.md](../docs/CUSTOMIZATION.md).

---

## Security (v1.0)

- No default admin login in frontend builds
- Env-driven admin bootstrap
- JWT secret validation in production
- See [First Deploy Security Checklist](../docs/INSTALLATION.md)

---

## Browser support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## License (marketplace)

Regular / Extended license terms are set by the marketplace platform (Envato, Gumroad, etc.).

**Source code:** MIT — see [LICENSE](../LICENSE) and [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

---

## Support

- Email: support@maestrotype.com
- Docs: [docs/SUPPORT.md](../docs/SUPPORT.md)
- Troubleshooting: [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

---

## Visual assets workflow

1. Seed data: `cd backend && npm run seed`
2. Start dev servers
3. Capture: `npm run screenshots:capture` → `screenshots/desktop|mobile|admin/`
4. Record video using [VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md)
5. Build previews per [VISUAL_ASSETS_GUIDE.md](../docs/VISUAL_ASSETS_GUIDE.md)

Gallery shell: [SHOWCASE.html](./SHOWCASE.html)

---

## Changelog summary

See [CHANGELOG.md](../CHANGELOG.md) for full history.

**v1.0.0** — Initial marketplace release: 3D viewer, admin, Stripe, themes, Docker, docs hub, bundled demo assets.

---

<div align="center">

**Angular 3D E-Commerce** — *Sell products in three dimensions.*

[Documentation](../docs/client/index.html) · [Listing pack](./LISTING_PACK.md) · Live demo: `YOUR_LIVE_DEMO_URL`

</div>

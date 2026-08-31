# Angular E-commerce 3D Platform

<div align="center">

![Angular 17+](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular)
![NestJS 10+](https://img.shields.io/badge/NestJS-10+-E0234E?style=for-the-badge&logo=nestjs)
![Three.js 3D](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js)
![MIT License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Full-stack e-commerce with interactive 3D product previews, multi-theme design system, and NestJS admin API.**

[Documentation](docs/client/index.html) · [Listing pack](marketing-assets/LISTING_PACK.md) · [Walkthrough Script](marketing-assets/VIDEO_SCRIPT.md) · [Support](docs/SUPPORT.md)

Live demo URL: set `YOUR_LIVE_DEMO_URL` in [marketing-assets/CODECANYON_LISTING.md](marketing-assets/CODECANYON_LISTING.md) after you deploy the stack (GitHub Pages is not a full demo).

</div>

---

## Why this template

This is a **commercial-grade starter**, not a minimal shop demo:

- **3D-first storefront** — Three.js GLB viewer on PDP, shop, and configurable sections
- **Token-based themes** — light, dark, glass, and admin dark-glass via CSS design tokens
- **Production-shaped stack** — Angular 17, NestJS 10, PostgreSQL, Docker Compose, SSR build path
- **Bundled demo assets** — local product images + CC0 sample `.glb` models (works offline)

See [CHANGELOG.md](CHANGELOG.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for release and attribution details.

---

## Key features

| Area | Included |
|------|----------|
| Storefront | Catalog, PDP (Rozetka-style layout), cart, checkout, favorites, orders |
| 3D | GLB upload in admin, viewer with orbit/zoom, bundled Khronos demo models |
| Admin | Dashboard, products, orders, users, sections CMS, SEO, settings |
| Payments | **Stripe** (real integration), **LiqPay**, **PayPal** (mock — labeled in admin & checkout) |
| i18n | English, Ukrainian, Russian |
| Themes | 4 visual themes, semantic CSS tokens (no hardcoded component colors) |
| Deploy | Docker Compose (CSR nginx + API), SSR via `server-simple.mjs`, docs hub |

**Not included out of the box:** PayPal live API (mock mode with UI labels), compliance certifications, hosted demo DB.

---

## Tech stack

- **Frontend:** Angular 17, TypeScript, SCSS, Three.js, Angular Material, ngx-translate
- **Backend:** NestJS 10, TypeORM, PostgreSQL, JWT auth
- **Ops:** Docker Compose, optional Cloudinary for media

Architecture docs: [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) · [docs/client/architecture.html](docs/client/architecture.html)

---

## Quick start

### Requirements

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Install

```bash
git clone https://github.com/maestrotype/angular-ecommerce-3d.git
cd angular-ecommerce-3d

npm install   # frontend + backend (npm workspaces)

cp backend/.env.example backend/.env
# Edit backend/.env — DATABASE_*, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
```

### Run (development)

```bash
# Terminal 1 — API
npm run backend:start:dev

# Terminal 2 — storefront (http://localhost:4200)
npm start
```

### Demo data

```bash
npm run backend:seed
curl -X POST http://localhost:3002/api/auth/create-admin
```

Full guide: [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) · [docs/INSTALLATION.md](docs/INSTALLATION.md)

### Docker

```bash
cp backend/.env.example backend/.env
docker compose up -d --build
```

---

## Marketplace assets

| Asset | Location |
|-------|----------|
| Demo 3D models | `npm run demo:models` (duck bundled; others downloaded) |
| Demo product images | `src/assets/demo/products/` |
| Screenshot capture | `npm run screenshots:capture` (requires dev servers) |
| Listing copy | [marketing-assets/MARKETPLACE_DESCRIPTION.md](marketing-assets/MARKETPLACE_DESCRIPTION.md) |
| Launch checklist | [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) |
| Visual guide | [docs/VISUAL_ASSETS_GUIDE.md](docs/VISUAL_ASSETS_GUIDE.md) |

---

## License

MIT — see [LICENSE](LICENSE). Demo Khronos models are [CC0](src/assets/demo/README.md).

---

## Support

- Email: support@maestrotype.com
- Docs: [docs/SUPPORT.md](docs/SUPPORT.md)

<div align="center">

**[Back to top](#angular-e-commerce-3d-platform)**

</div>

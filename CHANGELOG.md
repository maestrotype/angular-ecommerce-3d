# Changelog

All notable changes to this project are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Marketplace listing pack: `npm run pack:marketplace`, expanded screenshot capture, CodeCanyon paste-ready copy.
- GitHub Actions CI: frontend build, backend lint/build, Playwright smoke e2e.
- Swagger UI at `/api/docs` (OpenAPI JSON at `/api/docs-json`).
- PayPal mock notices in Admin → Settings and checkout payment page.
- Backend ESLint config (`backend/.eslintrc.js`).
- `npm run seed` in backend to populate sample products without external image URLs.
- `npm run screenshots:capture` Playwright helper for marketplace screenshot batch.
- `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, and honest marketplace listing copy.

### Changed
- Product seed data uses bundled assets instead of Unsplash URLs.
- Shop page and legacy 3D components reference bundled demo models.
- Backend `package.json` license aligned with root MIT license.
- Root `README.md` primary language set to English.

## [1.0.0] - 2026-08-07

First public marketplace template release (Track A packaging).

### Added
- Full-stack Angular 17 + NestJS 10 e-commerce platform.
- Interactive Three.js GLB/GLTF product viewer on storefront and PDP.
- Admin panel: products, orders, users, sections, SEO, settings, integrations.
- Four visual themes (light, dark, glass, dark-glass admin).
- Stripe, LiqPay, and PayPal strategy scaffolding (PayPal mock without credentials).
- Angular Universal SSR build path and PWA service worker support.
- PostgreSQL + TypeORM, Docker Compose stack, client documentation hub.
- i18n (EN / UA / RU), recommendations module, AI 3D generation integrations (optional API keys).

### Security
- No hardcoded admin credentials; env-driven bootstrap (Phase A1).
- Production JWT and secrets fail-fast validation.

[Unreleased]: https://github.com/maestrotype/angular-ecommerce-3d/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/maestrotype/angular-ecommerce-3d/releases/tag/v1.0.0

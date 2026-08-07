# Marketplace Launch Roadmap

**Created**: 2026-08-06  
**Maintainer**: Project owner  
**Status**: Active planning document  
**Baseline score**: **8/10** marketplace readiness (Phase A4 CI + Swagger + honest PayPal — see §2)

> This document is the single instruction set for taking **angular-ecommerce-3d** from a feature-complete codebase to a **sellable marketplace template**, with an optional second track toward **enterprise production-ready out of the box**.

Related docs: [PROJECT_STATUS.md](PROJECT_STATUS.md) · [REFACTORING_BOARD.md](REFACTORING_BOARD.md) · [VISUAL_ASSETS_GUIDE.md](VISUAL_ASSETS_GUIDE.md) · [POLISH_AND_QUALITY.md](POLISH_AND_QUALITY.md) · [marketing-assets/MARKETPLACE_DESCRIPTION.md](../marketing-assets/MARKETPLACE_DESCRIPTION.md)

---

## 1. Strategic framing

### Track A — Marketplace template (base goal)

**Target buyer**: agency, freelancer, or startup that will customize and deploy for a client or MVP.

**Promise**: *“Premium full-stack Angular + NestJS e-commerce starter with interactive 3D product viewer, admin panel, and multi-theme design system.”*

**Not promised**: zero-config production deploy, compliance certifications, SLA, managed hosting.

**Success criteria for Track A**

| Criterion | Target |
|-----------|--------|
| Buyer can run locally in ≤30 min | Follow `GETTING_STARTED.md` without broken steps |
| Docker one-command demo | `docker compose up` serves working storefront + API |
| Listing assets complete | ≥12 screenshots, demo video, feature list matches code |
| No security foot-guns in default build | No auto-admin, no pre-filled login, no mock payment keys in prod |
| Honest feature disclosure | PayPal mock, AI experimental, recommendations demo — documented |
| Marketplace review pass | Envato / Gumroad technical review without rejection |

**Realistic price band (regular license)**: **$49–$99** at launch → **$79–$149** after polish.

---

### Track B — Enterprise production-ready (optional horizon)

**Target buyer**: product team or SaaS operator expecting deploy-and-operate with minimal hardening.

**Promise**: *“Production-hardened e-commerce platform: tested, CI-gated, security-reviewed, observable, and documented for ops.”*

**Additional requirements beyond Track A**

| Area | Enterprise bar |
|------|----------------|
| Testing | Meaningful unit + integration + e2e coverage; CI required on PR |
| Security | No default credentials; secrets via env; dependency audit; OWASP basics |
| Payments | Stripe + at least one regional provider fully live (not mock) |
| Deploy | Verified Docker + SSR path + staging guide |
| Observability | Structured logging, health checks, error tracking hooks |
| Compliance docs | License matrix, third-party notices, data handling notes |
| Support model | Changelog, semver, migration notes between versions |

**Realistic price band**: **$149–$299** (regular) · **$499–$999+** (extended / SaaS license) · optional support subscription.

---

## 2. Current readiness snapshot (2026-08-06)

| Category | Score | Notes |
|----------|-------|-------|
| Features / scope | 8/10 | Storefront, admin, 3D, i18n, themes, SEO, SSR |
| UI / UX polish | 7.5/10 | Token system mature; manual cross-theme QA open |
| Documentation | 7/10 | 53 docs; broken README links, Swagger claim vs code |
| Code architecture | 8/10 | Epics A–G complete; ADR + Theme Engine |
| Production readiness | 6/10 | JWT fail-fast, no default admin; Docker path still pending (A2) |
| Testing / QA | 3/10 | 4 test files; no CI |
| Security | 6/10 | Bootstrap token + env-driven admin; payment keys cleared from prod env |
| Marketplace packaging | 4/10 | Screenshots / demo GLB missing |
| Legal / licensing | 5/10 | MIT vs backend UNLICENSED; Unsplash seeds |

**Overall: 7 / 10** — sellable as premium template with caveats; Phase A1 security complete.

---

## 3. Track A — Launch checklist (template)

Work in priority order. Mark items `[ ]` → `[x]` as completed.

### Phase A1 — Security & trust (blockers) · ~3–5 days

| # | Task | Files / area | Done |
|---|------|--------------|------|
| A1.1 | Remove auto-creation of default admin in production | `backend/src/auth/auth.service.ts` | [x] |
| A1.2 | Empty admin login form defaults (dev-only via env flag if needed) | `src/admin/pages/login/admin-login.component.ts` | [x] |
| A1.3 | Replace mock Stripe/PayPal keys with build-time env injection | `src/environments/environment*.ts`, `angular.json` fileReplacements | [x] |
| A1.4 | Require `JWT_SECRET` in prod (fail fast if default) | `backend/src/main.ts`, `docker-compose.yml` | [x] |
| A1.5 | Document “first deploy security” section | `docs/INSTALLATION.md`, `docs/FAQ.md` | [x] |

**Exit gate**: fresh deploy has **no** known default credentials; prod env rejects placeholder secrets.

---

### Phase A2 — Deploy path works · ~2–3 days

| # | Task | Files / area | Done |
|---|------|--------------|------|
| A2.1 | Fix Docker COPY path → `dist/angular-ecommerce-3d/browser` | `Dockerfile` | [x] |
| A2.2 | Add root `.env.example` (frontend + backend pointers) | repo root | [x] |
| A2.3 | Fix README broken links (`WALKTHROUGH.md`, `SUPPORT.md`) | `README.md` | [x] |
| A2.4 | Fix `cp .env.example` instruction (backend-only today) | `README.md`, `docs/GETTING_STARTED.md` | [x] |
| A2.5 | Remove or fix `serve:ssr:dev` script reference | `docs/GETTING_STARTED.md`, `playwright.config.ts`, `package.json` | [x] |
| A2.6 | Verify `docker compose up` end-to-end | manual QA log in this doc §6 | [ ] |

**Exit gate**: new buyer follows Quick Start → sees storefront + admin without reading source.

---

### Phase A3 — Marketplace packaging · ~5–7 days

| # | Task | Files / area | Done |
|---|------|--------------|------|
| A3.1 | Capture 12–15 screenshots (light/dark/glass × storefront/admin/3D/PDP/checkout) | `screenshots/` per [VISUAL_ASSETS_GUIDE.md](VISUAL_ASSETS_GUIDE.md) | [ ] |
| A3.2 | Bundle 2–3 demo `.glb` models (licensed or self-made) | `src/assets/demo/` or CDN doc | [x] |
| A3.3 | Replace / license seed product images (not raw Unsplash URLs) | `backend/src/database/seeds/` | [x] |
| A3.4 | Record 3–5 min walkthrough video | `marketing-assets/` | [ ] |
| A3.5 | Add `CHANGELOG.md` (semver from first public release) | repo root | [x] |
| A3.6 | Add `THIRD_PARTY_NOTICES.md` | repo root or `docs/` | [x] |
| A3.7 | Align backend license with root MIT | `backend/package.json` | [x] |
| A3.8 | Unify README language (EN primary for international marketplace) | `README.md` | [x] |
| A3.9 | Update listing copy — honest feature matrix | `marketing-assets/MARKETPLACE_DESCRIPTION.md` | [x] |

**Exit gate**: listing page needs no “coming soon” placeholders; 3D demo works without buyer supplying assets.

---

### Phase A4 — Minimum quality bar · ~3–5 days

| # | Task | Files / area | Done |
|---|------|--------------|------|
| A4.1 | GitHub Actions: `npm run build` + backend build | `.github/workflows/ci.yml` | [x] |
| A4.2 | Smoke e2e in CI (storefront loads, admin login page) | `e2e/smoke.spec.ts` | [x] |
| A4.3 | Backend lint in CI | `backend/package.json` | [x] |
| A4.4 | Resolve Swagger claim: implement or remove from docs | `docs/BACKEND_API.md`, `backend/src/main.ts` | [x] |
| A4.5 | PayPal: implement real flow **or** remove from “supported payments” list | `backend/src/payments/` | [x] |
| A4.6 | Complete manual QA matrix | [POLISH_AND_QUALITY.md](POLISH_AND_QUALITY.md) unchecked rows | [ ] |

**Exit gate**: green CI on main; no doc claims without code backing.

---

### Phase A5 — Launch

| # | Task | Done |
|---|------|------|
| A5.1 | Choose platform (CodeCanyon / ThemeForest / Gumroad / own site) | [docs/MARKETPLACE_LICENSE.md](MARKETPLACE_LICENSE.md) | [x] |
| A5.2 | Set regular + extended license terms | [docs/MARKETPLACE_LICENSE.md](MARKETPLACE_LICENSE.md) | [x] |
| A5.3 | Prepare support channel (email / Discord) — see [SUPPORT.md](SUPPORT.md) | [x] |
| A5.4 | Soft launch to 2–3 beta buyers for feedback | [docs/LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | [ ] |
| A5.5 | Publish v1.0.0 tag after A1–A4 gates | [docs/LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | [ ] |

**Track A complete when**: score ≥ **8/10** on §2 table; all A1–A4 exit gates passed.

---

## 4. Track B — Enterprise hardening (post-launch)

Only start after Track A v1.0.0 is live and receiving buyer feedback.

### Phase B1 — Testing · ~2–3 weeks

| # | Task | Target |
|---|------|--------|
| B1.1 | Backend unit tests: auth, products, orders, payments | ≥20 spec files |
| B1.2 | Frontend unit tests: cart, checkout, product-detail, theme | ≥15 spec files |
| B1.3 | Integration tests: checkout + Stripe webhook (test mode) | 1 suite |
| B1.4 | E2e: full purchase flow | Playwright |
| B1.5 | Coverage threshold in CI | e.g. 60% services, 40% overall |

---

### Phase B2 — Security & compliance · ~1–2 weeks

| # | Task |
|---|------|
| B2.1 | Dependency audit workflow (`npm audit`, Snyk optional) |
| B2.2 | Rate limiting review on auth + upload endpoints |
| B2.3 | CORS from env, not hardcoded domains |
| B2.4 | Security.md + responsible disclosure |
| B2.5 | GDPR-oriented data export/delete notes (even if minimal) |

---

### Phase B3 — Operations · ~1–2 weeks

| # | Task |
|---|------|
| B3.1 | SSR Docker path documented and tested |
| B3.2 | Health + readiness endpoints |
| B3.3 | Structured JSON logging (NestJS) |
| B3.4 | Sentry / error tracking integration (optional env) |
| B3.5 | Staging + production deploy runbooks |

---

### Phase B4 — Product completeness · ~2–4 weeks

| # | Task |
|---|------|
| B4.1 | Real PayPal or official removal |
| B4.2 | Favorites backend sync (close TODO) |
| B4.3 | Recommendations: real scoring or feature flag off |
| B4.4 | AI 3D: stable provider path or “plugin / beta” module |
| B4.5 | Frontend ESLint + strict TypeScript incrementally |

**Track B complete when**: score ≥ **9/10**; enterprise buyer can deploy with checklist only.

---

## 5. Feature honesty matrix (listing copy)

Use this table verbatim in marketplace description to reduce refunds and bad reviews.

| Feature | Status | Buyer note |
|---------|--------|------------|
| Storefront (shop, PDP, cart) | ✅ Ready | — |
| Admin CRUD | ✅ Ready | Change default credentials |
| 3D viewer (GLB upload) | ✅ Ready | Provide own models or use bundled demo |
| Themes (light/dark/glass) | ✅ Ready | dark-glass is admin-only |
| i18n EN/RU/UA | ✅ Ready | — |
| SSR / PWA | ✅ Ready | SSR needs Node deploy, not nginx-only Docker |
| Stripe payments | ✅ Ready | Requires Stripe keys |
| LiqPay | ✅ Ready | Requires merchant keys |
| PayPal | ⚠️ Mock | Not production until B4.1 |
| AI 3D generation | 🔬 Experimental | External API keys required |
| Recommendations | ⚠️ Demo quality | Not ML-production grade |
| Swagger API docs | ✅ `/api/docs` | OpenAPI UI when backend runs |

---

## 6. QA log (fill during launch prep)

| Date | Tester | Scenario | Result | Notes |
|------|--------|----------|--------|-------|
| | | Fresh clone → GETTING_STARTED | | |
| 2026-08-07 | Agent | GitHub Actions CI | pass | build + lint + smoke e2e configured |
| 2026-08-07 | Agent | Demo 3D + seed | pass | Khronos CC0 models + local SVG seeds |
| | | 3D model upload + view | | |
| | | Checkout Stripe test mode | | |
| | | Theme switch all 4 | | |
| | | Mobile 375px storefront | | |

---

## 7. Version milestones

| Version | Scope | Target score |
|---------|-------|--------------|
| **v0.9-beta** | Internal QA, fix A1–A2 | 7/10 |
| **v1.0.0** | Track A complete (marketplace launch) | 8/10 |
| **v1.x** | Buyer feedback, bugfixes | 8–8.5/10 |
| **v2.0.0** | Track B enterprise tier | 9/10 |

---

## 8. Effort summary

| Track | Calendar (focused solo dev) | Outcome |
|-------|----------------------------|---------|
| **A — Template launch** | ~3–4 weeks | Sellable on marketplace |
| **B — Enterprise** | +6–10 weeks after A | Premium tier / higher price |

---

## 9. Maintenance after launch

- **Monthly**: dependency updates, security patch release if needed
- **Quarterly**: minor feature release (buyer-driven)
- **Major (yearly)**: Angular major version bump — plan migration guide

Keep [CHANGELOG.md](../CHANGELOG.md) and bump semver per [Keep a Changelog](https://keepachangelog.com/).

---

*Last reviewed: 2026-08-06. Update §2 scores after each phase gate.*

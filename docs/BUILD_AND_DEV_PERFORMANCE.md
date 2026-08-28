# Build & Dev Performance — Audit & Optimization Guide

**Created**: 2026-08-26  
**Maintainer**: Project owner  
**Status**: Complete — Epic J closed 2026-08-28  
**Audience**: AI agents, contributors, marketplace buyers who fork the template

> **Related**: [ARCHITECTURE.md](ARCHITECTURE.md) · [REFACTORING_BOARD.md](REFACTORING_BOARD.md) § Epic J · [tasks/](tasks/) · [MARKETPLACE_LAUNCH_ROADMAP.md](MARKETPLACE_LAUNCH_ROADMAP.md)

---

## 1. Executive summary

The codebase is **functionally sound** (style epics A–G complete, NestJS modular backend). **Epic J (Build, DX & Architecture) is complete** — the structural bottlenecks identified in the 2026-08-26 audit have been addressed.

| Area | Baseline (2026-08-26) | After Epic J (2026-08-28) |
|------|------------------------|---------------------------|
| Frontend (`ng build`) | ~14 s (webpack `browser` builder) | `application` builder (esbuild); AppModule dedup; lazy admin features |
| Backend (`nest build`) | ~4–5 s; cache wiped on start | Incremental cache preserved; `start:dev` default |
| Install | ~1.33 GB (dual `npm install`) | ~1.20 GB (npm workspaces, single lockfile) |
| Layer boundaries | Storefront imported `src/admin/` | `SectionService` + `Admin*` services in core |
| Admin DX | ~1940-line section-form | Orchestrator ~320 lines + type-specific sub-forms |

**Marketplace angle**: Buyers get faster dev builds, clearer service ownership, and a single `npm install` at the repo root.

---

## 2. Frontend build pipeline

### 2.1 Current configuration (post Epic J)

| Setting | Value | Notes |
|---------|-------|-------|
| Builder | `@angular-devkit/build-angular:application` (esbuild) | J2 ✅ |
| TS scope | `tsconfig.app.json` → `src/**/*.ts` | Admin + storefront still one project (Nx split deferred) |
| Lazy admin route | `/admin` → lazy feature modules | J4 ✅ sections/products/orders split |
| Section renderer | Dynamic imports via `section-map.ts` | Layout components not duplicated in AppModule (J5 ✅) |
| Global styles | `material-theme.scss` + `admin.scss` + `main.scss` | Unchanged |
| SSR | Separate `server` target in `angular.json` | Works with application builder |

### 2.2 Resolved bottlenecks (Epic J)

| Issue | Fix | Task |
|-------|-----|------|
| Duplicate layout imports in `AppModule` | Removed; section-map only | J5 ✅ |
| Storefront → admin coupling | `SectionService` in `core/services` | J3 ✅ |
| ~1940-line `section-form` | Decomposed to ~320-line orchestrator + sub-forms | J7 ✅ |
| Duplicate service classes | `Admin*` services + shared models | J6 ✅ |
| Monolithic admin chunk | Lazy feature routes | J4 ✅ |

**J7 residual**: `video-hero` UI remains in the parent section-form template (not extracted).

**Optional future**: split storefront/admin TypeScript projects (Nx Option B — deferred at J8).

### 2.3 Recommended dev commands (frontend)

```bash
# Development — use watch mode (default for ng serve)
npm start
# or explicit:
ng serve

# Production build (includes SSR when using build:prod)
npm run build:prod
```

### 2.4 Epic J outcomes

| Metric | Baseline | After Epic J |
|--------|----------|--------------|
| Builder | webpack `browser` | esbuild `application` |
| Storefront → admin imports | SectionService from admin | 0 imports (`core/services`) |
| AppModule layout dupes | Hero, categories, etc. eager | Section-map only |
| Admin chunk | ~1.6 MB monolith | Lazy feature modules (~505 KB shell) |
| section-form | ~1940 lines | ~320 lines orchestrator |
| Install | dual lockfile, ~1.33 GB | workspaces, ~1.20 GB |

---

## 3. Backend build pipeline

### 3.1 Current configuration

| Setting | Value | Impact |
|---------|-------|--------|
| Compiler | `tsc` via Nest CLI | `incremental: true` in tsconfig |
| `prebuild` | `rm -f tsconfig.tsbuildinfo` | **Disables incremental compiles** |
| `start` script | full `nest build && node dist/main.js` | Full rebuild on every start |
| `start:dev` | `nest start --watch` (but also deletes tsbuildinfo) | Watch works, cache wiped at start |
| `nest-cli.json` | `deleteOutDir: true` | Clean dist every build |
| `@gltf-transform/cli` | in **production** `dependencies` | Bloated install (~heavy transitive deps) |

### 3.2 Recommended dev commands (backend)

```bash
# ✅ Development — from repo root (preferred)
npm run backend:start:dev

# ✅ Equivalent from backend/ folder
cd backend && npm run start:dev

# ✅ Production
npm run backend:build && cd backend && npm run start:prod
```

### 3.3 TypeORM dev settings

`database.config.ts` enables `synchronize: true` and SQL `logging` in development. This is convenient for template buyers but can slow startup and is risky with real data. Documented in [INSTALLATION.md](INSTALLATION.md); optional hardening in Track B.

---

## 4. Layer boundaries (marketplace maintainability)

```
src/
├── app/           # Storefront application
├── admin/         # Admin panel (should NOT be imported by app/ except via lazy route)
├── shared/        # Models, utils, pipes — safe for both app and admin
└── environments/
```

### Rules for agents and buyers

1. **Storefront (`src/app/`) must not import from `src/admin/`** — except the lazy-loaded `AdminModule` route in `app-routing.module.ts`.
2. **Shared contracts** (models, DTO shapes, public API services) live in `src/shared/` or `src/app/core/services/`.
3. **Admin-only services** stay in `src/admin/services/` (re-exporting from `core/services/admin/`) with distinct `Admin*` names where overlapping.
4. **Never use `!important`** in styles — see [AI_CONSTITUTION.md](AI_CONSTITUTION.md) and `.cursor/rules/no-important.mdc`.

---

## 5. Epic J task index

| Task | Priority | Effort | File |
|------|----------|--------|------|
| J1 — Backend incremental dev scripts | P0 | ~1 h | [task_004](tasks/task_004_backend_dev_scripts_incremental_build.md) ✅ |
| J2 — Angular application builder | P0 | ~4–8 h | [task_005](tasks/task_005_angular_application_builder.md) ✅ |
| J3 — Storefront/admin layer boundaries | P1 | ~2–4 h | [task_006](tasks/task_006_storefront_admin_layer_boundaries.md) ✅ |
| J4 — Admin lazy feature routes | P1 | ~1–2 d | [task_007](tasks/task_007_admin_lazy_feature_routes.md) ✅ |
| J5 — AppModule layout deduplication | P1 | ~2–4 h | [task_008](tasks/task_008_app_module_layout_deduplication.md) ✅ |
| J6 — Consolidate services & models | P2 | ~2–3 d | [task_009](tasks/task_009_consolidate_shared_services_models.md) ✅ |
| J7 — Section form decomposition | P2 | ~3–5 d | [task_010](tasks/task_010_section_form_decomposition.md) ✅ |
| J8 — Monorepo / npm workspaces (optional) | P3 | ~1–2 d | [task_011](tasks/task_011_monorepo_workspaces_optional.md) ✅ Option A |

**Epic J complete** (2026-08-28). Execute order was J1 → J2 → J3 → J5 → J4 → J6 → J7 → J8.

---

## 4. npm workspaces (J8 — Option A)

**Decision:** Root npm workspaces with `backend` as nested package. Nx / split Angular apps deferred.

```bash
# Single install (frontend + backend)
npm install

# Dev
npm start                    # Angular
npm run backend:start:dev    # NestJS API

# Build all
npm run build:all
```

| Metric | Before | After |
|--------|--------|-------|
| Combined `node_modules` | ~1.33 GB | ~1.20 GB |
| Install commands | 2 (`npm install` × root + backend) | 1 |
| Lockfiles | 2 | 1 (root) |

TypeScript is pinned to `~5.4.5` at the root via `overrides` so Angular 17 and NestJS share a compatible compiler version.

Docker / Render backend deploy uses **repository root** as build context (`render.yaml` → `rootDir: .`, `backend/Dockerfile`).

---

## 6. Verification commands

```bash
# Frontend build
npm run build

# Backend build
npm run backend:build

# Measure build time (macOS)
/usr/bin/time -p npm run build
/usr/bin/time -p sh -c 'npm run backend:build'

# Count TS files in compilation scope
find src -name '*.ts' | wc -l
find backend/src -name '*.ts' | wc -l

# Find storefront → admin imports (should trend to 0 after J3)
rg "from 'src/admin|from \"src/admin" src/app
```

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-08-28 | Epic J closed; doc sync — all J1–J8 marked complete |
| 2026-08-27 | J8: npm workspaces (Option A); ~10% smaller install; unified lockfile |
| 2026-08-26 | Initial audit; Epic J tasks J1–J8 created; linked from ARCHITECTURE, REFACTORING_BOARD, MARKETPLACE_LAUNCH_ROADMAP |

---

*Update this document when Epic J tasks complete or when build tooling versions change.*

# Build & Dev Performance — Audit & Optimization Guide

**Created**: 2026-08-26  
**Maintainer**: Project owner  
**Status**: Active — baseline for Epic J (Build, DX & Architecture)  
**Audience**: AI agents, contributors, marketplace buyers who fork the template

> **Related**: [ARCHITECTURE.md](ARCHITECTURE.md) · [REFACTORING_BOARD.md](REFACTORING_BOARD.md) § Epic J · [tasks/](tasks/) · [MARKETPLACE_LAUNCH_ROADMAP.md](MARKETPLACE_LAUNCH_ROADMAP.md)

---

## 1. Executive summary

The codebase is **functionally sound** (style epics A–G complete, NestJS modular backend). The main pain point for developers is **slow perceived dev compilation**, caused by configuration and structural choices—not by broken architecture.

| Area | Cold build (measured 2026-08-26) | Root cause of slow *dev* experience |
|------|----------------------------------|-------------------------------------|
| Frontend (`ng build`) | ~14 s | Webpack `browser` builder; single TS project includes admin + storefront; duplicate eager imports in `AppModule` |
| Backend (`nest build`) | ~4–5 s | Scripts delete incremental cache; `npm start` runs full rebuild; `deleteOutDir: true` |

**Marketplace angle**: Buyers who customize admin forms or section builder will hit the slowest rebuild paths. Epic J tasks reduce friction and improve template quality scores (DX, maintainability, forkability).

---

## 2. Frontend build pipeline

### 2.1 Current configuration

| Setting | Value | Impact |
|---------|-------|--------|
| Builder | `@angular-devkit/build-angular:browser` (webpack) | Slower than Angular 17 `application` builder (esbuild) |
| TS scope | `tsconfig.app.json` → `src/**/*.ts` (~217 files) | Admin + storefront compiled together |
| Lazy admin route | `/admin` → `AdminModule` (~1.6 MB chunk) | Route lazy, but module eagerly declares all admin pages |
| Section renderer | Dynamic imports via `section-map.ts` | Good — storefront sections lazy-loaded |
| Global styles | `material-theme.scss` + `admin.scss` + `main.scss` | Full Material + admin theme in every build |
| SSR | Separate `server` target in `angular.json` | Extra build step for production SSR |

### 2.2 Structural bottlenecks

#### Duplicate layout imports in `AppModule`

`HeroComponent`, `CategoriesComponent`, `BestSellersComponent`, etc. are imported in **`app.module.ts`** AND lazy-loaded via **`section-map.ts`**. This inflates `main.js` (~1 MB) and forces the compiler to track both graphs.

**Fix**: Task [004](tasks/task_008_app_module_layout_deduplication.md) — keep layout components only in section-map / feature modules.

#### Storefront → admin coupling

Storefront pages import services from `src/admin/`:

```
src/app/pages/home/home.component.ts       → SectionService from src/admin/services/
src/app/pages/shop/shop.component.ts       → same
src/app/components/product-detail/...      → same
```

**Fix**: Task [006](tasks/task_006_storefront_admin_layer_boundaries.md) — move public API services to `src/app/core/services/` or `src/shared/`.

#### `section-form` (decomposed — J7 ✅)

Formerly a ~1940-line god component; now an orchestration shell (~320 lines TS) with:

- `section-form/shared/` — factory, localization, submit payload, preset, constants
- `section-form/types/` — `header-form`, `footer-form`, `product-carousel-form`, `hero-form`, `section-components-form`

Parent owns `createForm` via factory, submit/preview/preset utilities, and `video-hero` UI (not yet extracted).

Any edit to section admin triggers recompilation of the entire admin module graph.

**Fix**: Task [010](tasks/task_010_section_form_decomposition.md).

#### Duplicate service classes (same name, different files)

| Class | Storefront | Admin |
|-------|-----------|-------|
| `ProductService` | `app/core/services/product.service.ts` | `admin/services/product.service.ts` |
| `AuthService` | `app/core/services/auth.service.ts` | `admin/services/auth.service.ts` |
| + Category, Payment, Message, Notification | both | both |

DI works (different class tokens), but imports are error-prone for buyers and agents.

**Fix**: Task [009](tasks/task_009_consolidate_shared_services_models.md).

### 2.3 Recommended dev commands (frontend)

```bash
# Development — use watch mode (default for ng serve)
npm start
# or explicit:
ng serve

# Production build (includes SSR when using build:prod)
npm run build:prod
```

### 2.4 Target state (Epic J)

| Metric | Baseline | Target |
|--------|----------|--------|
| `ng serve` initial compile | ~30–60 s (typical on buyer hardware) | −30–50% after application builder |
| `ng serve` incremental (storefront-only change) | Rebuilds admin graph | Isolated rebuild with split projects |
| `main.js` size (dev) | ~1 MB | −20% after AppModule dedup |
| Admin chunk | ~1.6 MB monolith | Split by lazy feature routes |

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
cd backend

# ✅ Development — always use this
npm run start:dev

# ✅ Production
npm run start:prod

# ❌ Avoid for daily dev — runs full rebuild every time
npm start
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
3. **Admin-only services** stay in `src/admin/services/` and use distinct names if overlapping (e.g. `AdminProductService`) until consolidation (Task 009).
4. **Never use `!important`** in styles — see [AI_CONSTITUTION.md](AI_CONSTITUTION.md) and `.cursor/rules/no-important.mdc`.

---

## 5. Epic J task index

| Task | Priority | Effort | File |
|------|----------|--------|------|
| J1 — Backend incremental dev scripts | P0 | ~1 h | [task_004](tasks/task_004_backend_dev_scripts_incremental_build.md) |
| J2 — Angular application builder | P0 | ~4–8 h | [task_005](tasks/task_005_angular_application_builder.md) |
| J3 — Storefront/admin layer boundaries | P1 | ~2–4 h | [task_006](tasks/task_006_storefront_admin_layer_boundaries.md) |
| J4 — Admin lazy feature routes | P1 | ~1–2 d | [task_007](tasks/task_007_admin_lazy_feature_routes.md) |
| J5 — AppModule layout deduplication | P1 | ~2–4 h | [task_008](tasks/task_008_app_module_layout_deduplication.md) |
| J6 — Consolidate services & models | P2 | ~2–3 d | [task_009](tasks/task_009_consolidate_shared_services_models.md) |
| J7 — Section form decomposition | P2 | ~3–5 d | [task_010](tasks/task_010_section_form_decomposition.md) |
| J8 — Monorepo / npm workspaces (optional) | P3 | ~1–2 d | [task_011](tasks/task_011_monorepo_workspaces_optional.md) |

Execute in order **J1 → J2 → J3 → J5 → J4 → J6 → J7 → J8** unless blocked.

---

## 6. Verification commands

```bash
# Frontend build
npm run build

# Backend build
cd backend && npm run build

# Measure build time (macOS)
/usr/bin/time -p npm run build
/usr/bin/time -p sh -c 'cd backend && npm run build'

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
| 2026-08-26 | Initial audit; Epic J tasks J1–J8 created; linked from ARCHITECTURE, REFACTORING_BOARD, MARKETPLACE_LAUNCH_ROADMAP |

---

*Update this document when Epic J tasks complete or when build tooling versions change.*

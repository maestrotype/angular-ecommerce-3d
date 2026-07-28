# Project Status

**Last Updated**: 2026-07-28
**Maintainer**: Principal UI Architect

> This document tracks high-level project status. For refactoring task tracking and progress metrics, see **[REFACTORING_BOARD.md](REFACTORING_BOARD.md)** (single source of truth for progress). For architectural decisions, see `STYLE_REFACTOR_PLAN.md`.

---

## Application Status

| Aspect | Status | Notes |
|--------|--------|-------|
| Core Platform | ✅ Operational | Angular 17 + NestJS backend, SSR enabled |
| 3D Product Viewer | ✅ Operational | Three.js with GLB support, meshopt decoder |
| E-commerce Flow | ✅ Operational | Cart, checkout, Stripe payments |
| Admin Panel | ✅ Operational | CRUD for products, orders, users, categories |
| Multi-language | ✅ Operational | EN / RU / UA via @angular/localize |
| Theme System | 🔄 Being Refactored | 4 themes work; token unification in progress |
| AI 3D Generation | 🔬 Experimental | Hunyuan3D, InstantMesh, Unique3D integrated |
| Recommendations | ✅ Operational | Collaborative filtering API |

---

## Style Refactoring Status

> **Full task board with metrics**: [REFACTORING_BOARD.md](REFACTORING_BOARD.md)
> **Baseline audit (2026-07-28)**: code was scanned to establish objective completion metrics. Statuses below reflect the actual code state, superseding earlier optimistic records.

| Epic | Name | Status | Reality Check (2026-07-28) |
|------|------|--------|----------------------------|
| A | Token Foundation | ✅ Complete | A1–A6 done: primitives, semantic, themes, variables, orphan deleted, docs entry = `main.scss` |
| B | Material Overrides Centralization | ✅ Complete | B1–B4 done: overrides central; component `.mat-` = 0; palette↔tokens (MDC bridge). Residual admin-global `.mat-` → C5 |
| C | Admin Unification (ADR-011) | 🔄 In Progress | C1 done: 174 tokens classified (SHARED 125 / CONFLICT 47 / ADMIN-ONLY 2); M2 = 2 017; C2–C6 pending |
| D | Component Migration (ADR-006) | 🔄 Partially Started | 3/86 components fully clean (`favorites`, `base-modal`, `cart-modal`); ~29 partially migrated; 1,336 hardcoded hex remain |
| E | Final Cleanup | ⏳ Pending | 91 `!important` (12 files), 40 `::ng-deep` (12 files), 3 stub files |
| F | Theme Engine v2 (ADR-004/012) | 💡 Planned | ThemeService works (data-theme switching, persistence, 4 themes); TS model not synced with SCSS |
| G | Premium UI / Animations / Polish | 💡 Planned | See `REDESIGN_PLAN.md` Phases 7–9 |

### Current Blockers
- None

### What Verifiably Works Today
- Token scaffold: `src/styles/tokens/` (`_primitive-tokens.scss`, `_semantic-tokens.scss`)
- Themes rewritten to semantic tokens: `_default.scss`, `_dark.scss`, `_glass.scss`
- Imports-only entry point: `src/styles/main.scss` (wired in `angular.json`)
- ThemeService: 4 themes, `data-theme` switching, localStorage persistence, separate admin/storefront selection
- Glass/admin theme regressions fixed (Tasks 008, 015–017, 021, 022)

---

## Backend Status

| Module | Status | Notes |
|--------|--------|-------|
| Authentication | ✅ Complete | JWT + Passport, social auth (Google, GitHub) |
| Products CRUD | ✅ Complete | TypeORM, PostgreSQL |
| Orders | ✅ Complete | Full order lifecycle |
| Payments | ✅ Complete | Stripe integration |
| Categories | ✅ Complete | Tree structure support |
| Users & Roles | ✅ Complete | Admin/user roles |
| Messages | ✅ Complete | Admin messaging |
| Notifications | ✅ Complete | Multi-channel support |
| SEO | ✅ Complete | Meta tags, sitemaps |
| File Upload | ✅ Complete | Local + Cloudinary failover |
| AI Generation | 🔬 Experimental | 3D model generation pipeline |

---

## Known Technical Debt

> Quantified baseline (2026-07-28). Live numbers are tracked in [REFACTORING_BOARD.md §1](REFACTORING_BOARD.md).

### High Priority
- [ ] Parallel `--admin-*` token system: M2 = 2 017; C1 inventory done (SHARED 125 / CONFLICT 47 / ADMIN-ONLY 2) — migrate C2–C6
- [ ] 1,336 hardcoded hex colors in 68 SCSS files outside token/theme sources (Epic D)
- [x] Legacy `_theme-variables.scss` decomposed into theme partials and deleted (A3, 2026-07-28)
- [x] Orphaned `src/styles.scss` deleted — glass helpers → `components/_glass-helpers.scss`, scrollbars → `core/_scrollbars.scss` (A5, 2026-07-28)
- [x] Material overrides Epic B (B1–B4): central overrides + palette↔tokens; residual admin-global `.mat-` → C5

### Medium Priority
- [x] `_primitive-tokens.scss` imported via `tokens/_index.scss` (A1, 2026-07-28)
- [x] `core/_variables.scss` parallel color palette removed — colors → semantic legacy aliases; file keeps SCSS breakpoints + non-color utils (A4, 2026-07-28)
- [ ] 76 `!important` remaining (was 91; −15 via A5 orphan delete); 40 `::ng-deep` in 12 files
- [ ] `admin-global.scss` is 1,195 lines with mixed concerns

### Low Priority
- [ ] Stub files in pipeline: `_forms.scss`, `_modals.scss`, `_navigation.scss` (5 lines each)
- [ ] TS `Theme` interface not synchronized with SCSS tokens (ADR-012)
- [ ] SCSS variables (`$var`) still used alongside CSS custom properties

---

## Recent Changes

| Date | Change | Author |
|------|--------|--------|
| 2026-07-28 | Task C1 (Board): Inventoried all `--admin-*` tokens (174 defined). Classified per ADR-011: SHARED 125, CONFLICT 47, ADMIN-ONLY 2 (+3 proposed layout tokens from hardcodes: sidebar-width 260px, toolbar-height 64px, content-padding 24px). Documented 6 undefined refs and conflict resolution defaults (adopt frontend vs promote semantic). Tables in `UI_AUDIT.md` §4.1; note `docs/migration/_c1-admin-token-inventory.md`. Epic C 1/6. No SCSS code changes. | Principal UI Architect |
| 2026-07-28 | Task B4 (Board): Bound Material palette to design tokens. Added `tokens/_material-palettes.scss` (Sass maps mirroring primitive brand/accent/error hex + `material-color-bridge` mixin remapping MDC/Mat CSS vars → `--interactive-primary` / `--color-accent` / `--interactive-danger`). Rewrote `material-theme.scss` (no stock indigo/pink); dark/dark-glass via `all-component-colors`; `_admin-material-base` reduced to import shim (no duplicate themes). Migration: `docs/migration/_b4-material-theme-tokens.md`. Epic B **4/4 complete**; M8 ~90%. Residual `.mat-`: admin-global/themes → C5. `npm run build` passes. | Principal UI Architect |
| 2026-07-28 | Task B3 (Board): Cleared all `.mat-` / `.mdc-` from admin `*.component.scss` (17 files). Deleted redundant legacy `::ng-deep` Material dumps (already covered by B2). Moved unique host-scoped rules (column widths, subject accent, chips, SEO tabs, confirmation dialog, image-processor, forms) into `_material-overrides.scss` B3 section. Header notification menu kept in component with non-Material selectors (`.notification-menu`). Verified: 0 component matches; `npm run build` passes. Epic B 3/4; M8 ~75%; M4 40→25; M2 2125→2017. Residual `.mat-`: admin-global (C5), themes, scrollbars. | Principal UI Architect |
| 2026-07-28 | Task B2 (Board, Bridge): Migrated `_admin-theme-material.scss` (1 548 lines) → `src/styles/overrides/_material-overrides.scss` on semantic tokens. Added Material bridge tokens (`--input-*`, `--surface-table-*`, `--interactive-primary-rgb`, `--radius-dialog`, …) in `_semantic-tokens.scss`; wired from 4 admin themes + shared dark/glass. Deleted admin dump; import removed from `admin.scss`. Migration note: `docs/migration/_admin-theme-material-migration.md`. Epic B 2/4; M8 ~50%. | Principal UI Architect |
| 2026-07-28 | Task B1 (Board): Created `src/styles/overrides/_material-overrides.scss` (sectioned by Material components: buttons, form fields, selects, tables, dialogs, …) + `overrides/_index.scss`; wired into `main.scss` after component presets. Docs: STYLE_ARCHITECTURE tree/import order/§6.1; AI_CONSTITUTION §2.1; Board M8 + Epic B 1/4. No rule migration yet (B2–B3). | Principal UI Architect |
| 2026-07-28 | Task A6 (Board): Docs synced to code — build entry is `src/styles/main.scss` (imports only; wired in `angular.json`); orphaned `src/styles.scss` removed from docs. Updated folder tree, import order, token pipeline (`_primitive-tokens` + `_semantic-tokens`), and Material-overrides note (Epic B). `AI_CONSTITUTION.md` §2.1 + contract rule #8 + protected files. Epic A = 6/6 complete. | Principal UI Architect |
| 2026-07-28 | Task A5 (Board): Deleted orphaned `src/styles.scss` (499 lines). Ported `.glass-theme` / cart controls / `.theme-price` → `components/_glass-helpers.scss` (tokenized); thin scrollbars + drawer hide → `core/_scrollbars.scss` (no `!important`). Discarded dead blocks already covered elsewhere or unused: `:root` layout aliases, Tailwind `--tw-*` backdrop utility, snackbars (admin-global), section/mat dialog panels (no `panelClass` refs), dark-glass Material overrides, mat-badge-warn, duplicate product-card/view-btn/dropdown glass. Verified: file gone; `npm run build` passes; `!important` 91→76. | Principal UI Architect |
| 2026-07-28 | Task A4 (Board): Removed parallel color palette from `core/_variables.scss` (243→107 lines). Migrated used `--color-*` vars into semantic legacy aliases mapped to semantic/primitive tokens; expanded theme legacy alias sets; converted breakpoints to SCSS `$breakpoint-*` and wired responsive mixins; dropped unused sidenav import; high-contrast overrides now target semantic tokens. Side effect: `--color-primary` no longer hardcodes purple `#667eea` after themes (was clobbering theme aliases due to import order). Verified: 0 `--color-*` / 0 hex color defs in `core/`; `npm run build` passes; bundle has `--color-primary: var(--interactive-primary)`. | Principal UI Architect |
| 2026-07-28 | Task A3 (Board): Decomposed and deleted legacy `_theme-variables.scss` (722 lines). Parsed default/dark/glass blocks; skipped variables already defined in semantic tokens or theme partials (last-declaration-wins); prepended remaining vars into `_default.scss` / `_dark.scss` / `_glass.scss`; removed `@forward` from `tokens/_index.scss`. Verified: `npm run build` passes; computed tokens in dark (`--hero-bg-gradient`, `--header-bg`, `--product-tabs-bg`); visual check home (light/dark/glass) + product detail (dark) — no broken gradients/header/footer. | Principal UI Architect |
| 2026-07-28 | Task A2 (Board): Semantic token layer completed for storefront scope. Audit found 81 token names referenced via `var()` but never defined; ~46 of them used WITHOUT fallbacks — meaning broken declarations at runtime (favorites page surfaces/borders, base-modal backdrop, `--border-primary`/`--interactive-primary` in ALL themes via missing `--color-brand-*`). Added: 8 primitives (`--color-brand-base/light/dark`, `--color-accent-pink`, `--color-slate-600/800-rgb`, `--text-3xl`), ~25 semantic tokens (surfaces, borders subtle/medium/emphasis, `--text-muted`, `--state-danger-*`, `--backdrop-blur/-sm`, `--glass-*-hover`, spacing aliases, auth secondary set) with dark/glass theme overrides mapped from original legacy `--favorites-*` values. Remaining undefined-no-fallback: only out-of-scope (`--tw-*` in orphaned styles.scss → A5; `--admin-*`, `--lg-*` → Epic C). Verified: build passes, browser check of favorites + card hover in all 3 themes, no console errors. | Principal UI Architect |
| 2026-07-28 | Task A1 (Board): `tokens/_index.scss` now imports `_primitive-tokens.scss` instead of duplicating primitives inline. Side effect fixed: tokens defined only in the previously-unimported file (`--color-blue-300/400`, `--color-blue-400-rgb`, `--z-modal`, `--z-*` scale, `--font-normal/medium/semibold/bold`) were unresolved at runtime — dark/glass theme `--text-link`, product-card hover glow, and modal z-indexes silently fell back. Verified: build passes, tokens present in CSS bundle, browser check in all 3 themes (`--color-blue-400` = `#60a5fa`, `--z-modal` = `400`). | Principal UI Architect |
| 2026-07-28 | Documentation overhaul: full code audit performed (hex/`!important`/`::ng-deep`/`--admin-*` counts, token pipeline analysis, ThemeService review). Created `REFACTORING_BOARD.md` as the single source of truth for refactoring progress with measurable metrics (M1–M8) and epic/task breakdown (A–G). Corrected phase statuses that overstated progress (e.g., "Phase 3 Complete" while the 722-line legacy monolith is still forwarded). Updated `UI_AUDIT.md` with real scan data. | Principal UI Architect |
| 2026-07-23 | Header `!important` Cleanup: Removed all remaining `!important` declarations from `header.component.scss` (2 instances in `.hamburger span` inside `:host(.variant-dark)` and `:host(.variant-dark-soft)`). The `:host()` selector provides sufficient specificity without `!important`, following AI_CONSTITUTION.md Rule #3 (FORBIDDEN: `!important` in component styles). Modified: `header.component.scss`. Build passes (6905ms), 0 `!important` remaining. | Principal UI Architect |
| 2026-07-23 | Header Theme Toggle Hover Fix: Unified `.theme-toggle` button styling with other header icons. Root cause: browser default `<button>` styles (background, border, outline) overriding transparent icon appearance. Fix: dedicated `.theme-toggle` block in `.user-actions` with `background:transparent`, `border:none`, `outline:none`, `box-shadow:none`, `-webkit-appearance:none`, unified hover/active transitions matching `.search-icon`, `.cart`, `.favorites`. Modified: `header.component.scss`. Build passes. | Principal UI Architect |
| 2026-07-21 | Product Card Hover & Badge Redesign: Removed harsh blue bottom background on product card hover. Replaced with elegant border-glow (`rgba(96,165,250,0.35)`) + deep box-shadow with subtle blue tint + smooth `translateY(-4px)` lift. Redesigned category badge (SHOES) with semi-transparent background, thin border, increased border-radius (6px), compact padding, smaller font. Mobile hover uses transparent background. Added missing primitive tokens (`--color-blue-300`, `--color-blue-400`, `--color-blue-400-rgb`). Modified: `_cards.scss`, `_dark.scss`, `_primitive-tokens.scss`. | Principal UI Architect |
| 2026-07-21 | Favorites Page Visual Audit: Fixed proportions and styling on favorites page. Reduced header padding, softened CLEAR ALL button, improved category badge contrast, stabilized product name with min-height/line-clamp, refined back button. All changes use semantic tokens (ADR-001 compliant). | Principal UI Architect |
| 2026-07-14 | Task-022: Fixed admin header border regression in dark theme. Added explicit `.admin-header` rule with `background-color: var(--admin-header-bg, #1f2937)` and border to match production appearance. | Principal UI Architect |
| 2026-07-14 | Task-016 (ADR-001): Restored original colorful icons in the glass admin theme. Excluded `.stat-icon` from the global `mat-icon` white color override in `_glass.scss` via `mat-icon:not(.stat-icon)`. Build passes. | Principal UI Architect |
| 2026-07-14 | Task-021 (Regression Fix #2): Fixed admin header border regression across themes. Base `.admin-header` changed to `border-bottom: none`; light theme gets explicit border at 480px+; dark theme has no border; glass retains glass-style border. | Principal UI Architect |
| 2026-07-14 | Task-015 (ADR-001): Fixed stat-cards background in glass admin theme. Root cause: `[data-theme="glass"] & {}` selectors inside components with ViewEncapsulation.Emulated compile to invalid selectors. Solution: `--dashboard-stat-card-*` CSS variables in `_admin-glass.scss` with fallbacks. Anti-pattern documented. Build passes (8188ms). | Principal UI Architect |
| 2026-07-14 | Task-021 (Regression Fix): Fixed admin header visual regression in light theme. Added `--admin-header-bg: #f3f4f6` and `--admin-header-border: #e5e7eb` to `_admin-light.scss`. Build passes. | Principal UI Architect |
| 2026-07-09 | Task-008: Fixed Admin Dashboard Glass regression. Root cause: selector `[data-theme="glass"].is-admin` never matched (`data-theme` on `<html>`, `.is-admin` on `<body>`). Fixed with `html[data-theme="glass"] body.is-admin`. Removed all 16 masking `!important` declarations. Build passes (5893ms). | Principal UI Architect |
| 2026-07-09 | Task-007 (ADR-001): Migrated 3 files to semantic tokens: `_cards.scss`, `_theme-switcher.scss`, `base-modal.component.scss`. Build passes (8388ms). | Principal UI Architect |
| 2026-07-08 | Task-006 (ADR-001): Migrated `favorites.component.scss` to semantic tokens. Zero hardcoded colors remain. Build passes (7619ms). | Principal UI Architect |
| 2026-07-08 | Task-005 (PoC): Migrated `theme-selector.component.scss` to semantic tokens (~40 hardcoded values replaced). Build passes. | Principal UI Architect |
| 2026-07-08 | Task-004: Rewrote `themes/_glass.scss` to semantic tokens with glass-specific overrides. Build passes (6171ms). | Principal UI Architect |
| 2026-07-08 | Task-003: Rewrote `themes/_dark.scss` to semantic tokens with dark-specific overrides. Build passes (5960ms). | Principal UI Architect |
| 2026-07-08 | Task-002: Rewrote `themes/_default.scss` to use semantic tokens from `_semantic-tokens.scss`. Build passes (5689ms). | Principal UI Architect |
| 2026-07-08 | Task-001 (ADR-001): Connected primitive tokens to main styles pipeline. Created `tokens/_index.scss` (~60 CSS custom properties) and `tokens/_semantic-tokens.scss`. Build passes. | Principal UI Architect |
| 2026-07-06 | Style Architecture documentation improved — corrected SCSS inventory, updated token flow | Principal UI Architect |
| 2026-07-05 | Initial UI architecture documentation created | Principal UI Architect |

---

## How to Use This Document

1. **For a high-level overview**: Read this document
2. **For refactoring tasks and progress metrics**: See `REFACTORING_BOARD.md` — single source of truth
3. **For UI architecture decisions**: See `STYLE_REFACTOR_PLAN.md`
4. **For theme engine details**: See `THEME_ENGINE.md`
5. **For audit findings**: See `UI_AUDIT.md`
6. **For AI agent guidelines**: See `AI_CONSTITUTION.md`

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-28*

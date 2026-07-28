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
| A | Token Foundation | 🔄 In Progress | A1–A3 done: primitives single-sourced, semantic layer complete, `_theme-variables.scss` deleted; remaining: `core/_variables.scss`, orphaned `styles.scss`, docs sync |
| B | Material Overrides Centralization | ⏳ Pending | No `_material-overrides.scss`; overrides scattered across 24 files incl. 1,548-line `_admin-theme-material.scss` |
| C | Admin Unification (ADR-011) | ⏳ Pending | Parallel `--admin-*` system fully intact: 2,335 usages in 43 files, 174 unique tokens |
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
- [ ] Parallel `--admin-*` token system: 2,335 usages / 43 files / 174 unique tokens (Epic C)
- [ ] 1,336 hardcoded hex colors in 68 SCSS files outside token/theme sources (Epic D)
- [x] Legacy `_theme-variables.scss` decomposed into theme partials and deleted (A3, 2026-07-28)
- [ ] Orphaned `src/styles.scss` (499 lines of logic, not in build) — docs previously described it as the entry point (Epic A)
- [ ] No centralized Material overrides; `_admin-theme-material.scss` is a 1,548-line de-facto dump (Epic B)

### Medium Priority
- [ ] `_primitive-tokens.scss` exists but is not imported — `_index.scss` duplicates primitives inline (drift risk)
- [ ] `core/_variables.scss` (243 lines) defines a parallel color palette
- [ ] 91 `!important` in 12 files; 40 `::ng-deep` in 12 files
- [ ] `admin-global.scss` is 1,195 lines with mixed concerns

### Low Priority
- [ ] Stub files in pipeline: `_forms.scss`, `_modals.scss`, `_navigation.scss` (5 lines each)
- [ ] TS `Theme` interface not synchronized with SCSS tokens (ADR-012)
- [ ] SCSS variables (`$var`) still used alongside CSS custom properties

---

## Recent Changes

| Date | Change | Author |
|------|--------|--------|
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

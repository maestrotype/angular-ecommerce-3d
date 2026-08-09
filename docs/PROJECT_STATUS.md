# Project Status

**Last Updated**: 2026-08-05
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
| Multi-language | ✅ Operational | EN / RU / UA via @ngx-translate / localize |
| Theme System | ✅ Complete | 4 themes; token pipeline + Theme Engine v2; see `THEME_ENGINE.md` |
| AI 3D Generation | 🔬 Experimental | Hunyuan3D, InstantMesh, Unique3D integrated |
| Recommendations | ✅ Operational | Collaborative filtering API |

---

## Style Refactoring Status

> **Full task board with metrics**: [REFACTORING_BOARD.md](REFACTORING_BOARD.md)
> **Baseline audit (2026-07-28)**: code was scanned to establish objective completion metrics. Statuses below reflect the actual code state, superseding earlier optimistic records.

| Epic | Name | Status | Notes |
|------|------|--------|-------|
| A | Token Foundation | ✅ Complete | A1–A6 |
| B | Material Overrides Centralization | ✅ Complete | B1–B4; admin Material in C5 `global/` |
| C | Admin Unification (ADR-011) | ✅ Complete | C1–C6; M2 = 0 non-layout |
| D | Component Migration (ADR-006) | ✅ Complete | D1–D10; M1 = 0, M5 = 86/86 |
| E | Final Cleanup | ✅ Complete | M3 = 0, M4 = 0 |
| F | Theme Engine v2 (ADR-004/012) | ✅ Complete | F1–F5; `THEME_ENGINE.md` |
| G | Premium UI / Animations / Polish | ✅ Complete | G1–G17; Epic G closed 2026-08-05 |

**Style refactoring: complete (Epics A–G).** All board metrics at 100%.

### Optional follow-up (not blockers)
- Epic G **complete** (G1–G17). Optional: human visual sign-off per `CROSS_THEME_VISUAL_REVIEW.md` + `POLISH_AND_QUALITY.md`.

---

## Section Management & Page Builder Status

> **Full plan**: [SECTIONS_ANALYSIS_AND_ROADMAP.md](../antigravity/SECTIONS_ANALYSIS_AND_ROADMAP.md)  
> **Related**: [MARKETPLACE_LAUNCH_ROADMAP.md](MARKETPLACE_LAUNCH_ROADMAP.md)

### Epic H — Sections & Page Builder Completion

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| H1 | Quick Wins (blockers) | ✅ Complete | confirm() → MatDialog, console.log removed, categories i18n fixed |
| H2 | Section UX (duplicate, dialog, type-lock) | ✅ Complete | Duplicate section, ConfirmationDialog, type lock, property toolbar |
| H3 | New Section Types | ⏳ Pending | testimonials, newsletter, features-grid, faq, stats |
| H4 | Section Presets / Quick Start | ⏳ Pending | Demo presets + 1-click homepage wizard |
| H5 | Page Templates | ⏳ Pending | landing-page, faq-page, collection-page |
| H6 | Home Architecture Fix | ⏳ Pending | Remove duplicate data loading from HomeComponent |
| H7 | Admin UX Polish | ⏳ Pending | type icons, page switcher, empty state, search |

### Current Section Types (14 registered)

`header` · `hero` · `hero-glass` · `best-sellers` · `categories` · `special-offer` · `brands` · `contacts` · `about` · `product-tabs` · `similar-products` · `bought-together` · `html-content` · `footer`

### Missing Section Types (for competitive parity)

`testimonials` 🔴 · `newsletter` 🔴 · `features-grid` 🟡 · `faq` 🟡 · `stats` 🟡 · `blog-posts` 🟢 · `video-hero` 🟢

### Post-C4 lessons (2026-07-29) — do not repeat
1. **`!important` is forbidden** for new/agent work (absolute). Win with CSS variables (`--mdc-*` / `--mat-*`), specificity, or correct layer — never `!important`. Rule: `.cursor/rules/no-important.mdc` + `AI_CONSTITUTION.md`.
2. **CSS custom-property inheritance gotcha:** `--glass-border-soft: var(--border-subtle)` resolves on `:root` to a **computed** light color (`#f1f5f9`); children inherit that resolved value, so theme overrides of `--border-subtle` alone do not update soft borders. **Re-declare** `--glass-border-soft` / `--glass-divider` inside theme scopes (done for admin dark + dark-glass).
3. **MatTooltip white corners:** painting `background` on outer `.mat-mdc-tooltip` (square host) while only `.mdc-tooltip__surface` is rounded → light corners. Outer host/`::before`/panel must stay **transparent**; fill only the surface + `--mdc-plain-tooltip-container-color`.
4. **Icon-button square hover under glass:** Material state-layer + `backdrop-filter` on toolbar breaks circular clipping. Prefer zero state-layer opacity + radial-gradient hover; opaque dark-glass header needs **no** useless `backdrop-filter`.
5. **Notification badge fringe:** avoid `transform: translate(...)` on small rounded badges over dark chrome (GPU white fringe); use absolute `top`/`right` + pill radius + mask.
6. **User-facing “white corners”** were finally identified as **MatTooltip** (e.g. “Go to storefront”), not only badges/icon-buttons — always confirm the exact element from a screenshot with arrows.

### What Verifiably Works Today
- Token scaffold + themes + `main.scss` entry; M1 = 0 hex, M5 = 86/86 components
- Theme Engine v2: `ThemeDefinition` catalog, SCSS source of truth, dev validation, anti-FOUC in `index.html`
- ThemeService: 4 themes, admin/storefront persistence, area sync on navigation
- Global component presets: cards, forms, modals, nav, PDP, checkout, loading, empty states, page transitions, micro-interactions
- C4–C6: admin off SHARED/CONFLICT `--admin-*` (5 layout tokens only); `admin-global.scss` decomposed (C5)
- Epic G complete: premium UI, motion system, cross-theme review docs, a11y polish (skip link, reduced-motion, print)
- Hard ban on new `!important` documented for agents (M3 = 0)

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

> Quantified baseline (2026-07-28). Live numbers in [REFACTORING_BOARD.md §1](REFACTORING_BOARD.md).

### High Priority
- [x] Parallel `--admin-*` unified (C6) — only 5 layout ADMIN-ONLY tokens remain
- [x] 1,336 hardcoded hex colors outside token/theme sources (Epic D — M1 = 0)
- [x] Legacy `_theme-variables.scss` deleted (A3)
- [x] Orphaned `src/styles.scss` deleted (A5)
- [x] Material overrides Epic B (B1–B4)
- [x] `admin-global.scss` decomposed (C5)
- [x] `admin-variables.scss` shim deleted; mixins on semantic (C6)

### Medium Priority
- [x] M3 = 0 `!important` (Epic E)
- [x] M4 = 0 `::ng-deep` (Epic E)
- [x] TS `ThemeDefinition` synced with SCSS (ADR-012) — Epic F

### Low Priority
- [x] Stub files: `_forms.scss`, `_modals.scss`, `_navigation.scss` — deleted (Epic E3)

---

## Recent Changes

| Date | Change | Author |
|------|--------|--------|
| 2026-08-09 | **Epic H1 + H2 complete**: MatDialog delete confirmations (messages/sections/users); categories/brands i18n preserve ru/ua on save; duplicate section action; section type locked in edit mode; property toolbar expanded (padding, text/bg colors). Docs synced. | Implementation Engineer |
| 2026-08-07 | **Section Manager Analysis**: Full audit of admin/sections + admin/pages UI; identified 13 issues (P1–P13); created Epic H (7 phases, H1–H7); added testimonials/newsletter/features-grid/faq/stats to roadmap. See `SECTIONS_ANALYSIS_AND_ROADMAP.md`. | Principal UI Architect |
| 2026-08-05 | **Epic G closed + docs sync**: G12–G17 (checkout, page transitions, micro-interactions, motion docs, cross-theme review, a11y/polish); `REFACTORING_BOARD.md` + `PROJECT_STATUS.md` synced — all epics A–G ✅, metrics at 100%. | Principal UI Architect |
| 2026-08-05 | Epic G12: Checkout tokens (`--checkout-*`), `_checkout.scss` (stepper, summary, payment states); checkout/payment off `getThemeClass`. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G13: Page transition tokens + `_page-transitions.scss`; storefront route enter via `router-outlet`. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G14: Micro-interaction tokens + `_micro-interactions.scss`; wired to cards, buttons, nav, forms, spinner. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G15: Animation system documented — `STYLE_ARCHITECTURE.md` §14, `THEME_ENGINE.md` §7.1. | Implementation Engineer |
| 2026-08-05 | Epic G16: `CROSS_THEME_VISUAL_REVIEW.md`; payment-result + cart-modal migrated; `_payment-result.scss`, `_cart-modal.scss`. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G17: `POLISH_AND_QUALITY.md`; skip link, mobile nav a11y, print styles, `color-scheme`, viewport zoom. Epic G **17/17 complete**. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G7–G11: Forms, navigation, modals, stat cards, PDP polish — global partials + tokens. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G5: Typography scale — `--type-*` semantic tokens (display/h1–h6/body/caption/label); mixins + `.type-*` classes; h1–h6/body/caption/label in `_base.scss`; theme presets (light/dark/glass/dark-glass). Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G4: Premium product cards — `--card-*` tokens, rewritten `_cards.scss` (badges, overlay, rating, list layout, staggered animate-in); `product-card` aligned with shop pattern (Material icons); dark/glass card token hooks. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G3: `app-loading-spinner` + `app-skeleton-loader` (variants: line/block/circle/product-card/list-row); `_loading.scss` with theme-aware shimmer; migrated favorites, orders, similar/bought-together. Build passes. | Implementation Engineer |
| 2026-08-05 | Epic G start: G1 motion tokens (`--motion-*`, semantic `--transition-*`, dark/glass presets, `_motion.scss`); G2 `app-empty-state` + `_empty-states.scss` (favorites, cart, orders). Build passes. | Implementation Engineer |
| 2026-08-05 | Epic F (Board): Theme Engine v2 — slim `ThemeDefinition` catalog synced with SCSS; deleted legacy per-theme TS files; `theme-contract.ts` + `theme-validator.ts` (dev-mode semantic token check); anti-FOUC bootstrap in `index.html` (admin/storefront storage + `is-admin`); rewrote `THEME_ENGINE.md`. Epic F **5/5 complete**. `npm run build` passes. | Implementation Engineer |
| 2026-08-05 | Epic E (Board): Removed all `!important` and `::ng-deep`; admin-dark Material rules → `_material-overrides`; list-container `ViewEncapsulation.None`; CDK drag styles → `global/_drag-drop.scss`; glass PDP overrides → `product-info`; deleted stub SCSS files. M3 = **0**; M4 = **0**. Epic E **4/4 complete**. `npm run build` passes. | Implementation Engineer |
| 2026-08-05 | Task D10 (Board): Cleared remaining 148 hex in 13 global/admin SCSS files; atmosphere gradients promoted to `--admin-atmosphere-gradient` in admin theme files; removed hex fallbacks from `var()`. M1 = **0**; M5 = **86/86**. Epic D **10/10 complete**. `npm run build` passes. | Implementation Engineer |
| 2026-07-29 | Task C6 (Board): Deleted `admin-variables.scss` shim; remapped residual consumers; rewrote `admin-mixins` on semantic; extracted `_admin-root-defaults.scss` (dashboard/MDC defaults). M2 = **0 non-layout** (5 layout tokens kept). Admin theme files kept for chrome/promotions. Note: `docs/migration/_c6-admin-variables-shim-removal.md`. Epic C **6/6**. `npm run build` passes. | Implementation Engineer |
| 2026-07-29 | Glass balance: lighter chrome (header/sidebar ~0.36 airy blue); darker content blocks (`--surface-card`/`elevated`/stat cards navy glass). Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Glass chrome lighten: restore prod medium steel-blue `rgba(25,60,105,.5)` (was over-dark .78 charcoal). Header≡sidebar kept. Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Glass polish: denser chrome + lower blur saturate so header≡sidebar (was electric blue over content); chart axis ticks theme-aware (white on glass/dark); chart cards use `--surface-card` not chrome. Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Admin light-glass liquid rewrite: removed `isolation`/`translateZ` on chrome (was killing backdrop-filter → flat solid blue); single paint layer (transparent mat-drawer shell + `.sidenav-wrapper` / toolbar gradient); chrome tokens `--surface-chrome*` / `--chrome-blur`; softer prod-like body atmosphere; header≡sidebar; cards use dashboard glass tokens. Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Glass chrome unify: local was too pale (`--surface-header` frosted). Restored prod sidebar etalon `rgba(25,60,105,.5)` as `--surface-secondary` and aliased `--surface-header` to it so header ≡ sidebar (also fixes prod mismatch). Applied across admin-glass, sidenav/header, chrome, material-overrides, storefront glass admin toolbar. Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Post-C5 glass chrome fix: admin light-glass sidebar/header were reading too blue — storefront `_glass.scss` forced `rgba(0,0,0,.3)` on admin toolbar (high specificity) and sidenav/chrome still painted deep navy `--surface-secondary`. Restored frosted `--surface-header` on header + sidenav + mat-drawer; bound `--mat-toolbar-container-*` in `_admin-glass`. Epic C still **5/6**. | Implementation Engineer |
| 2026-07-29 | Task C5 (Board): Decomposed `admin-global.scss` (~1239 → 16-line orchestrator) into `src/admin/styles/global/` (11 partials). Removed all `!important` from that path (body overflow + snackbar via doubled selectors / MDC tokens). `admin-mixins` documented for C6 semantic cutover; `admin-variables` shim kept. Note: `docs/migration/_c5-admin-global-decomposition.md`. Epic C **5/6**; M3 87→**72** (12 files). `npm run build` passes. | Implementation Engineer |
| 2026-07-29 | Post-C4 admin visual polish (dark / dark-glass): fixed MatTooltip white corners (transparent host; surface-only fill + `--mdc-plain-tooltip-*`); re-bound `--glass-border-soft` in admin dark themes (inheritance gotcha); header/sidenav borders → `--border-default`; notification-badge without transform fringe; icon-button hover via MDC vars + radial (no new `!important`); dark-glass header `backdrop-filter: none`; scrollbar soft thumbs; table row outline via Material tokens. Policy: `.cursor/rules/no-important.mdc` + constitution/docs. Epic C still **4/6** (polish only; C5 not started). M2 ≈ 463; M3 ≈ 87. | Implementation Engineer |
| 2026-07-28 | Task C4 (Board): Migrated all admin component `--admin-*` consumers to semantic/primitive (batches + remap helper `scripts/c4-remap-admin-tokens.cjs`); also cleared storefront strays + Material overrides TODO Epic C fallbacks. Layout ADMIN-ONLY tokens kept. Note: `docs/migration/_c4-admin-component-token-migration.md`. Epic C 4/6; M2 ≈ 467; non-layout `--admin-*` in components = 0. Visual: admin login OK. `npm run build` passes. | Implementation Engineer |
| 2026-07-28 | Task C3 (Board): SHARED/CONFLICT reconciliation — `admin-variables.scss` is semantic/primitive alias shim; admin themes set semantic (+ layout) only under `body.is-admin`; glass recipes promoted (`--glass-surface-*`, `--surface-card-gradient`/`--surface-glow`); reverse B2 bridge removed; storefront `_glass.scss` `--admin-*` leftovers deleted; UNDEFINED (6) aliased. Note: `docs/migration/_c3-admin-token-reconciliation.md`. Epic C 3/6; M2 = 1 623; defined `--admin-*` ≈ 180. `npm run build` passes. | Principal UI Architect |
| 2026-07-28 | Task C2 (Board): Created `src/admin/styles/_admin-layout-tokens.scss` with 5 ADMIN-ONLY structural tokens (`--admin-sidebar-width`, `--admin-toolbar-height`, `--admin-content-padding`, mobile paddings). Wired in `admin.scss`; relocated mobile paddings out of `admin-variables.scss`; replaced hardcodes in `admin-layout.component.scss` and glass `--mat-toolbar-*-height`. Epic C 2/6; M2 = 2 025; defined `--admin-*` = 177. `npm run build` passes. | Principal UI Architect |
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

*This document is maintained by the Principal UI Architect. Last updated: 2026-08-07*

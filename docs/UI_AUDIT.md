# UI Audit — angular-ecommerce-3d

This document records **current-state findings** of the style system audit. Task tracking lives in [REFACTORING_BOARD.md](REFACTORING_BOARD.md) — do not duplicate task statuses here.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-29
**Audit Status**: Full codebase scan completed 2026-07-28 (baseline); post-C4 visual polish + policy notes 2026-07-29

---

## 1. SCSS File Inventory

### 1.1 Global Styles (`src/styles/`, ~4,089 lines total)

| File | Lines | Purpose | Status | Notes |
|------|------:|---------|--------|-------|
| `src/styles/main.scss` | 19 | Master import file | KEEP | **Actual build entry** (wired in `angular.json`); imports only ✅ |
| `src/styles/tokens/_index.scss` | ~12 | Token pipeline entry | KEEP | ✅ RESOLVED (A1+A3): imports primitives + semantic; `@forward` legacy removed |
| `src/styles/tokens/_primitive-tokens.scss` | 106 | Primitive tokens (single source) | KEEP | ✅ RESOLVED (A1, 2026-07-28): now wired into the pipeline |
| `src/styles/tokens/_semantic-tokens.scss` | ~145 | Semantic tokens | KEEP | ✅ RESOLVED (A2, 2026-07-28): full storefront coverage; remaining undefined-no-fallback: `--admin-*`/`--lg-*` (Epic C) |
| ~~`src/styles/tokens/_theme-variables.scss`~~ | ~~722~~ | Legacy CSS variable monolith | DELETE | ✅ DELETED (A3, 2026-07-28): content moved into `themes/_default/_dark/_glass.scss` |
| `src/styles/themes/_index.scss` | 89 | Theme re-export | FIX | Contains product-detail CSS vars with hex (logic in an index file) |
| `src/styles/themes/_default.scss` | 119 | Default/light theme | KEEP | Rewritten to semantic tokens ✅ |
| `src/styles/themes/_dark.scss` | 374 | Dark theme | KEEP | Rewritten to semantic tokens ✅ |
| `src/styles/themes/_glass.scss` | 481 | Glass theme | KEEP | Rewritten ✅; admin header uses `--surface-header` (not black overlay); 4 `!important` remain |
| `src/styles/core/_variables.scss` | 107 | SCSS breakpoints + non-color utils | KEEP | ✅ RESOLVED (A4, 2026-07-28): parallel color palette removed; colors → semantic legacy aliases |
| `src/styles/core/_mixins.scss` | 318 | Mixins | KEEP | Audit for unused mixins in Epic E |
| `src/styles/core/_base.scss` | 231 | Base element styles | FIX | 7 `!important` |
| `src/styles/core/_typography.scss` | 202 | Typography | KEEP | |
| `src/styles/core/_utilities.scss` | 307 | Utilities | KEEP | |
| `src/styles/core/_scrollbars.scss` | ~40 | Global thin scrollbars | KEEP | ✅ Added (A5, 2026-07-28); no `!important` |
| `src/styles/components/_buttons.scss` | 356 | Button presets | KEEP | |
| `src/styles/components/_cards.scss` | 242 | Card presets | KEEP | Migrated to semantic tokens ✅ |
| `src/styles/components/_theme-switcher.scss` | 86 | Theme switcher | KEEP | Migrated ✅ |
| `src/styles/components/_glass-helpers.scss` | ~90 | `.glass-theme` utility + cart controls | KEEP | ✅ Added (A5, 2026-07-28); tokenized |
| `src/styles/components/_forms.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| `src/styles/components/_modals.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| `src/styles/components/_navigation.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| ~~`src/styles.scss`~~ | ~~499~~ | Orphaned catch-all | DELETE | ✅ DELETED (A5, 2026-07-28): glass → `_glass-helpers`, scrollbars → `_scrollbars`; dead dialog/snackbar/tw/admin blocks discarded |

### 1.2 Admin Styles (`src/admin/styles/`, ~4,032 lines)

| File | Lines | Purpose | Status | Notes |
|------|------:|---------|--------|-------|
| `admin.scss` | ~50 | Admin entry | KEEP | layout tokens + root defaults + themes + global |
| ~~`admin-variables.scss`~~ | ~~224~~ | ~~`--admin-*` shim~~ | ✅ DELETED (C6) | See `_admin-root-defaults.scss` |
| `_admin-root-defaults.scss` | ~55 | Dashboard/MDC root defaults | KEEP | C6 (ex-shim leftovers) |
| `_admin-layout-tokens.scss` | ~18 | 5 ADMIN-ONLY layout tokens | KEEP | C2 / ADR-011 |
| `admin-mixins.scss` | ~280 | Admin mixins | ✅ C6 | Semantic tokens only |
| `admin-global.scss` | **16** | Import orchestrator | ✅ C5 | Partials in `global/` (11 files); 0 `!important` |
| `global/_*.scss` | ~1 226 | Admin global modules | ✅ C5/C6 | On semantic; layout tokens only where needed |
| `_admin-material-base.scss` | shim | Material base | ✅ B4 | Themes live in `material-theme.scss` |
| ~~`_admin-theme-material.scss`~~ | ~~1,548~~ | ~~De-facto Material override dump~~ | ✅ DELETED (B2) | Migrated → `src/styles/overrides/_material-overrides.scss` |
| `_admin-light.scss` | ~40 | Admin light chrome (`body.is-admin`) | KEEP | C3 semantic + C6 (shim gone) |
| `_admin-dark.scss` | ~130 | Admin dark chrome + Material depth | KEEP | C3 adopt frontend |
| `_admin-glass.scss` | ~150 | Admin glass semantic promotions | KEEP | liquid glass; header≡sidebar |
| `_admin-dark-glass.scss` | ~120 | Admin dark-glass semantic promotions | KEEP | admin-only theme on semantic |

### 1.3 Component Styles

| Scope | `.component.scss` files |
|-------|------------------------:|
| `src/app` (storefront) | 46 |
| `src/admin` | 40 |
| **Total** | **86** |

Migration state (scan 2026-07-28):

| Bucket | App (46) | Admin (40) | All (86) |
|--------|---------:|-----------:|---------:|
| Uses semantic-ish tokens | 35 (76%) | ~40 (100% layout-or-semantic) | ~75 |
| Still contains hex | 36 (78%) | 25 (63%) | 61 (71%) |
| Uses `--admin-*` (non-layout) | **0** | **0** | **0** |
| Uses layout `--admin-*` only | 0 | 3 | 3 |
| **Fully clean (semantic only, no hex)** | **3** | **0** | **3** |

Fully clean components: `favorites`, `base-modal`, `cart-modal`.

---

## 2. Duplicate CSS Variable Definitions

| Duplication | Locations | Resolution |
|-------------|-----------|------------|
| ~~Primitive tokens defined twice~~ | ~~`tokens/_primitive-tokens.scss` AND inlined in `tokens/_index.scss`~~ | ✅ RESOLVED (A1, 2026-07-28): `_index.scss` imports the file; inline copies deleted |
| Color palette defined in parallel | ~~`tokens/` vs TS `light-theme.ts`~~ → resolved: `theme-definitions.ts` preview only; SCSS owns values (Epic F1) |
| ~~Theme variables monolith~~ | ~~`tokens/_theme-variables.scss`~~ | ✅ Done (A3): deleted, themes absorb leftover vars |
| `--admin-*` system | ~180 defined / **~463** usages (M2); C4–C5 path; shim until C6 | ✅ C5 (2026-07-29); residual **C6** — see §4.1 |

---

## 3. Hardcoded Colors

Scan 2026-07-28, pattern `#[0-9a-fA-F]{3,8}`:

| Scope | Files | Occurrences |
|-------|------:|------------:|
| All SCSS under `src/` | 78 | 1,930 |
| **Excluding token/theme sources** (violations to fix) | **68** | **1,336** |

Top offenders (excluding token/theme files):

| Hex count | File | Board task |
|----------:|------|------------|
| 91 | `src/app/pages/shop/shop.component.scss` | D1 |
| 74 | `src/app/pages/payment/payment.component.scss` | D2 |
| 61 | `.../bought-together.component.scss` | D3 |
| 56 | `src/app/pages/checkout/checkout.component.scss` | D2 |
| 54 | `.../similar-products.component.scss` | D3 |
| 52 | `.../order-details-dialog.component.scss` | D2 |
| 51 | `src/app/layout/header/header.component.scss` | D4 |
| ~~46~~ | ~~`src/styles/core/_variables.scss`~~ | ✅ A4 (0 hex) |
| 45 | `src/app/pages/home/home.component.scss` | D1 |
| ~~32~~ | ~~`src/styles.scss` (orphaned)~~ | ✅ A5 (deleted) |

---

## 4. Admin Style Isolation

### Current Architecture (confirmed by scan)
```
src/styles/              ← Frontend tokens + themes (canonical SoT)
src/admin/styles/        ← C6: no shim; layout ADMIN-ONLY + themes + global on semantic
```

`_admin-layout-tokens.scss` (ADR-011) — 5 ADMIN-ONLY structural tokens.  
C3–C6: admin themes map **semantic + layout** only; `admin-variables.scss` **deleted** (C6).  
C4: **0** non-layout `--admin-*` in components.  
C5: `admin-global.scss` → thin orchestrator + [`global/`](../src/admin/styles/global/).  
C6: mixins + residual global on semantic; defaults in [`_admin-root-defaults.scss`](../src/admin/styles/_admin-root-defaults.scss). See [`_c6-admin-variables-shim-removal.md`](migration/_c6-admin-variables-shim-removal.md).

### Target Architecture
```
src/styles/tokens/                        ← Shared tokens (single source)
src/styles/themes/                        ← Shared themes (single source)
src/admin/styles/_admin-layout-tokens.scss ← Admin LAYOUT only (sidebar, toolbar, content padding)
```

### Divergence Map

| Concern | Frontend Location | Admin Location | Duplicated? |
|---------|------------------|----------------|-------------|
| Color tokens | `tokens/` | `_admin-root-defaults` (non-color helpers only) | ✅ C6 — no `--admin-*` color aliases |
| Light theme | `_default.scss` | `_admin-light.scss` (chrome only) | ✅ C3 semantic |
| Dark theme | `_dark.scss` | `_admin-dark.scss` (chrome + Material depth) | ✅ C3 adopt frontend |
| Glass theme | `_glass.scss` | `_admin-glass.scss` (liquid chrome + promotions) | ✅ liquid glass; header≡sidebar via `--surface-chrome` |
| Dark glass | — (no storefront file) | `_admin-dark-glass.scss` | ADMIN-ONLY theme on semantic |
| Material overrides | `overrides/_material-overrides.scss` (B1–B4) | `admin/styles/global/*` (C5) + themes | ✅ glass chrome denser/desaturated; header≡sidebar |
| Layout styles | N/A | `admin-layout.component.scss` + `_admin-layout-tokens.scss` | NO; C2 tokens wired |

### 4.1 C1–C4 — `--admin-*` token classification & reconciliation (ADR-011)

**Scan / C1:** 2026-07-28. **C3 reconciliation:** 2026-07-28. **C4 component migration:** 2026-07-28.  
Notes: [`_c1-admin-token-inventory.md`](migration/_c1-admin-token-inventory.md), [`_c3-admin-token-reconciliation.md`](migration/_c3-admin-token-reconciliation.md), [`_c4-admin-component-token-migration.md`](migration/_c4-admin-component-token-migration.md).

| Class | Count | Meaning | Status |
|-------|------:|---------|--------|
| SHARED | 125 | Same concept as shared tokens | ✅ C3 shim; ✅ C4 components use semantic |
| CONFLICT | 47 | Same concept, different values | ✅ C3 adopt/promote; ✅ C4 consumers migrated |
| ADMIN-ONLY | **5** | Layout-only in `_admin-layout-tokens.scss` (C2) | ✅ done |
| **Total defined** | **5** | Layout ADMIN-ONLY only (C6) | ✅ |
| UNDEFINED (used, no def) | **0** | Were 6 — aliased in C3; shim removed C6 | ✅ |

#### ADMIN-ONLY (C2 — `_admin-layout-tokens.scss`)

| Token | Value | Consumers |
|-------|-------|-----------|
| `--admin-sidebar-width` | `260px` | `.admin-sidenav` |
| `--admin-toolbar-height` | `64px` | glass `--mat-toolbar-*-height` |
| `--admin-content-padding` | `24px` | `.admin-main` |
| `--admin-mobile-padding-horizontal` | `8px` | list-container, category-list |
| `--admin-mobile-padding-vertical` | `22px` | list-container |

#### CONFLICT (47) — resolved in C3

| Resolution | Tokens |
|------------|--------|
| Adopt frontend semantic | primary/hover/rgb, success/warning/error/info, bg-*, text-*, border-*, shadow-sm…xl, z-* (7) |
| Intent → `--color-accent-pink` | `--admin-secondary` |
| Simplify → `--interactive-button` | `--admin-button` |
| Promote `--surface-card-gradient` / `--surface-glow` | `--admin-card-gradient`, `--admin-surface-glow` |
| Promote `--glass-surface-*` / `--glass-border-*` / `--glass-shadow*` | `--admin-glass-*` (10) |
| Deleted (unused) | `--admin-neon-primary`, `--admin-neon-secondary` |

Full per-token table from C1 remains in [`_c1-admin-token-inventory.md`](migration/_c1-admin-token-inventory.md); values now resolve through semantic aliases.

#### SHARED (125) — ✅ C4–C6: consumers use semantic directly; shim removed

Spacing, radius, font, motion, breakpoints, submit/cancel, tab, text helpers, input, table/select, order aliases, order status, surfaces misc, muted/back/avatar buttons, header chrome, palette variants, accent — mapped to shared semantic tokens (see C1 inventory for historical `--admin-*` names).

#### UNDEFINED (6) — fixed in C3

| Token | Fix |
|-------|-----|
| `--admin-font-weight-semibold` | → `--font-semibold` |
| `--admin-accent-primary` | → `--color-accent` |
| `--admin-status-success` | → `--color-success` |
| `--admin-warn` | → `--color-warning` |
| `--admin-bg-card-rgb` | → `--surface-elevated-rgb` |
| `--admin-text-disabled-rgb` | → `--text-muted-rgb` |

---

## 5. `!important` Usage

**Total: 72 occurrences in 12 files** (C5: −15 from admin-global snackbar/overflow; ban on *new* — `.cursor/rules/no-important.mdc`):

| Count | File |
|------:|------|
| 20 | `src/app/layout/hero/hero.component.scss` |
| 14 | `src/admin/styles/_admin-dark.scss` (Material depth; → E / C6) |
| 10 | `.../sidenav/sidenav.component.scss` |
| 9 | `.../admin-section-preview.component.scss` |
| 7 | `src/styles/core/_base.scss` |
| 4 | `src/styles/themes/_glass.scss` |
| 2 | `src/styles/overrides/_material-overrides.scss` |
| 2 | `.../section-list.component.scss` |
| 1 each | scrollbars, product-detail, product-form, admin-login |

~~`admin-global.scss` / `global/*`~~ ✅ C5: **0** `!important`

---

## 6. `::ng-deep` Usage

**Total: 40 occurrences in 12 files**, almost all admin:

| Count | File |
|------:|------|
| 9 | `.../message-list.component.scss` |
| 9 | `.../order-list.component.scss` |
| 5 | `.../list-container.component.scss` |
| 5 | `.../section-list.component.scss` |
| 3 | `.../category-list.component.scss` |
| 2 each | `image-processor`, `user-list` |
| 1 each | `product-detail` (app), `seo-settings`, `message-detail`, `product-form`, `seo` |

---

## 7. Inconsistent Spacing Values

Not separately scanned; resolved per-component during Epic D migration (spacing values → `--spacing-*` tokens as part of the per-component checklist).

---

## 8. Angular Material Overrides

**Central file active** (`src/styles/overrides/_material-overrides.scss`, B1–B3) — admin dump + component scatter migrated. Residual `.mat-` outside overrides (scan 2026-07-28 post-B3):

| Metric | Value |
|--------|-------|
| Admin `*.component.scss` with `.mat-` | **0** |
| Central overrides | `src/styles/overrides/_material-overrides.scss` (~1 950 lines) |
| Residual files | `admin/styles/global/*` (C5), `_admin-dark.scss` (6), `_glass.scss` (5), `_admin-dark-glass.scss` (3), `_dark.scss` (2), `_scrollbars.scss` (2) |

Resolution: Epic B ✅ (B1–B4). Admin global Material → C5 modularized (`global/`).

---

## 9. Potentially Unused / Orphaned Files

| File | Finding | Action |
|------|---------|--------|
| ~~`src/styles.scss`~~ | ✅ DELETED (A5, 2026-07-28) — glass helpers + scrollbars ported to modules; dead blocks discarded | Done |
| `src/styles/tokens/_primitive-tokens.scss` | ✅ RESOLVED (A1, 2026-07-28) — wired into pipeline; was causing unresolved `--color-blue-*`, `--z-modal`, `--font-*` weights in dark/glass themes | Done |
| `src/styles/components/_forms.scss`, `_modals.scss`, `_navigation.scss` | Stubs (5 lines, "will be implemented here") | Implement or remove → Task E3 |
| ~~`src/admin/styles/_admin-theme-material.scss`~~ | ✅ DELETED (B2) — migrated to `overrides/_material-overrides.scss` | Done |

---

## 10. Theme Engine (TypeScript) Findings

Location: `src/app/core/themes/`

| File | Lines | Role |
|------|------:|------|
| `theme.model.ts` | 213 | `Theme`, `ThemeColors`, `ThemeLayout`, `ThemeComponents` |
| `theme-config.ts` | 13 | Registry |
| `theme.service.ts` | 176 | Switching + admin/storefront area sync |
| `themes/*.ts` | 191–204 each | `light`, `dark`, `glass`, `dark-glass` |

Key findings:
- Switching works via `data-theme` attribute on `<html>` and `<body>`; area detection via `body.is-admin`; persistence in localStorage (`selected-theme`, `selected-theme-admin`).
- Storefront exposes 3 themes (`dark-glass` filtered out); admin exposes all 4.
- **The TS theme catalog mirrors SCSS** — `ThemeService` sets `data-theme` only; visuals from SCSS `[data-theme]` blocks. Synced in Epic F (ADR-012).

---

## 11. Documented Anti-Patterns (learned from regressions)

| Anti-pattern | Why it fails | Correct approach |
|--------------|--------------|------------------|
| `[data-theme="glass"] & {}` inside component SCSS with `ViewEncapsulation.Emulated` | Compiles to selectors that never match | Theme-specific CSS variables defined in theme files, consumed via `var(--x, fallback)` in component (see Task-015) |
| `[data-theme="glass"].is-admin` compound selector | `data-theme` is on `<html>`, `.is-admin` on `<body>` — never matches | `html[data-theme="glass"] body.is-admin` (see Task-008) |
| `!important` to force theme overrides | Masks broken selectors instead of fixing them | Fix selector specificity; 16 masking `!important` were removed in Task-008 |

---

## How to Use This Document

1. **Findings live here**; **task statuses live in [REFACTORING_BOARD.md](REFACTORING_BOARD.md)**.
2. When a scan finding is fully resolved, mark the row RESOLVED with a date — keep the baseline number for history.
3. When discovering a new issue: document it here, add a task to the board, do NOT fix outside your current task scope.

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-28*

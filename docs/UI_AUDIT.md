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
| `src/styles/themes/_glass.scss` | 481 | Glass theme | KEEP | Rewritten ✅; 4 `!important` + 5 `.mat-` overrides remain |
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
| `admin.scss` | 49 | Admin entry | KEEP | Import orchestrator + CDK overlay |
| `material-theme.scss` | ~45 | Material theme + token bridge | ✅ B4 | Palettes + MDC CSS → semantic tokens |
| `admin-variables.scss` | 224 | `--admin-*` → semantic aliases (C3 shim) | DELETE after C6 | C4 consumers migrated; shim kept for global/mixins |
| `_admin-layout-tokens.scss` | ~40 | 5 ADMIN-ONLY layout tokens | KEEP | C2 / ADR-011 |
| `admin-mixins.scss` | 274 | Admin mixins | INVESTIGATE | Overlap with core mixins |
| `admin-global.scss` | 1,195 | Admin global styles | DECOMPOSE | 76 `.mat-` lines, 14 `!important` → Task C5 |
| `_admin-material-base.scss` | shim | Material base | ✅ B4 | Themes live in `material-theme.scss` |
| ~~`_admin-theme-material.scss`~~ | ~~1,548~~ | ~~De-facto Material override dump~~ | ✅ DELETED (B2) | Migrated → `src/styles/overrides/_material-overrides.scss` |
| `_admin-light.scss` | ~40 | Admin light chrome (`body.is-admin`) | MIGRATE → DELETE (C6) | ✅ C3: semantic only |
| `_admin-dark.scss` | ~130 | Admin dark chrome + Material depth | MIGRATE → DELETE (C6) | ✅ C3: adopt frontend; card glow promoted |
| `_admin-glass.scss` | ~150 | Admin glass semantic promotions | MIGRATE → DELETE (C6) | ✅ C3: recipes → `--glass-*` / surfaces |
| `_admin-dark-glass.scss` | ~120 | Admin dark-glass semantic promotions | MIGRATE → DELETE (C6) | ✅ C3: admin-only theme on semantic |

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
| Color palette defined in parallel | `tokens/` vs TS `light-theme.ts` (SCSS `core/_variables` palette removed in A4) | Task F1 |
| ~~Theme variables monolith~~ | ~~`tokens/_theme-variables.scss`~~ | ✅ Done (A3): deleted, themes absorb leftover vars |
| `--admin-*` system | ~180 defined / **~467** usages (M2); C4: components clean; C2: 5 ADMIN-ONLY layout; shim in `admin-variables` | ✅ C4 (2026-07-28); residual C5–C6 — see §4.1 |

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
src/admin/styles/        ← C4: components on semantic; layout in C2; shim until C6; global → C5
```

`_admin-layout-tokens.scss` (ADR-011) **exists** (C2) — 5 ADMIN-ONLY structural tokens.  
C3: admin themes map **semantic + layout** only; `admin-variables.scss` is a compatibility shim until C6.  
C4: **0** non-layout `--admin-*` in components (see [`_c4-admin-component-token-migration.md`](migration/_c4-admin-component-token-migration.md)).

### Target Architecture
```
src/styles/tokens/                        ← Shared tokens (single source)
src/styles/themes/                        ← Shared themes (single source)
src/admin/styles/_admin-layout-tokens.scss ← Admin LAYOUT only (sidebar, toolbar, content padding)
```

### Divergence Map

| Concern | Frontend Location | Admin Location | Duplicated? |
|---------|------------------|----------------|-------------|
| Color tokens | `tokens/` | `admin-variables.scss` (aliases → semantic) | SHIM (C3); delete C6 |
| Light theme | `_default.scss` | `_admin-light.scss` (chrome only) | ✅ C3 semantic |
| Dark theme | `_dark.scss` | `_admin-dark.scss` (chrome + Material depth) | ✅ C3 adopt frontend |
| Glass theme | `_glass.scss` | `_admin-glass.scss` (promotions on `body.is-admin`) | ✅ C3 promoted |
| Dark glass | — (no storefront file) | `_admin-dark-glass.scss` | ADMIN-ONLY theme on semantic |
| Material overrides | `overrides/_material-overrides.scss` (B1–B4) | admin-global / themes → C5 | PARTIAL (C5) |
| Layout styles | N/A | `admin-layout.component.scss` + `_admin-layout-tokens.scss` | NO; C2 tokens wired |

### 4.1 C1–C4 — `--admin-*` token classification & reconciliation (ADR-011)

**Scan / C1:** 2026-07-28. **C3 reconciliation:** 2026-07-28. **C4 component migration:** 2026-07-28.  
Notes: [`_c1-admin-token-inventory.md`](migration/_c1-admin-token-inventory.md), [`_c3-admin-token-reconciliation.md`](migration/_c3-admin-token-reconciliation.md), [`_c4-admin-component-token-migration.md`](migration/_c4-admin-component-token-migration.md).

| Class | Count | Meaning | Status |
|-------|------:|---------|--------|
| SHARED | 125 | Same concept as shared tokens | ✅ C3 shim; ✅ C4 components use semantic |
| CONFLICT | 47 | Same concept, different values | ✅ C3 adopt/promote; ✅ C4 consumers migrated |
| ADMIN-ONLY | **5** | Layout-only in `_admin-layout-tokens.scss` (C2) | ✅ done |
| **Total defined** | **~180** | +UNDEFINED aliases; −unused neon | shim until C6 |
| UNDEFINED (used, no def) | **0** | Were 6 — aliased in C3 | ✅ |

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

#### SHARED (125) — ✅ C4 components use semantic directly; shim remains for global/mixins until C6

Spacing, radius, font, motion, breakpoints, submit/cancel, tab, text helpers, input, table/select, order aliases, order status, surfaces misc, muted/back/avatar buttons, header chrome, palette variants, accent — all map via `admin-variables.scss` → shared tokens (see C1 inventory for names).

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

**Total: 76 occurrences** (was 91; −15 from orphaned `styles.scss` deleted in A5, 2026-07-28):

| Count | File |
|------:|------|
| 20 | `src/app/layout/hero/hero.component.scss` |
| 14 | `src/admin/styles/admin-global.scss` |
| 14 | `src/admin/styles/_admin-dark.scss` (Material depth; → C5) |
| ~~13~~ | ~~`src/styles.scss` (orphaned)~~ ✅ A5 deleted |
| 12 | `.../admin-section-preview.component.scss` |
| 7 | `src/styles/core/_base.scss` |
| 4 | `src/styles/themes/_glass.scss` |
| 7 | 5 other files (≤2 each) |

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
| Residual files | `admin-global.scss` (76), `_admin-dark.scss` (6), `_glass.scss` (5), `_admin-dark-glass.scss` (3), `_dark.scss` (2), `_scrollbars.scss` (2) |

Resolution: Epic B ✅ (B1–B4). Residual admin-global → C5.

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
- **The TS theme objects are metadata catalogs** — `theme.service.ts` does not apply `colors`/`layout`/`components` values to the DOM. All visuals come from SCSS `[data-theme]` blocks. TS ↔ SCSS ↔ docs are out of sync → ADR-012, Epic F.

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

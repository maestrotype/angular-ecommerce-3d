# UI Audit — angular-ecommerce-3d

This document records **current-state findings** of the style system audit. Task tracking lives in [REFACTORING_BOARD.md](REFACTORING_BOARD.md) — do not duplicate task statuses here.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-28
**Audit Status**: Full codebase scan completed 2026-07-28 (baseline established)

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
| `admin-variables.scss` | 224 | `--admin-*` definitions (120 unique) | DELETE after C | Parallel token system → Epic C |
| `admin-mixins.scss` | 274 | Admin mixins | INVESTIGATE | Overlap with core mixins |
| `admin-global.scss` | 1,195 | Admin global styles | DECOMPOSE | 76 `.mat-` lines, 14 `!important` → Task C5 |
| `_admin-material-base.scss` | shim | Material base | ✅ B4 | Themes live in `material-theme.scss` |
| ~~`_admin-theme-material.scss`~~ | ~~1,548~~ | ~~De-facto Material override dump~~ | ✅ DELETED (B2) | Migrated → `src/styles/overrides/_material-overrides.scss` |
| `_admin-light.scss` | 95 | Admin light theme | MIGRATE → DELETE | Remounts `--admin-*` per theme → Task C3 |
| `_admin-dark.scss` | 212 | Admin dark theme | MIGRATE → DELETE | 14 `!important` → Task C3 |
| `_admin-glass.scss` | 164 | Admin glass theme | MIGRATE → DELETE | → Task C3 |
| `_admin-dark-glass.scss` | 220 | Admin dark-glass theme | MIGRATE → DELETE | No storefront counterpart theme file → Task C3 |

### 1.3 Component Styles

| Scope | `.component.scss` files |
|-------|------------------------:|
| `src/app` (storefront) | 46 |
| `src/admin` | 40 |
| **Total** | **86** |

Migration state (scan 2026-07-28):

| Bucket | App (46) | Admin (40) | All (86) |
|--------|---------:|-----------:|---------:|
| Uses semantic-ish tokens | 32 (70%) | 4 (10%) | 36 (42%) |
| Still contains hex | 36 (78%) | 25 (63%) | 61 (71%) |
| Uses `--admin-*` | 3 | 30 (75%) | 33 |
| **Fully clean (semantic only, no hex)** | **3** | **0** | **3** |

Fully clean components: `favorites`, `base-modal`, `cart-modal`.

---

## 2. Duplicate CSS Variable Definitions

| Duplication | Locations | Resolution |
|-------------|-----------|------------|
| ~~Primitive tokens defined twice~~ | ~~`tokens/_primitive-tokens.scss` AND inlined in `tokens/_index.scss`~~ | ✅ RESOLVED (A1, 2026-07-28): `_index.scss` imports the file; inline copies deleted |
| Color palette defined in parallel | `tokens/` vs TS `light-theme.ts` (SCSS `core/_variables` palette removed in A4) | Task F1 |
| ~~Theme variables monolith~~ | ~~`tokens/_theme-variables.scss`~~ | ✅ Done (A3): deleted, themes absorb leftover vars |
| `--admin-*` system | 174 defined / 2 017 usages (M2); classified C1 → SHARED 125 / CONFLICT 47 / ADMIN-ONLY 2 | ✅ C1 (2026-07-28); migrate C2–C6 — see §4.1 |

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
src/admin/styles/        ← Parallel --admin-* (174 defined; M2 = 2 017 usages)
```

`_admin-layout-tokens.scss` (ADR-011) **does not exist yet** → Task C2.

### Target Architecture
```
src/styles/tokens/                        ← Shared tokens (single source)
src/styles/themes/                        ← Shared themes (single source)
src/admin/styles/_admin-layout-tokens.scss ← Admin LAYOUT only (sidebar, toolbar, content padding)
```

### Divergence Map

| Concern | Frontend Location | Admin Location | Duplicated? |
|---------|------------------|----------------|-------------|
| Color tokens | `tokens/` | `admin-variables.scss` (120 unique defs) | YES → C1 CONFLICT/SHARED |
| Light theme | `_default.scss` | `_admin-light.scss` (95 lines) | YES |
| Dark theme | `_dark.scss` | `_admin-dark.scss` (212 lines) | YES |
| Glass theme | `_glass.scss` | `_admin-glass.scss` (164 lines) | YES |
| Dark glass | — (no storefront file) | `_admin-dark-glass.scss` (220 lines) | ADMIN-ONLY theme |
| Material overrides | `overrides/_material-overrides.scss` (B1–B4) | admin-global / themes → C5 | PARTIAL (C5) |
| Layout styles | N/A | `admin-layout.component.scss` | NO (correct); widths still hardcoded → C2 |

### 4.1 C1 — `--admin-*` token classification (ADR-011)

**Scan date:** 2026-07-28. **DoD:** every defined token classified. Detail note: [`docs/migration/_c1-admin-token-inventory.md`](migration/_c1-admin-token-inventory.md).

| Class | Count | Meaning | Epic next |
|-------|------:|---------|-----------|
| SHARED | 125 | Same concept as shared tokens; replace with primitive/semantic | C3–C4 |
| CONFLICT | 47 | Same concept, different values — resolve per ADR-011 §2 | C3 |
| ADMIN-ONLY | 2 | Layout-only; keep under `--admin-*` | C2 |
| **Total defined** | **174** | | |
| UNDEFINED (used, no def) | 6 | Broken refs — fix during migration | C3–C4 |
| Proposed ADMIN-ONLY (new) | 3 | Hardcoded layout dims → create in C2 | C2 |

#### ADMIN-ONLY (existing — keep)

| Token | Maps / notes |
|-------|----------------|
| `--admin-mobile-padding-horizontal` | Layout; → `_admin-layout-tokens.scss` |
| `--admin-mobile-padding-vertical` | Layout; → `_admin-layout-tokens.scss` |

#### ADMIN-ONLY (proposed — create in C2)

| Token | Value today | Source |
|-------|-------------|--------|
| `--admin-sidebar-width` | `260px` | `.admin-sidenav` |
| `--admin-toolbar-height` | `64px` | glass `--mat-toolbar-*-height` |
| `--admin-content-padding` | `24px` | `.admin-main` |

#### CONFLICT (47) — resolve before/during C3

Default: **accidental drift → adopt frontend**. Intentional recipes → promote descriptive semantic (not a second `--admin-*`).

| Token | Admin (light default) | Shared target | Resolution |
|-------|----------------------|---------------|------------|
| `--admin-primary` | `#1976d2` | `--interactive-primary` (`#3b82f6`) | Adopt frontend |
| `--admin-primary-hover` | `#1565c0` | `--interactive-primary-hover` | Adopt frontend |
| `--admin-primary-rgb` | `59, 130, 246` (themes) / Material RGB | `--interactive-primary-rgb` | Adopt frontend |
| `--admin-secondary` | `#dc004e` | `--color-secondary-base` `#64748b` | Intent: accent pink → `--color-accent` / `--color-accent-pink`; drop parallel |
| `--admin-success` | `#4caf50` | `--color-success-base` | Adopt frontend |
| `--admin-warning` | `#ff9800` | `--color-warning-base` | Adopt frontend |
| `--admin-error` | `#f44336` | `--interactive-danger` | Adopt frontend |
| `--admin-info` | `#2196f3` | `--color-info` / `--color-blue-500` | Adopt frontend |
| `--admin-bg-primary` | `#ffffff` | `--surface-primary` / `--surface-page` | Adopt frontend |
| `--admin-bg-secondary` | `#fff` | `--surface-secondary` | Adopt frontend |
| `--admin-bg-tertiary` | `#fafafa` | `--surface-tertiary` | Adopt frontend |
| `--admin-bg-card` | `#ffffff` | `--surface-elevated` / `--surface-card` | Adopt frontend |
| `--admin-bg-hover` | `#e8f4f8` | `--surface-highlight` | Prefer frontend; else promote `--surface-admin-hover` |
| `--admin-text-primary` | `#212121` | `--text-primary` | Adopt frontend |
| `--admin-text-secondary` | `#757575` | `--text-secondary` | Adopt frontend |
| `--admin-text-disabled` | `#bdbdbd` | `--text-muted` / disabled | Adopt frontend |
| `--admin-border-primary` | `#b0b0b0` | `--border-default` | Adopt frontend |
| `--admin-border-secondary` | `#c0c0c0` | `--border-subtle` | Adopt frontend |
| `--admin-border-focus` | `#1976d2` | `--border-primary` / `--input-focus-border` | Adopt frontend |
| `--admin-border-error` | `#f44336` | `--interactive-danger` | Adopt frontend |
| `--admin-shadow-sm` | denser recipe | `--shadow-sm` | Adopt frontend |
| `--admin-shadow-md` | near-identical | `--shadow-md` | Adopt frontend |
| `--admin-shadow-lg` | different blur | `--shadow-lg` | Adopt frontend |
| `--admin-shadow-xl` | different blur | `--shadow-xl` | Adopt frontend |
| `--admin-card-shadow` | dark-theme heavy | `--shadow-card` / `--shadow-lg` | Adopt or promote |
| `--admin-card-gradient` | dark card fill | surface gradient semantic | Promote if kept |
| `--admin-surface-glow` | inset highlight | glass/surface effect | Promote into glass theme |
| `--admin-button` | pink/blue gradient | `--interactive-button` | Promote or simplify to primary |
| `--admin-z-dropdown` … `--admin-z-tooltip` (7) | 1000–1070 | `--z-*` 100–500 | Adopt frontend; verify stacking |
| `--admin-glass-*` (10) | admin glass recipes | `--glass-*` / theme glass | Promote unused→delete; used→shared glass semantics |
| `--admin-neon-primary` / `--admin-neon-secondary` | unused glass accents | — | Delete (dead) or promote |

Glass CONFLICT tokens (10): `--admin-glass-border-soft`, `--admin-glass-border-strong`, `--admin-glass-divider`, `--admin-glass-highlight`, `--admin-glass-inner-shadow`, `--admin-glass-shadow`, `--admin-glass-shadow-lg`, `--admin-glass-surface-muted`, `--admin-glass-surface-soft`, `--admin-glass-surface-strong`.

Z CONFLICT tokens (7): `--admin-z-dropdown`, `--admin-z-sticky`, `--admin-z-fixed`, `--admin-z-modal-backdrop`, `--admin-z-modal`, `--admin-z-popover`, `--admin-z-tooltip`.

#### SHARED (125) — replace with shared tokens (no value negotiation)

| Group | Tokens | Shared target |
|-------|--------|---------------|
| Spacing (6) | `--admin-spacing-xs`…`xxl` | `--space-1/2/4/6/8/12` |
| Radius (4) | `--admin-border-radius-sm`…`xl` | `--radius-sm`…`xl` |
| Font size (6) | `--admin-font-size-xs`…`xxl` | `--text-xs`…`--text-2xl` |
| Font weight (4) | `--admin-font-weight-light/normal/medium/bold` | `--font-*` (+ add light if needed) |
| Font family (1) | `--admin-font-family` | `--font-sans` |
| Motion (3) | `--admin-transition-*` | `--duration-*` + `--easing-default` |
| Breakpoints (5) | `--admin-breakpoint-*` | SCSS `$breakpoint-*` / media mixins |
| Submit/cancel (8) | `--admin-submit-btn*`, `--admin-cancel-btn*` | `--interactive-*` / state |
| Tab (1) | `--admin-tab-active` | `--interactive-primary` |
| Text helpers (3) | `--admin-text-inverse/label/tertiary` | `--text-inverse`, `--text-secondary`, `--text-muted` |
| Input (6) | `--admin-input-*` | `--input-*` (B2 bridge) |
| Table/select (11) | `--admin-table-*`, `--admin-select-panel-bg`, `--admin-selection-bg` | `--surface-table-*`, `--surface-select-panel` |
| Order detail/list aliases (21) | `--admin-order-detail-*`, `--admin-order-list-*` | corresponding `--surface-*` / `--text-*` / `--border-*` |
| Order status (5) | `--admin-order-status-*` | `--state-*` / `--color-*-base` |
| Surfaces misc (12) | `--admin-popup-bg`, `--admin-bg-main/container/glass/overlay`, `--admin-border-color`, `--admin-basic-bg`, translucents (3), `--admin-product-card-bg`, `--admin-message-info-bg` | `--surface-*` / `--glass-*` / overlay |
| Buttons muted / back / avatar (5) | `--admin-button-muted*`, `--admin-back-btn`, `--admin-avatar-*` | `--interactive-secondary` / surfaces |
| Header chrome (5) | `--admin-header-*` | `--surface-*` / `--text-*` / blur tokens |
| Palette variants (18) | `--admin-*-light/dark/hover` for primary/secondary/success/warning/error/info; `--admin-primary-light/dark`; `--admin-button-hover/text`; `--admin-danger` | `--color-*` / `--interactive-danger` |
| Accent (1) | `--admin-accent` | `--color-accent` |

#### UNDEFINED (6) — used without definition

| Token | Uses | Fix |
|-------|-----:|-----|
| `--admin-font-weight-semibold` | 4 | → `--font-semibold` |
| `--admin-accent-primary` | 2 | → `--color-accent` or `--interactive-primary` |
| `--admin-status-success` | 1 | → `--color-success` |
| `--admin-warn` | 1 | → `--color-warning` |
| `--admin-bg-card-rgb` | 1 | semantic RGB companion or drop |
| `--admin-text-disabled-rgb` | 1 | semantic RGB companion or drop |

Scan artifacts (not real tokens): `--admin-font-size-`, `--admin-font-weight-` from `admin-mixins.scss` interpolation.

---

## 5. `!important` Usage

**Total: 76 occurrences** (was 91; −15 from orphaned `styles.scss` deleted in A5, 2026-07-28):

| Count | File |
|------:|------|
| 20 | `src/app/layout/hero/hero.component.scss` |
| 14 | `src/admin/styles/admin-global.scss` |
| 14 | `src/admin/styles/_admin-dark.scss` |
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

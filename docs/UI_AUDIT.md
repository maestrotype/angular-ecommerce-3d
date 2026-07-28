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
| `src/styles/tokens/_index.scss` | 15 | Token pipeline entry | KEEP | ✅ RESOLVED (A1, 2026-07-28): imports `_primitive-tokens.scss` + `_semantic-tokens.scss`; still `@forward`s legacy `_theme-variables.scss` → Task A3 |
| `src/styles/tokens/_primitive-tokens.scss` | 106 | Primitive tokens (single source) | KEEP | ✅ RESOLVED (A1, 2026-07-28): now wired into the pipeline |
| `src/styles/tokens/_semantic-tokens.scss` | ~110 | Semantic tokens | KEEP | ✅ RESOLVED (A2, 2026-07-28): full storefront coverage; 0 undefined no-fallback refs outside `--tw-*` (A5) and `--admin-*`/`--lg-*` (Epic C) |
| `src/styles/tokens/_theme-variables.scss` | 722 | Legacy CSS variable monolith | DELETE | Still forwarded; decompose into themes/semantic → Task A3 |
| `src/styles/themes/_index.scss` | 89 | Theme re-export | FIX | Contains product-detail CSS vars with hex (logic in an index file) |
| `src/styles/themes/_default.scss` | 119 | Default/light theme | KEEP | Rewritten to semantic tokens ✅ |
| `src/styles/themes/_dark.scss` | 374 | Dark theme | KEEP | Rewritten to semantic tokens ✅ |
| `src/styles/themes/_glass.scss` | 481 | Glass theme | KEEP | Rewritten ✅; 4 `!important` + 5 `.mat-` overrides remain |
| `src/styles/core/_variables.scss` | 243 | SCSS vars + parallel palette | FIX | Defines parallel `:root` color palette (46 hex) → Task A4 |
| `src/styles/core/_mixins.scss` | 318 | Mixins | KEEP | Audit for unused mixins in Epic E |
| `src/styles/core/_base.scss` | 231 | Base element styles | FIX | 7 `!important` |
| `src/styles/core/_typography.scss` | 202 | Typography | KEEP | |
| `src/styles/core/_utilities.scss` | 307 | Utilities | KEEP | |
| `src/styles/components/_buttons.scss` | 356 | Button presets | KEEP | |
| `src/styles/components/_cards.scss` | 242 | Card presets | KEEP | Migrated to semantic tokens ✅ |
| `src/styles/components/_theme-switcher.scss` | 86 | Theme switcher | KEEP | Migrated ✅ |
| `src/styles/components/_forms.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| `src/styles/components/_modals.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| `src/styles/components/_navigation.scss` | 5 | **Stub** | IMPLEMENT/DELETE | → Task E3 |
| `src/styles.scss` | 499 | **Orphaned** catch-all | DELETE | NOT in build (`angular.json` uses `main.scss`); contains real logic: glass helpers, scrollbars (13 `!important`), 28 `.mat-` override lines, 32 hex → Task A5 |

### 1.2 Admin Styles (`src/admin/styles/`, ~4,032 lines)

| File | Lines | Purpose | Status | Notes |
|------|------:|---------|--------|-------|
| `admin.scss` | 49 | Admin entry | KEEP | Import orchestrator + CDK overlay |
| `material-theme.scss` | 28 | Material palette | FIX | Link to design tokens → Task B4 |
| `admin-variables.scss` | 224 | `--admin-*` definitions (120 unique) | DELETE after C | Parallel token system → Epic C |
| `admin-mixins.scss` | 274 | Admin mixins | INVESTIGATE | Overlap with core mixins |
| `admin-global.scss` | 1,195 | Admin global styles | DECOMPOSE | 76 `.mat-` lines, 14 `!important` → Task C5 |
| `_admin-material-base.scss` | 18 | Material base | INVESTIGATE | |
| `_admin-theme-material.scss` | 1,548 | De-facto Material override dump | MIGRATE | 349 `.mat-` lines → Task B2 |
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
| Color palette defined in parallel | `tokens/` vs `core/_variables.scss` (`--color-primary: #667eea` etc.) vs TS `light-theme.ts` | Task A4 + F1 |
| Theme variables monolith | `tokens/_theme-variables.scss` (722 lines) overlaps theme partials | Task A3: decompose and delete |
| `--admin-*` system | 174 unique tokens defined across `admin-variables.scss` (120) + 4 admin theme files (445 definition occurrences total) | Epic C (ADR-011: classify SHARED / ADMIN-ONLY / CONFLICT) |

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
| 46 | `src/styles/core/_variables.scss` | A4 |
| 45 | `src/app/pages/home/home.component.scss` | D1 |
| 32 | `src/styles.scss` (orphaned) | A5 |

---

## 4. Admin Style Isolation

### Current Architecture (confirmed by scan)
```
src/styles/              ← Frontend tokens + themes (semantic layer scaffolded)
src/admin/styles/        ← Fully parallel --admin-* system (2,335 usages / 43 files / 174 unique tokens)
```

`_admin-layout-tokens.scss` (target of ADR-011) **does not exist yet**.

### Target Architecture
```
src/styles/tokens/                        ← Shared tokens (single source)
src/styles/themes/                        ← Shared themes (single source)
src/admin/styles/_admin-layout-tokens.scss ← Admin LAYOUT only (sidebar, toolbar)
```

### Divergence Map

| Concern | Frontend Location | Admin Location | Duplicated? |
|---------|------------------|----------------|-------------|
| Color tokens | `tokens/` | `admin-variables.scss` (120 unique defs) | YES |
| Light theme | `_default.scss` | `_admin-light.scss` (95 lines) | YES |
| Dark theme | `_dark.scss` | `_admin-dark.scss` (212 lines) | YES |
| Glass theme | `_glass.scss` | `_admin-glass.scss` (164 lines) | YES |
| Dark glass | — (no storefront file) | `_admin-dark-glass.scss` (220 lines) | ADMIN-ONLY theme |
| Material overrides | scattered | `_admin-theme-material.scss` (1,548 lines) | YES |
| Layout styles | N/A | `admin-layout.component.scss` | NO (correct) |

---

## 5. `!important` Usage

**Total: 91 occurrences in 12 files** (scan 2026-07-28):

| Count | File |
|------:|------|
| 20 | `src/app/layout/hero/hero.component.scss` |
| 14 | `src/admin/styles/admin-global.scss` |
| 14 | `src/admin/styles/_admin-dark.scss` |
| 13 | `src/styles.scss` (orphaned) |
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

**No centralized `_material-overrides.scss` exists.** Scan 2026-07-28:

| Metric | Value |
|--------|-------|
| Files with `.mat-` / `.mat-mdc-` selector overrides | 24 |
| De-facto central dump | `src/admin/styles/_admin-theme-material.scss` — 1,548 lines, 349 `.mat-` lines |

Notable scatter outside the dump (23 files):

| `.mat-` lines | File |
|--------------:|------|
| 76 | `src/admin/styles/admin-global.scss` |
| 32 | `.../message-list.component.scss` |
| 28 | `src/styles.scss` (orphaned) |
| 25 | `.../order-list.component.scss` |
| 23 | `.../user-list.component.scss` |
| 20 | `.../seo-settings.component.scss` |
| 15 | `.../seo.component.scss` |
| 5 | `src/styles/themes/_glass.scss` |
| 2 | `src/styles/themes/_dark.scss` |

Resolution: Epic B (Tasks B1–B4).

---

## 9. Potentially Unused / Orphaned Files

| File | Finding | Action |
|------|---------|--------|
| `src/styles.scss` | **Confirmed orphaned** — not referenced in `angular.json` (entry is `src/styles/main.scss`), but contains 499 lines of real logic | Port needed rules, delete → Task A5 |
| `src/styles/tokens/_primitive-tokens.scss` | ✅ RESOLVED (A1, 2026-07-28) — wired into pipeline; was causing unresolved `--color-blue-*`, `--z-modal`, `--font-*` weights in dark/glass themes | Done |
| `src/styles/components/_forms.scss`, `_modals.scss`, `_navigation.scss` | Stubs (5 lines, "will be implemented here") | Implement or remove → Task E3 |
| `src/admin/styles/_admin-theme-material.scss` | Used, but is the Material-override dump | Migrate → Task B2 |

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

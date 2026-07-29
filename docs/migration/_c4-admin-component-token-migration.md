# Migration: Admin component token consumers (C4)

**Date:** 2026-07-28  
**Task:** C4  
**ADR:** ADR-011 (Token Reconciliation Strategy)

## What changed

All admin (and stray storefront) **component** consumers of SHARED/CONFLICT `--admin-*` now reference shared semantic/primitive tokens directly. ADMIN-ONLY layout tokens remain.

| Area | Change |
|------|--------|
| Admin `*.component.scss` (~30) | `--admin-*` → semantic map from C3 shim |
| Admin HTML/TS token strings | order-detail, error-dialog, section-list, image-processor |
| Storefront strays | `payment-success`, `payment-error`, `notification-badge` |
| `_material-overrides.scss` | B3 `TODO Epic C` `--admin-*` fallbacks → semantic |
| Helper | `scripts/c4-remap-admin-tokens.cjs` (longest-key-first; keeps layout tokens) |

**Kept (ADMIN-ONLY):** `--admin-sidebar-width`, `--admin-toolbar-height`, `--admin-content-padding`, `--admin-mobile-padding-*` in `_admin-layout-tokens.scss` + consumers (`admin-layout`, `list-container`, `category-list`).

**Not touched (C5/C6):** `admin-global.scss`, `admin-mixins.scss`, `admin-variables.scss` shim, admin theme chrome files.

### Transition note

Shim value `--admin-transition-*` was `var(--duration-*) var(--easing-default)`. Remap expands to  
`var(--duration-*) var(--easing-default)` so `transition: all var(...)` stays valid.

## DoD

- [x] 0 non-layout `--admin-*` in `*.component.{scss,html,ts}`
- [x] Layout tokens unchanged in `_admin-layout-tokens.scss`
- [x] No C5 dump / C6 shim delete
- [x] `npm run build` passes
- [x] Visual: admin login (`/admin/login`) renders with semantic surfaces/primary (light theme)

## Metrics

| Metric | Before C4 | After C4 |
|--------|----------:|---------:|
| M2 (`--admin-` line hits in `*.scss`) | 1 623 | **~467** |
| Non-layout `--admin-*` in components | many | **0** |
| ADMIN-ONLY layout defs | 5 | 5 |

Residual M2 ≈ `admin-global` + `admin-variables` + `admin-mixins` + layout + theme layout refs (+ comments).

## Next

**C5** — Decompose `admin-global.scss` (and migrate `admin-mixins` with it). Do **not** delete `admin-variables.scss` until C6.

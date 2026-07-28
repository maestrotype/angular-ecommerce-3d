# Migration: Material theme → design tokens (B4)

**Date:** 2026-07-28  
**Task:** B4  
**ADR:** ADR-005 (Material overrides), ADR-002 (UI preservation)

## What changed

| File | Change |
|------|--------|
| `src/styles/tokens/_material-palettes.scss` | **New** — Sass palettes mirrored from primitives + `material-color-bridge` mixin |
| `src/admin/styles/material-theme.scss` | Stock indigo/pink/blue-grey → token palettes; dark via `all-component-colors`; CSS bridge on `:root` |
| `src/admin/styles/_admin-material-base.scss` | Emptied to shim — `mat.core()` + themes moved to `material-theme.scss` (no double `all-component-themes`) |
| `src/styles/tokens/_primitive-tokens.scss` | Cross-link comment to Material palettes |

## Token mapping

| Material role | Compile-time (Sass 500) | Runtime (CSS bridge) |
|---------------|-------------------------|----------------------|
| Primary | `#3b82f6` = `--color-primary-base` | `--interactive-primary` / `--text-on-primary` |
| Accent | `#f59e0b` = `--color-accent-base` | `--color-accent` |
| Warn | `#ef4444` = `--color-error-base` | `--interactive-danger` / `--state-error-text` |

Theme coverage:

- Root: light Material theme (also serves `light` + `glass`)
- `[data-theme='dark'|'dark-glass']`: dark Material colors only

## DoD

Changing a semantic color token (e.g. `--interactive-primary` in a theme) updates Material primary components via MDC/Mat CSS custom properties remapped in `material-color-bridge`.

Compile-time: changing primitive hex requires updating the matching Sass map in `_material-palettes.scss` (documented next to brand primitives).

## Intentionally remaining

- Selector-level Material overrides in `_material-overrides.scss` (B2/B3) — still the audit point for non-palette chrome
- `admin-global.scss` / theme-file `.mat-` → **C5**
- Parallel `--admin-*` → Epic C

## Verification

```bash
rg 'indigo-palette|pink-palette|blue-grey-palette|deep-orange' src/admin/styles
# expect 0

rg 'material-color-bridge|brand-primary-palette' src
npm run build
```

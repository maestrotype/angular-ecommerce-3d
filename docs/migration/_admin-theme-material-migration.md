# Migration: `_admin-theme-material.scss` → `_material-overrides.scss`

**Date:** 2026-07-28  
**Task:** B2 (Bridge)  
**ADR:** ADR-002 (UI preservation), ADR-005 (Material overrides), ADR-011 (token bridge)

## What moved

| From | To |
|------|----|
| `src/admin/styles/_admin-theme-material.scss` (1 548 lines) | `src/styles/overrides/_material-overrides.scss` |
| Import in `src/admin/styles/admin.scss` | Removed (overrides load via `main.scss` → `overrides/_index.scss`) |

## Token remap (Bridge)

Admin Material consumers now use semantic tokens. Admin themes temporarily set bridge tokens from existing `--admin-*` values so glass/dark-glass tables and inputs keep their look until Epic C.

| Former `--admin-*` | Semantic / bridge |
|--------------------|-------------------|
| `--admin-primary` | `--interactive-primary` |
| `--admin-primary-rgb` | `--interactive-primary-rgb` |
| `--admin-button` | `--interactive-button` |
| `--admin-danger` | `--interactive-danger` |
| `--admin-text-primary` / `--secondary` | `--text-primary` / `--text-secondary` |
| `--admin-input-bg/text/border/label/focus/placeholder` | `--input-*` |
| `--admin-bg-card/secondary/hover` | `--surface-elevated` / `--surface-secondary` / `--surface-highlight` |
| `--admin-header-bg` | `--surface-header` |
| `--admin-table-*` | `--surface-table*` / `--text-table*` / `--surface-paginator` / `--text-paginator` |
| `--admin-select-panel-bg` | `--surface-select-panel` |
| `--admin-border-primary/secondary` | `--border-default` / `--border-subtle` |
| `--admin-spacing-md` / `--font-*` / `--shadow-lg` / `--transition-normal` | shared `--spacing-md` / `--font-*` / `--shadow-lg` / `--transition-normal` |
| `--border-radius-dark-glass` | `--radius-dialog` |

Bridge defaults: `src/styles/tokens/_semantic-tokens.scss`  
Bridge wiring: `body.is-admin[data-theme]` blocks in `_admin-light/dark/glass/dark-glass.scss` (wins over shared themes that load later via `main.scss`)  
Storefront input bridge: `_dark.scss` / `_glass.scss` (`--input-*` only)

## Intentionally remaining

- Theme-scoped hex recipes in overrides (`#313638`, glass menu colors, etc.) marked `// TODO Epic C`
- Glass inset/frost `rgba(...)` effect recipes inside `[data-theme='glass'|'dark-glass']`
- Scattered `.mat-` rules in component SCSS → **B3 ✅** (0 in `*.component.scss`; residual admin-global/themes)
- `material-theme.scss` palette → **B4**
- Component `--admin-*` usage → **Epic C**
- `admin-global.scss` `.mat-` → **C5**

## Verification

```bash
rg '_admin-theme-material' src          # expect only comments pointing at overrides
rg 'var\(--admin-' src/styles/overrides # expect 0
npm run build
```

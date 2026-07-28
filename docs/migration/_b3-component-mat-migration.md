# Migration: component `.mat-` → `_material-overrides.scss` (B3)

**Date:** 2026-07-28  
**Task:** B3  
**ADR:** ADR-005 (Material overrides), ADR-002 (UI preservation)

## Result

| Check | Status |
|-------|--------|
| `.mat-` / `.mdc-` in `src/admin/**/*.component.scss` | **0** |
| Unique rules | Host-scoped section at end of `_material-overrides.scss` |
| Redundant legacy `::ng-deep` Material dumps | Deleted (covered by B2) |
| `npm run build` | Passes |

## Approach

1. **DELETE** — page-level legacy non-MDC form/select/table/button dumps that duplicated B2 central overrides (`message-list`, `order-list`, `user-list`, `message-detail`, SEO input whites).
2. **MOVE** — unique theming/layout under host selectors (`app-message-list`, `app-order-list`, …): column widths, subject accent, chips, SEO tabs, confirmation dialog, image-processor, form width/subscript, section drawer chips/tabs.
3. **REWRITE** — `header` notification menu: dropped `.mat-mdc-*` / `.mdc-*` from selectors (`.notification-menu`, `button.mark-all-read`) so custom panel chrome stays in the component without Material class overrides.

## Intentionally remaining (not B3)

| Location | Next |
|----------|------|
| `admin-global.scss` (~76 `.mat-`) | C5 |
| `_admin-dark.scss` / `_admin-dark-glass.scss` | Epic C / theme cleanup |
| `themes/_glass.scss` / `_dark.scss` | theme recipes → overrides or tokens |
| `_scrollbars.scss` | E / cleanup |
| `material-theme.scss` | **B4 ✅** |

## Verification

```bash
rg '\.mat-|\.mdc-' src/admin --glob '*.component.scss'   # expect empty
npm run build
```

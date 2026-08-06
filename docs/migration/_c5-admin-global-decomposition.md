# C5: admin-global.scss decomposition

Epic C5 splits the monolithic `admin-global.scss` into modular partials under `src/admin/styles/global/`. The root file is now a thin import orchestrator.

## Import map

| Import in `admin-global.scss` | Partial | Contents moved |
|---|---|---|
| `./global/base` | `_base.scss` | `*` reset, scrollbars, `body.is-admin` base (overflow fixed, no `!important`) |
| `./global/atmospheres` | `_atmospheres.scss` | `body.is-admin[data-theme="glass\|dark-glass"]` backgrounds, `@keyframes gradientShift` (root-level) |
| `./global/typography` | `_typography.scss` | `h1`–`h6`, `p`, `a`, `button` (mixins) |
| `./global/tables` | `_tables.scss` | `.mat-mdc-table`, glass zebra `.admin-table-container` / `.admin-table-wrapper` |
| `./global/forms-controls` | `_forms-controls.scss` | form-field, select, checkbox, radio, slide-toggle, progress-spinner |
| `./global/chrome` | `_chrome.scss` | cards, menu, toolbar, sidenav/drawer, list baseline, paginator |
| `./global/overlays` | `_overlays.scss` | snackbar (no `!important`; doubled selectors + MDC tokens), dialog, tooltip |
| `./global/patterns` | `_patterns.scss` | status badges, payment-method, customer-info, actions, loading/no-data, stat-card, filters |
| `./global/sidenav-nav` | `_sidenav-nav.scss` | clean sidenav nav item styles, `.sidenav-nav` token block |
| `./global/responsive` | `_responsive.scss` | `@media (max-width: 480px)` admin-header, `@media (max-width: 768px)` filters/stat-card |
| `./global/glass-dialogs` | `_glass-dialogs.scss` | glass theme popup dialog overrides (order/message detail) |

## Unchanged by C5

- `admin-variables.scss` shim (removed in C6)
- `_admin-layout-tokens.scss` and other theme/token files
- Storefront styles

## `!important` cleanup (C5)

- `body.is-admin { overflow: hidden }` — removed `!important`
- Snackbar variants — replaced `!important` with doubled selectors (e.g. `.mdc-snackbar__surface.mdc-snackbar__surface`) and `--mdc-snackbar-*` / `--mat-snack-bar-*` tokens

## Verification

```bash
rg -c '!important' src/admin/styles/admin-global.scss src/admin/styles/global
# expect 0

npm run build
```

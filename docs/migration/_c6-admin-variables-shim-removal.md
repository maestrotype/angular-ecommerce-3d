# C6: Delete admin-variables shim + mixin semantic cutover

Epic C6 removes the `--admin-*` compatibility shim and finishes ADR-011 cutover so non-layout admin styles consume shared semantic tokens only.

## Changes

| Action | Detail |
|--------|--------|
| Deleted | `src/admin/styles/admin-variables.scss` (alias shim) |
| Added | `src/admin/styles/_admin-root-defaults.scss` — dashboard/MDC/`--border-width` defaults previously only in the shim |
| Rewrote | `admin-mixins.scss` — all mixins on semantic tokens; breakpoints use SCSS literals (`768px` / `992px`) |
| Remapped | Remaining consumers (global partials + strays) via `scripts/c4-remap-admin-tokens.cjs` |
| Kept | `_admin-layout-tokens.scss` — 5 ADMIN-ONLY layout tokens |
| Kept | `_admin-light/dark/glass/dark-glass.scss` — live theme chrome / semantic promotions (not “legacy dumps”) |

## Import order (`admin.scss`)

```
_admin-material-base
_admin-layout-tokens
_admin-root-defaults
_admin-dark / light / glass / dark-glass
admin-global  (mixins + global/*; no admin-variables)
```

## M2 after C6

Live `--admin-*` usages = **layout only**:

| Token | Role |
|-------|------|
| `--admin-sidebar-width` | sidenav width |
| `--admin-toolbar-height` | mat-toolbar height (glass) |
| `--admin-content-padding` | main content padding |
| `--admin-mobile-padding-vertical` | list mobile padding |
| `--admin-mobile-padding-horizontal` | list / category-list mobile padding |

Comments mentioning `--admin-*` may remain in docs/token headers; they are not runtime aliases.

## Verification

```bash
rg '\-\-admin-' src --glob '*.scss'
# expect only layout tokens (+ comments)

npm run build
```

## Smoke (manual)

Login + dashboard + list × light / dark / glass / dark-glass. Glass: chrome lighter than content; header ≡ sidebar; no `isolation`/`translateZ` on chrome.

# Migration: Admin layout tokens (C2)

**Date:** 2026-07-28  
**Task:** C2  
**ADR:** ADR-011 (Token Reconciliation Strategy)

## What changed

Created `src/admin/styles/_admin-layout-tokens.scss` and wired it in `admin.scss` (before `admin-variables`).

| Token | Value | Action |
|-------|-------|--------|
| `--admin-sidebar-width` | `260px` | **new** |
| `--admin-toolbar-height` | `64px` | **new** |
| `--admin-content-padding` | `24px` | **new** (ADR name variant of content-margin) |
| `--admin-mobile-padding-vertical` | `22px` | relocated from `admin-variables.scss` |
| `--admin-mobile-padding-horizontal` | `8px` | relocated from `admin-variables.scss` |

## Consumers updated

- `admin-layout.component.scss`: `.admin-sidenav` width, `.admin-main` padding
- `_admin-glass.scss`: `--mat-toolbar-standard-height` / `--mat-toolbar-mobile-height` → `var(--admin-toolbar-height)`

Header/sidenav/page `64px` / `24px` hardcodes outside admin-layout/glass left for C4/D7 (no drive-by).

## Metrics

| Metric | Before C2 | After C2 |
|--------|----------:|---------:|
| Defined `--admin-*` | 174 | **177** |
| ADMIN-ONLY | 2 (+3 proposed) | **5** (isolated) |
| M2 usages | 2 017 | **2 025** |

M2 rose slightly (new defs + `var()` refs); expected until C3–C6 remove SHARED/CONFLICT.

## DoD

- [x] ADMIN-ONLY tokens isolated in `_admin-layout-tokens.scss`
- [x] Layout hardcodes in admin-layout/glass use the new tokens
- [x] `npm run build` passes
- [x] Board / PROJECT_STATUS / UI_AUDIT updated

## Next

**C3** — SHARED/CONFLICT: map admin themes to semantic + layout only (see UI_AUDIT §4.1).

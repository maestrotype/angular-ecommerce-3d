# Migration: Admin SHARED/CONFLICT reconciliation (C3)

**Date:** 2026-07-28  
**Task:** C3  
**ADR:** ADR-011 (Token Reconciliation Strategy)

## What changed

Admin themes no longer remount parallel hex/`--admin-*` palettes. SHARED + CONFLICT tokens alias shared semantic/primitive tokens; intentional glass/dark-glass recipes are **promoted onto semantic** under `body.is-admin[data-theme]`.

| File | Role after C3 |
|------|----------------|
| `admin-variables.scss` | Compatibility shim: `--admin-*` → `var(--semantic/primitive)` (keep until C6) |
| `_admin-light.scss` | Admin chrome only (`body.is-admin`); adopts shared light semantics |
| `_admin-dark.scss` | Adopts storefront dark semantics; promotes `--surface-card-gradient` / `--surface-glow` |
| `_admin-glass.scss` | Promotes admin glass table/header/glass recipes onto semantic |
| `_admin-dark-glass.scss` | Admin-only theme: full semantic promotion of liquid-glass recipes |
| `_admin-layout-tokens.scss` | Unchanged (C2 ADMIN-ONLY) |
| `_semantic-tokens.scss` | + glass surface recipes, `--surface-card-gradient`, `--surface-glow`, RGB companions |
| `_primitive-tokens.scss` | + `--font-light` |
| `themes/_glass.scss` | Removed leftover storefront `--admin-*` defs |

## Conflict resolutions applied (UI_AUDIT §4.1)

| Group | Resolution |
|-------|------------|
| Brand / state / surfaces / text / borders / shadows | **Adopt frontend** semantic |
| `--admin-secondary` pink vs slate secondary | **Intent** → `--color-accent-pink` |
| `--admin-button` gradient | **Simplify** → `--interactive-button` |
| Glass `--admin-glass-*` (10) | **Promote** → `--glass-surface-*` / `--glass-border-*` / `--glass-shadow*` |
| Z-index Bootstrap scale | **Adopt** `--z-*` |
| Neon accents | **Deleted** (unused) |
| UNDEFINED (6) | Defined as aliases (`semibold`, `accent-primary`, `status-success`, `warn`, RGB companions) |

## DoD

- [x] Admin themes map **semantic + layout** only (no parallel `--admin-*` hex remounts in theme files)
- [x] Reverse B2 bridge removed (`semantic ← --admin-*`); light/dark use shared SoT; glass/dark-glass set semantic on `body.is-admin`
- [x] `admin-variables.scss` kept (C6); `admin-global.scss` untouched (C5)
- [x] No bulk component migration (C4)
- [x] `npm run build` passes

## Metrics

| Metric | Before C3 | After C3 |
|--------|----------:|---------:|
| M2 (`--admin-` line hits) | 2 025 | **~1 625** |
| Defined `--admin-*` | 177 | **~180** (+UNDEFINED aliases; −neon) |
| ADMIN-ONLY layout | 5 | 5 (unchanged) |

M2 drop is mostly theme-file definition removal; component `var(--admin-*)` remain for **C4**.

## Next

**C4** — Migrate admin components from `--admin-*` to semantic (batches of 5, visual check). Do not start C5 until C4 batches are underway or board says otherwise.

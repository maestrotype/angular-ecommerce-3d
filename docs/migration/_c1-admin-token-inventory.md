# Migration: Admin token inventory (C1)

**Date:** 2026-07-28  
**Task:** C1  
**ADR:** ADR-011 (Token Reconciliation Strategy)

## Scan summary

| Metric | Value |
|--------|------:|
| Unique `--admin-*` names in SCSS | 182 (incl. 2 Sass-interpolation scan artifacts) |
| Defined (`--name: value`) | **174** |
| Consumed via `var()` | 122 |
| Defined but never `var()`-used | 60 |
| Used but never defined | 6 |
| M2 usages (board) | 2 017 |

Classification rules: ADR-011 §2 — Frontend `src/styles/tokens/` is SoT; ADMIN-ONLY = layout structure only.

| Class | Count | Next task |
|-------|------:|-----------|
| **SHARED** | 125 | C3–C4: replace with semantic / primitive |
| **CONFLICT** | 47 | C3: resolve (adopt frontend **or** promote semantic) |
| **ADMIN-ONLY** (existing) | 2 | C2: keep in `_admin-layout-tokens.scss` |
| **ADMIN-ONLY** (proposed from hardcodes) | 3 | C2: create |
| **UNDEFINED** (broken refs) | 6 | C3/C4: fix or delete consumers |

Full per-token table: [UI_AUDIT.md §4.1](../UI_AUDIT.md#41-c1--admin--token-classification-adr-011).

## Conflict resolution defaults (ADR-011 §2)

| Group | Drift | Default resolution |
|-------|-------|--------------------|
| Brand / state colors (`primary`, `success`, `warning`, `error`, `info`) | Material hex vs Tailwind primitives | **Accidental** → adopt frontend (`--interactive-*` / `--color-*-base`) |
| `--admin-secondary` `#dc004e` vs `--color-secondary-base` `#64748b` | Different role (pink accent vs slate) | **Intent** → map accent uses to `--color-accent` / pink; drop parallel secondary |
| Surfaces / text / borders | Near values, different hex | **Accidental** → adopt `--surface-*` / `--text-*` / `--border-*` |
| `--admin-bg-hover` `#e8f4f8` | Tinted blue vs `--surface-highlight` slate | Prefer frontend; if admin needs tint, promote `--surface-admin-hover` |
| Shadows `sm/lg/xl` | Recipe drift | Adopt `--shadow-*` |
| Z-index (1000+ vs 100–500) | Bootstrap vs compact scale | Adopt `--z-*`; verify admin stacking in C3 |
| `--admin-button` gradient | Unique recipe | Promote semantic button token **or** use `--interactive-button` |
| Glass / neon recipes | Admin-only glass chrome | Promote into shared glass theme semantics as needed; delete unused |

## Gaps (undefined)

| Token | Uses | Fix |
|-------|-----:|-----|
| `--admin-font-weight-semibold` | 4 | → `--font-semibold` (exists) |
| `--admin-accent-primary` | 2 | → `--color-accent` / `--interactive-primary` |
| `--admin-status-success` | 1 | → `--color-success` / `--state-success-*` |
| `--admin-warn` | 1 | → `--color-warning` |
| `--admin-bg-card-rgb` | 1 | add RGB companion on semantic surface **or** inline rgba |
| `--admin-text-disabled-rgb` | 1 | same for disabled text |

## Proposed ADMIN-ONLY (C2) — **done**

See [`_c2-admin-layout-tokens.md`](_c2-admin-layout-tokens.md). Tokens live in `_admin-layout-tokens.scss`.

| Token | Value | Source |
|-------|-------|--------|
| `--admin-sidebar-width` | `260px` | `.admin-sidenav` |
| `--admin-toolbar-height` | `64px` | glass `--mat-toolbar-*-height` |
| `--admin-content-padding` | `24px` | `.admin-main` padding |

Existing ADMIN-ONLY relocated: `--admin-mobile-padding-horizontal`, `--admin-mobile-padding-vertical`.

## Verification

```bash
rg -o --no-filename '\-\-admin-[a-zA-Z0-9-]+' src --glob '*.scss' | sort -u | wc -l
# defined count: 174 (see UI_AUDIT §4.1)
```

# Theme Engine v2 — angular-ecommerce-3d

**Last Updated**: 2026-08-05  
**Epic**: F (ADR-004, ADR-012)

This document describes the **implemented** theme engine. SCSS is the source of truth for visuals; TypeScript is a **catalog** (ids, areas, dimensions metadata, preview palette, SCSS path).

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SCSS (source of truth)                                     │
│  src/styles/themes/_default.scss | _dark.scss | _glass.scss │
│  src/admin/styles/_admin-glass.scss | _admin-dark-glass.scss│
│  → [data-theme="…"] { --surface-primary: …; … }             │
└───────────────────────────┬─────────────────────────────────┘
                            │ mirrors (metadata only)
┌───────────────────────────▼─────────────────────────────────┐
│  TypeScript catalog                                         │
│  theme-definitions.ts → ThemeDefinition[]                   │
│  theme-contract.ts    → REQUIRED_SEMANTIC_TOKENS, THEME_DOM_ID│
└───────────────────────────┬─────────────────────────────────┘
                            │ applies attribute only
┌───────────────────────────▼─────────────────────────────────┐
│  ThemeService                                               │
│  document.documentElement[data-theme]                       │
│  document.body[data-theme] + body.is-admin (admin routes)   │
└─────────────────────────────────────────────────────────────┘
```

**Principles**

1. **SCSS owns tokens** — components use semantic CSS variables (`var(--surface-primary)`), never theme-specific logic.
2. **TS owns catalog** — theme picker, docs, and validation reference one registry.
3. **Atomic switch** — a single `data-theme` attribute change; no runtime CSS injection.
4. **Area separation** — storefront and admin persist themes independently (`selected-theme` vs `selected-theme-admin`).

---

## 2. Available themes

| id | Storefront label | Admin label | Areas | SCSS source |
|----|------------------|-------------|-------|-------------|
| `light` | Light | Light | frontend, admin | `src/styles/themes/_default.scss` |
| `dark` | Dark | Dark | frontend, admin | `src/styles/themes/_dark.scss` |
| `glass` | **Aurora** | **Ice** | frontend, admin | `src/styles/themes/_glass.scss` |
| `dark-glass` | — | **Ember** | **admin only** | `src/admin/styles/_admin-dark-glass.scss` |

CSS `[data-theme]` ids are unchanged. Frontend selector: Light, Dark, Aurora. Admin adds Ice (`glass`) and Ember (`dark-glass`).

---

## 3. TypeScript model (F1 / ADR-012)

```typescript
// src/app/core/themes/theme.model.ts

export type ThemeId = 'light' | 'dark' | 'glass' | 'dark-glass';
export type ThemeArea = 'frontend' | 'admin';

export type ThemeDimension =
  | 'appearance' | 'typography' | 'spacing' | 'radius'
  | 'elevation' | 'density' | 'motion' | 'layout' | 'effects';

export interface ThemePreviewPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  success: string;
  warning: string;
  error: string;
  glassBlur: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  areas: ThemeArea[];
  scssSource: string;           // path to SCSS partial (documentation + tooling)
  dimensions: ThemeDimension[]; // which ADR-004 dimensions this theme customizes
  preview: ThemePreviewPalette; // theme-selector swatches only
}

/** @deprecated Use ThemeDefinition */
export type Theme = ThemeDefinition;
```

Definitions live in `theme-definitions.ts`; registry in `theme-config.ts`.

---

## 4. File structure

```
src/app/core/themes/
├── theme.model.ts          # ThemeDefinition, ThemeId, ThemeDimension
├── theme-contract.ts       # REQUIRED_SEMANTIC_TOKENS, THEME_DOM_ID
├── theme-definitions.ts    # light / dark / glass / dark-glass
├── theme-config.ts         # AVAILABLE_THEMES, DEFAULT_THEME_ID
├── theme-validator.ts      # validateThemeTokens() (F3)
└── theme.service.ts        # runtime switching, area sync

src/styles/themes/
├── _index.scss
├── _default.scss           # light
├── _dark.scss
└── _glass.scss

src/admin/styles/
├── _admin-glass.scss
└── _admin-dark-glass.scss
```

Legacy per-theme TS files (`light-theme.ts`, etc.) were removed — they duplicated SCSS without being applied at runtime.

---

## 5. Theme switching

### 5.1 Runtime flow

```
User selects theme (ThemeSelectorComponent)
      │
      ▼
ThemeService.setTheme(id, area)
      │
      ├── localStorage: selected-theme | selected-theme-admin
      ├── document.documentElement[data-theme] = THEME_DOM_ID[id]
      ├── document.body[data-theme] = same
      └── dev mode: validateThemeTokens() via requestAnimationFrame
      │
      ▼
CSS [data-theme="…"] blocks reassign semantic variables
```

On route changes, `syncThemeToCurrentArea()` re-applies the correct theme and toggles `body.is-admin`.

### 5.2 SCSS pattern

```scss
[data-theme='dark'] {
  --surface-primary: #1e293b;
  --text-primary: #f8fafc;
  // …
}
```

Admin glass scopes additionally use `body.is-admin[data-theme='glass']`.

### 5.3 Anti-FOUC bootstrap (F4)

`src/index.html` runs **before** Angular boot:

1. **`<head>` script** — reads `selected-theme` or `selected-theme-admin` (with legacy `adminTheme` fallback), normalizes ids, sets `document.documentElement[data-theme]`.
2. **`<body>` script** — on `/admin` routes, adds `body.is-admin` and copies `data-theme` to `body`.

This prevents a flash of the default light theme on reload and ensures admin chrome selectors match on first paint.

---

## 6. Validation (F3)

`theme-contract.ts` defines tokens that must resolve after any theme is active:

```typescript
export const REQUIRED_SEMANTIC_TOKENS = [
  '--surface-primary',
  '--surface-secondary',
  '--text-primary',
  '--text-secondary',
  '--border-default',
  '--interactive-primary',
  '--interactive-danger',
] as const;
```

`validateThemeTokens(themeId)` uses `getComputedStyle(document.documentElement)`. In **development mode**, `ThemeService.applyTheme()` logs a warning if any token is missing.

Extend `REQUIRED_SEMANTIC_TOKENS` when new semantic tokens become mandatory across all themes.

---

## 7. Dimensions (F2 / ADR-004)

Nine dimensions describe **what each theme customizes** (metadata in TS; values in SCSS):

| Dimension | Typical tokens (SCSS) |
|-----------|------------------------|
| appearance | `--surface-*`, `--text-*`, `--interactive-*`, backgrounds |
| typography | `--font-family-*`, `--font-weight-*`, `--letter-spacing-*` |
| spacing | `--spacing-*`, `--component-padding-*` |
| radius | `--radius-sm` … `--radius-xl` |
| elevation | `--shadow-*`, `--elevation-style` |
| density | `--density-mode`, `--line-height-density` |
| motion | `--motion-*`, `--transition-*`, `--page-transition-*`, `--micro-*`, `--modal-enter-*` — see `STYLE_ARCHITECTURE.md` §14 |
| layout | `--sidebar-width`, `--header-height`, `--content-max-width` |
| effects | `--glass-blur`, `--glass-opacity`, backdrop filters |

Light theme lists all baseline dimensions; dark/glass/dark-glass document partial overrides only.

### 7.1 Motion presets (storefront)

Each storefront theme defines a **motion personality** by overriding semantic tokens in its SCSS partial. Implementation lives in global partials (`_motion.scss`, `_micro-interactions.scss`, `_page-transitions.scss`); themes only change token values.

| Theme | File | Overrides (examples) |
|-------|------|---------------------|
| light / default | `themes/_default.scss` | Baseline `--page-transition-offset-y`, `--micro-hover-scale` |
| dark | `themes/_dark.scss` | Faster `--motion-duration-fast/normal`, smaller lifts, blue focus ring |
| glass | `themes/_glass.scss` | 400/600ms durations, elegant `--motion-easing-enter`, larger page lift |
| dark-glass | `admin/_admin-dark-glass.scss` + forms block | Admin forms focus ring; inherits dark timing |

**Do not** embed theme-specific `@keyframes` or durations inside `*.component.scss`. Switching `[data-theme]` must re-style motion without recompiling components.

Full token tables, keyframes, utilities, and performance rules: **`docs/STYLE_ARCHITECTURE.md` §14**.

---

## 8. Adding a new theme

1. **SCSS partial** — `src/styles/themes/_<name>.scss` with `[data-theme="<name>"] { … }`.
2. **Import** — add to `src/styles/themes/_index.scss` (and admin partial if needed).
3. **Definition** — add `ThemeDefinition` in `theme-definitions.ts` with `scssSource`, `dimensions`, `preview`.
4. **Registry** — append to `AVAILABLE_THEMES` in `theme-config.ts`.
5. **Contract** — extend `ThemeId` and `THEME_DOM_ID` in `theme.model.ts` / `theme-contract.ts`.
6. **FOUC** — if admin-only, update normalization in `index.html` head script.
7. **Verify** — switch theme in UI; check dev console for validation warnings.

---

## 9. Storage keys

| Key | Purpose |
|-----|---------|
| `selected-theme` | Storefront theme id |
| `selected-theme-admin` | Admin theme id |
| `adminTheme` | Legacy admin key (read fallback only) |

Legacy value `default` → `light`. Storefront rejects `dark-glass` (falls back to `dark` in bootstrap, `light` in service if invalid).

---

## 10. Related docs

- ADR-004 — multi-dimensional themes  
- ADR-012 — TS ↔ SCSS ↔ docs three-way mirror  
- `docs/STYLE_ARCHITECTURE.md` — token layers and import order; **§14 Animation & Motion System**  
- `docs/REFACTORING_BOARD.md` — Epic F task status  

---

*Maintained by Principal UI Architect. Reflects Epic F implementation (2026-08-05); motion presets documented in G15.*

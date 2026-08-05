# Style Architecture — angular-ecommerce-3d

This document defines the complete style architecture for the application. It is the single source of truth for how styles are organized, how themes work, how tokens flow, and how Angular Material is integrated.

**Role**: Principal UI Architect
**Last Updated**: 2026-08-05

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
│  ┌──────────── frontend ────────────┐           │
│  │  Components use CSS variables     │           │
│  │  var(--text-primary)              │           │
│  └────────────┬──────────────────────┘           │
│               ▼                                  │
│  ┌──────────── Theme Layer ────────────┐        │
│  │  [data-theme="light"] {             │        │
│  │    --text-primary: #212121;         │        │
│  │  }                                  │        │
│  └────────────┬───────────────────────┘         │
│               ▼                                  │
│  ┌──────────── Token Layer ────────────┐        │
│  │  :root {                             │        │
│  │    --spacing-md: 16px;              │        │
│  │    --radius-md: 8px;                │        │
│  │  }                                  │        │
│  └────────────┬───────────────────────┘         │
│               ▼                                  │
│  ┌──────────── Core Layer ─────────────┐        │
│  │  resets, base typography, utilities │        │
│  └─────────────────────────────────────┘         │
└──────────────────────────────────────────────────┘
```

**Principle**: Styles flow bottom-up. Tokens define WHAT exists. Themes define HOW it looks. Components consume — they never define.

---

## 2. SCSS Folder Structure

**Build entry** (wired in `angular.json` → `styles[]`): `src/styles/main.scss` — imports only. There is no `src/styles.scss`.

Admin styles are separate entries in the same `styles[]` array (`material-theme.scss`, `admin.scss`).

```
src/
├── styles/
│   ├── main.scss                  # Build entry (angular.json) — imports only
│   │
│   ├── tokens/                    # Design tokens (theme-independent)
│   │   ├── _index.scss            # Pipeline: primitives → semantic
│   │   ├── _primitive-tokens.scss # Raw design values (single source)
│   │   ├── _semantic-tokens.scss  # Contextual mappings for components
│   │   └── _material-palettes.scss # Sass Material palettes + CSS bridge (B4; @use from material-theme)
│   │
│   ├── themes/                    # Theme definitions (theme-dependent)
│   │   ├── _index.scss            # Re-exports all themes
│   │   ├── _default.scss          # Default/light theme
│   │   ├── _dark.scss             # Dark theme
│   │   └── _glass.scss            # Glass theme
│   │
│   ├── core/                      # Global resets, base, utilities
│   │   ├── _index.scss            # Re-exports core module
│   │   ├── _variables.scss        # SCSS breakpoints + non-color utils
│   │   ├── _mixins.scss           # Reusable SCSS mixins
│   │   ├── _base.scss             # Base element styles (html, body, etc.)
│   │   ├── _typography.scss       # Typography scale
│   │   ├── _utilities.scss        # Utility classes
│   │   └── _scrollbars.scss       # Thin scrollbars + drawer hide
│   │
│   ├── components/                # Global component style presets
│   │   ├── _index.scss            # Re-exports component presets
│   │   ├── _buttons.scss
│   │   ├── _motion.scss
│   │   ├── _micro-interactions.scss
│   │   ├── _page-transitions.scss
│   │   ├── _cards.scss
│   │   ├── _empty-states.scss
│   │   ├── _loading.scss
│   │   ├── _forms.scss
│   │   ├── _navigation.scss
│   │   ├── _modals.scss
│   │   ├── _product-detail.scss
│   │   ├── _checkout.scss
│   │   ├── _theme-switcher.scss
│   │   └── _glass-helpers.scss    # .glass-theme, cart controls, .theme-price
│   │
│   └── overrides/                 # Third-party / Material overrides (ADR-005)
│       ├── _index.scss            # Re-exports overrides module
│       └── _material-overrides.scss  # Central Material overrides (B1–B4; residual admin-global → C5)
│
├── admin/
│   └── styles/                    # Admin styles (C6: layout ADMIN-ONLY + themes + global on semantic)
│       ├── admin.scss             # Admin entry (angular.json)
│       ├── _admin-layout-tokens.scss  # ADMIN-ONLY structural (C2 / ADR-011)
│       ├── _admin-root-defaults.scss  # Dashboard/MDC defaults (C6)
│       ├── material-theme.scss    # Material theme entry — token palettes + CSS bridge (B4)
│       ├── admin-global.scss      # Orchestrator → global/*
│       ├── admin-mixins.scss      # Semantic mixins (C6)
│       ├── _admin-light.scss
│       ├── _admin-dark.scss
│       ├── _admin-glass.scss
│       ├── _admin-dark-glass.scss
│       ├── _admin-material-base.scss  # Shim (B4: core/themes in material-theme.scss)
│       ├── global/                # C5 partials
│       └── (removed) admin-variables.scss  # C6 shim deleted
│       └── (removed) _admin-theme-material.scss  # Migrated B2 → overrides/_material-overrides.scss
│
└── app/                           # Component styles (local only)
    └── **/*.component.scss
```

### Rules

- Partial files are prefixed with `_` and are never imported directly by components
- `_index.scss` files serve as the single import point for each module
- Component styles (under `src/app/`) are local and never imported globally
- Admin styles may reuse shared tokens; layout ADMIN-ONLY isolated in `_admin-layout-tokens.scss` (C2); C3 themes map semantic+layout; C4 components on semantic; shim delete C6; `admin-global` → C5
- `main.scss` contains imports only — no CSS rules

---

## 3. Style Hierarchy and Import Order

The import order in `src/styles/main.scss` is strict and must be preserved:

```scss
/* 1. Tokens — theme-independent design tokens */
@import './tokens/index';

/* 2. Themes — theme-dependent CSS variables (before components) */
@import './themes/index';

/* 3. Core — variables, mixins, base, typography, utilities, scrollbars */
@import './core/index';

/* 4. Component presets — global component styles */
@import './components/index';

/* 5. Material / MDC / CDK overrides (ADR-005) */
@import './overrides/index';
```

**Why this order matters**:

- Tokens define the vocabulary
- Themes assign values to tokens (and legacy aliases)
- Core establishes baseline styles and may consume tokens
- Component presets consume both tokens and theme variables
- Material overrides load last among shared styles so token-driven rules win over Material defaults

---

## 4. CSS Variable Hierarchy

### 4.1 Variable Naming Convention

```
--<category>-<name>-<modifier>

Categories:
  bg        — background colors
  text      — text colors
  border    — border colors
  surface   — surface/elevated backgrounds
  accent    — accent/highlight colors
  shadow    — box-shadow values
  radius    — border-radius values
  spacing   — padding/margin values
  font      — typography values
  z         — z-index values
  duration  — animation durations
  easing    — timing functions
  blur      — backdrop-filter blur values
  gradient  — gradient definitions
```

### 4.2 Variable Scope Levels

| Level | Selector | Purpose | Examples |
|-------|----------|---------|----------|
| **Global** | `:root` | Theme-independent tokens | `--spacing-md`, `--radius-sm` |
| **Theme** | `[data-theme="*"]` | Theme-dependent values | `--bg-primary`, `--text-heading` |
| **Component** | `.component-name` | Component-specific overrides (rare) | `--card-inner-radius` |

### 4.3 Variable Definition Rules

1. **Primitives** are defined ONCE in `src/styles/tokens/_primitive-tokens.scss`
2. **Semantic tokens** map context in `src/styles/tokens/_semantic-tokens.scss`
3. **Theme variables** are defined in each theme's SCSS partial under `[data-theme="<name>"]`
4. **Component variables** are forbidden unless approved by the UI Architect
5. A variable defined at a higher scope shadows lower-scope definitions of the same name

---

## 5. Theme Hierarchy

```
Theme (abstract)
│
├── Appearance Dimension
│   ├── colors (palette, surfaces, text)
│   ├── gradients
│   └── glass effects
│
├── Shape Dimension
│   ├── radius (border-radius scale)
│   ├── spacing (padding/margin scale)
│   └── density (compact, default, comfortable)
│
├── Elevation Dimension
│   ├── shadows (elevation style)
│   └── borders (border presence/weight)
│
├── Typography Dimension
│   ├── font-family
│   ├── font-weights
│   └── letter-spacing
│
├── Motion Dimension
│   ├── durations (`--motion-duration-*`, `--duration-*` primitives)
│   ├── easing curves (`--motion-easing-*`, `--easing-*` primitives)
│   ├── composite transitions (`--transition-*`)
│   ├── page transitions (`--page-transition-*`)
│   └── micro-interactions (`--micro-*`) — hover, focus, spinner
│
│   → Full reference: **§14 Animation & Motion System**
│
└── Layout Dimension
    ├── sidebar style
    ├── header behavior
    └── navigation pattern
```

Each theme partial defines CSS variables for ALL dimensions, even if it inherits most values from a base theme. This ensures each theme is self-contained and swappable.

---

## 6. Angular Material Integration

### 6.1 Override Strategy

Central file: `src/styles/overrides/_material-overrides.scss` (wired via `overrides/_index.scss` in `main.scss`). B2 migrated the admin dump onto semantic/bridge tokens. B3 cleared all `.mat-` / `.mdc-` from admin `*.component.scss` (unique rules → host-scoped B3 section). B4 bound Material Sass palettes + MDC CSS slots to design tokens (`material-theme.scss` + `tokens/_material-palettes.scss`). Residual: `admin-global.scss` / theme-file `.mat-` → C5.

See `docs/migration/_admin-theme-material-migration.md`, `_b3-component-mat-migration.md`, `_b4-material-theme-tokens.md`.

**Rules**:

1. Never override Material styles inside a component's SCSS file
2. All Material overrides use semantic CSS variables, not hardcoded values
3. Overrides are scoped to the Material component's generated class names
4. Density overrides use Angular Material's built-in density API where possible

### 6.2 Override Pattern

```scss
// CORRECT — Centralized, token-driven
.mat-raised-button {
  background-color: var(--accent-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

// FORBIDDEN — Component-level Material override
.app-button ::ng-deep .mat-raised-button {
  background-color: #1976d2;
}
```

### 6.3 Material Palette Generation

Material themes are generated from design-token palettes (B4), not stock indigo/pink:

1. Sass maps in `src/styles/tokens/_material-palettes.scss` mirror primitive brand/accent/error hex
2. `material-theme.scss` builds light/dark Material themes from those maps
3. `material-color-bridge` remaps MDC/Mat CSS custom properties → semantic tokens (`--interactive-primary`, …) so runtime token changes update Material components
4. Selector-level chrome stays in `_material-overrides.scss` (ADR-005)
---

## 7. Design Token Flow

```
Token Definition          Theme Assignment           Component Consumption
─────────────────        ────────────────           ─────────────────────
                         ┌──────────────────┐
:root {                  │ [data-theme="x"] │  .my-component {
  --spacing-md: 16px;    │   --bg-primary:   │    background: var(--bg-primary);
}                         │   #ffffff;        │    padding: var(--spacing-md);
                         │ }                 │ }
┌──────────────────┐     └──────────────────┘
│ _primitive-      │            ▲
│ tokens.scss      │            │  Theme service sets
│ + _semantic-     │            │  data-theme attribute
│ tokens.scss      │───────────┘
│                  │
└──────────────────┘
```

**Flow**:

1. Design tokens are defined as CSS custom properties on `:root`
2. Each theme partial redefines the subset of tokens that change per-theme
3. Components consume tokens via `var(--token-name)` — no awareness of theme needed
4. Theme switching changes the `[data-theme]` attribute, which reassigns variable values

---

## 8. Override Rules

### 8.1 Specificity Hierarchy (lowest to highest)

| Priority | Selector Type | Example |
|----------|--------------|---------|
| 1 | Global base | `body { color: var(--text-body); }` |
| 2 | Component preset | `.app-card { border-radius: var(--radius-md); }` |
| 3 | Component local | `:host { ... } .card-title { ... }` |
| 4 | Theme override | `[data-theme="dark"] .app-card { ... }` |
| 5 | State modifier | `.app-card--featured { ... }` |

### 8.2 Forbidden Override Techniques

| Technique | Reason | Alternative |
|-----------|--------|-------------|
| `!important` | Breaks cascade; masks wrong selectors | **FORBIDDEN** — specificity / `--mat-*`/`--mdc-*` tokens / correct layer |
| Inline styles in templates | Cannot use CSS variables reliably | Use CSS classes |
| `style` attribute in TS code | Bypasses entire theme system | Toggle CSS classes |
| Defining CSS variables in components | Creates scope confusion | Define in tokens or themes |

---

## 9. Forbidden Patterns

### 9.1 Hardcoded Values

```scss
// FORBIDDEN
.color { color: #333; }
.padding { padding: 16px; }
.rounded { border-radius: 8px; }
.shadow { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
```

### 9.2 Duplicate Definitions

```scss
// FORBIDDEN — Defining tokens in multiple files
// File A: src/styles/tokens/_theme-variables.scss
--bg-primary: #fff;

// File B: src/styles/themes/_default.scss
--bg-primary: #ffffff;  // Duplicate!
```

### 9.3 Component Coupling

```scss
// FORBIDDEN — One component importing another's styles
@use '../other-component/other-component.scss';
```

### 9.4 Global Leakage

```scss
// FORBIDDEN — Unintentional global styles in component file
body { margin: 0; }  // This leaks globally due to Angular encapsulation

// CORRECT — Scoped to host
:host {
  display: block;
}
```

---

## 10. Migration Strategy

### Current State → Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Token definitions | ✅ Primitive + semantic pipeline | Keep single-source primitives |
| Theme variables | ✅ Per-theme partials (`_default`/`_dark`/`_glass`) | ✅ TS `ThemeDefinition` synced (Epic F) |
| Admin styles | C6: shim deleted; mixins semantic; 5 ADMIN-ONLY layout; M2 = 0 non-layout | Shared tokens + admin layout only |
| Material overrides | Component `.mat-` cleared (B3); palette↔tokens (B4); residual admin-global/themes | All rules in `_material-overrides.scss` + token bridge (Epic B ✅; C5 residual) |
| Hardcoded colors | Present in many components | Zero — all use tokens (Epic D) |
| CSS vs SCSS variables | Mixed usage | CSS custom properties preferred |
| Style entry | ✅ `src/styles/main.scss` (imports only) | Keep; never append CSS rules |

### Migration Phases

See `REDESIGN_PLAN.md` for the detailed phased migration plan.

### Rollback Strategy

Each migration phase is independent and reversible. If a phase introduces regressions:

1. Revert the specific files changed in that phase
2. Document the regression in `UI_AUDIT.md`
3. Create a sub-task to address the regression before retrying

---

## 11. Contract Enforcement

This section defines how the architectural contract (established in `AI_CONSTITUTION.md §4`) is enforced during development, code review, and CI.

### 11.1 Pre-Merge Checklist

Before any PR touching styles is merged, the reviewer verifies:

- [ ] No hardcoded colors, spacing, radius, or shadows in component styles
- [ ] No new global CSS variables declared outside `src/styles/themes/` or `src/styles/tokens/`
- [ ] No `!important` usage (absolute ban — see `.cursor/rules/no-important.mdc`)
- [ ] No `::ng-deep` in component styles (Material overrides use centralized file only)
- [ ] No inline `style=` bindings with design values in templates
- [ ] Component styles reference semantic tokens exclusively via `var(--semantic-*)` or `var(--<category>-<name>)`
- [ ] `npm run build` succeeds with zero errors

### 11.2 Automated Checks (Recommended)

When CI is available, enforce these patterns via lint rules:

```
# Example CSS lint rules (stylelint)
no-invalid-position-at-import-rule: true
color-nomenclature: /^var\(--/          # Reject hardcoded colors
declaration-no-unknown: true            # Catch typos in variable names
```

### 11.3 Violation Handling

| Severity | Example | Action |
|----------|---------|--------|
| **Critical** | Hardcoded colors in shared components | Block merge, require immediate fix |
| **High** | `!important` usage, new global variables | Block merge, require fix |
| **Medium** | Missing token reference (uses SCSS $var instead of CSS var) | Flag for fix within same sprint |
| **Low** | Documentation not updated after style changes | Note in PR comments, track as follow-up |

### 11.4 Audit Trail

Every contract violation that is caught and fixed must be logged in `UI_AUDIT.md` under a "Contract Violations" appendix with:

- Date detected
- File(s) involved
- Violation type
- Resolution applied
- Who/what detected it (human review, AI agent, CI)

This audit trail enables pattern analysis to prevent recurring violations.

---

## 12. Angular ViewEncapsulation: Theme Selector Anti-Pattern

> **Added**: 2026-07-14 | **Discovered in**: Task-015

### 12.1 The Problem

Angular uses `ViewEncapsulation.Emulated` by default. This adds a unique attribute (e.g., `_ngcontent-xxx-c42`) to every element in the component. Nested theme selectors inside component SCSS **break silently**:

```scss
// ❌ WRONG — dashboard.component.scss
.stat-card {
  [data-theme="glass"] & {
    background: rgba(255, 255, 255, 0.2); // This rule is NEVER applied!
  }
}
// Angular compiles this to:
// [data-theme="glass"] .stat-card[_ngcontent-xxx-c42] { ... }
// But `data-theme` is on <html>, not a parent of the emulated scope
// → selector never matches → style silently dropped
```

### 12.2 The Solution

Always use **theme-driven CSS variables** consumed by the component:

```scss
// ✅ CORRECT — _admin-glass.scss (or any global theme file)
[data-theme="glass"] {
  --dashboard-stat-card-bg: rgba(255, 255, 255, 0.2);
  --dashboard-stat-card-blur: blur(15px) saturate(150%);
}

// ✅ CORRECT — dashboard.component.scss
.stat-card {
  background-color: var(--dashboard-stat-card-bg, var(--admin-bg-secondary));
  backdrop-filter: var(--dashboard-stat-card-blur, none);
}
```

### 12.3 When This Pattern Is Safe

| Context | Safe? | Reason |
|---------|-------|--------|
| `admin-global.scss` (global file) | ✅ Yes | No encapsulation — rules applied globally |
| `_admin-glass.scss` (global file) | ✅ Yes | No encapsulation — rules applied globally |
| `component.scss` with `[data-theme="glass"] &` | ❌ NO | Angular encapsulation breaks selector |
| `component.scss` with `:host-context([data-theme])` | ✅ Yes | Angular-aware selector, works with emulation |

**Alternative**: If you must use component-scope theme selectors, use `:host-context()`:
```scss
// ✅ Also correct (Angular-native approach):
:host-context([data-theme="glass"]) {
  .stat-card {
    background: rgba(255, 255, 255, 0.2);
  }
}
```
But prefer CSS variables as they scale better across themes.

---

## 13. Admin Panel Token Namespace

### 13.1 Separation Model (ADR-011 / C6)

Admin consumes **shared semantic tokens**. Only **layout** tokens keep the `--admin-*` prefix.

| File | Purpose |
|------|---------|
| `src/admin/styles/_admin-layout-tokens.scss` | 5 ADMIN-ONLY layout tokens (sidebar, toolbar, paddings) |
| `src/admin/styles/_admin-root-defaults.scss` | Dashboard/MDC root defaults (C6; ex-shim leftovers) |
| `src/admin/styles/_admin-{light,dark,glass,dark-glass}.scss` | Admin theme chrome / semantic promotions |
| `src/admin/styles/admin-global.scss` + `global/` | Global admin styles — semantic only |
| ~~`admin-variables.scss`~~ | Deleted in C6 |

### 13.2 Token Naming for Admin Components

For **page-level** tokens (e.g., dashboard-specific), define defaults in `_admin-root-defaults.scss` and override in themes:
```scss
// In _admin-root-defaults.scss (:root):
--dashboard-stat-card-bg: var(--surface-secondary);
--stat-icon-products: var(--color-success);

// In _admin-glass.scss ([data-theme="glass"]):
--dashboard-stat-card-bg: /* glass recipe */;
--stat-icon-products: #ffffff;
```

This follows the pattern: **define in theme/root, consume in component**.

### 13.3 Known Token Groups

| Token Group | Variables | Defined In |
|-------------|-----------|------------|
| Layout (ADMIN-ONLY) | `--admin-sidebar-width`, `--admin-toolbar-height`, `--admin-content-padding`, mobile paddings | `_admin-layout-tokens.scss` |
| Surfaces / text / borders | semantic `--surface-*`, `--text-*`, `--border-*` | tokens + admin themes |
| Glass surfaces | `--glass-surface-*`, `--glass-border-*`, `--surface-chrome*` | semantic + `_admin-glass.scss` |
| Dashboard cards | `--dashboard-stat-card-*` | `_admin-root-defaults.scss` + themes |
| Stat icons | `--stat-icon-*` | `_admin-root-defaults.scss` + themes |
| Material tokens | `--mdc-*`, `--mat-*` | All admin theme files |
| Motion / animation | `--motion-*`, `--transition-*`, `--page-transition-*`, `--micro-*`, `--modal-*` | `_primitive-tokens.scss` → `_semantic-tokens.scss` → theme partials; see **§14** |

---

## 14. Animation & Motion System

**Epic G1, G13, G14, G15** — token-driven motion language shared by all storefront themes. Admin reuses the same semantic motion tokens unless a theme partial overrides them.

**Last documented**: 2026-08-05

### 14.1 Token layers

Motion values flow bottom-up. Components and partials consume semantic/feature tokens — never hardcoded durations or cubic-bezier values.

```
_primitive-tokens.scss          _semantic-tokens.scss           theme partials
─────────────────────          ─────────────────────           ──────────────
--duration-instant: 0ms         --motion-duration-*             [data-theme="dark"] {
--duration-fast: 150ms          --motion-easing-*                 --motion-duration-normal: 220ms;
--duration-normal: 300ms        --transition-*                    --page-transition-offset-y: …;
--duration-slow: 500ms          --page-transition-*               --micro-hover-lift-y: …;
--easing-default: ease          --micro-*                       }
--easing-enter: cubic-bezier…   --modal-enter-*                 [data-theme="glass"] { … }
--easing-leave: cubic-bezier…   --form-focus-ring → --micro-focus-ring
```

| Layer | Prefix | Defined in | Purpose |
|-------|--------|------------|---------|
| Primitives | `--duration-*`, `--easing-*` | `tokens/_primitive-tokens.scss` | Raw timing scale |
| Motion core | `--motion-*`, `--transition-*` | `tokens/_semantic-tokens.scss` | Shared duration/easing + shorthand transitions |
| Page routes | `--page-transition-*` | semantic + `themes/_*.scss` | Storefront route enter animation |
| Micro UI | `--micro-*` | semantic + `themes/_*.scss` | Hover, focus, press, spinner accents |
| Modals | `--modal-enter-*`, `--modal-leave-*` | semantic | Backdrop/panel enter (G9) |

### 14.2 SCSS partials (implementation map)

| File | Epic | Responsibility |
|------|------|----------------|
| `_motion.scss` | G1 | Shared `@keyframes` (`motion-fade-in`, `motion-fade-in-up`, `motion-spin`, `motion-shimmer`) + utility classes `.animate-*`, `.transition-surface` |
| `_micro-interactions.scss` | G14 | Focus/hover/press utilities: `.micro-focus-ring`, `.micro-interactive`, `.micro-icon-btn`; aliases `.hover-lift`, `.transition-interactive` |
| `_page-transitions.scss` | G13 | `.storefront-main.is-page-entering > router-outlet + *` route enter |
| `_loading.scss` | G3 | Spinner ring uses `--micro-spinner-*`; skeleton uses `motion-shimmer` |
| `_modals.scss` | G9 | `motion-modal-backdrop-in`, `motion-modal-panel-in` |
| `_cards.scss`, `_checkout.scss`, `_product-detail.scss`, … | G4–G12 | Feature enter animations referencing `--motion-duration-normal` + `--motion-easing-enter` |

**Trigger (routes)**: `app.component.html` — `(activate)` on `<router-outlet>` toggles `.is-page-entering` on `.storefront-main`. Skipped for admin, `/viewer`, and the initial page load.

### 14.3 Keyframes catalog

| Keyframe | Partial | Animated properties | Typical use |
|----------|---------|---------------------|-------------|
| `motion-fade-in` | `_motion.scss` | `opacity` | Empty states, panels |
| `motion-fade-in-up` | `_motion.scss` | `opacity`, `translateY` | Product cards grid, PDP sections |
| `motion-spin` | `_motion.scss` | `transform: rotate` | Loading spinner ring |
| `motion-shimmer` | `_motion.scss` | `background-position` | Skeleton placeholders |
| `motion-page-enter` | `_page-transitions.scss` | `opacity`, `translate3d` | Route enter (storefront) |
| `motion-modal-backdrop-in` | `_modals.scss` | `opacity` | Modal backdrop |
| `motion-modal-panel-in` | `_modals.scss` | `opacity`, `scale`, `translateY` | Modal panel |
| `checkout-progress` | `_checkout.scss` | `width` | Payment pending bar (scoped) |

**Rule**: New keyframes belong in the relevant global partial (`_motion.scss` if shared). Animate **only** `opacity` and `transform` (prefer `translate3d` / `scale`) for GPU compositing. Do not animate `width`, `height`, `top`, `left`, or `margin` except for existing scoped cases (e.g. progress bars).

### 14.4 Utility classes

| Class | Behavior |
|-------|----------|
| `.animate-fade-in` | One-shot fade using motion tokens |
| `.animate-fade-in-up` | Fade + upward slide |
| `.animate-spin` | Continuous rotation |
| `.micro-focus-ring` | `:focus-visible` → `box-shadow: var(--micro-focus-ring)` |
| `.micro-focus-outline` | `:focus-visible` → outline using `--micro-focus-outline-*` |
| `.micro-hover-lift` | Hover: `translate3d` + shadow |
| `.micro-interactive` | Hover lift + active press scale |
| `.micro-icon-btn` | Circular action button preset (card overlays) |
| `.hover-lift` | Alias → `.micro-hover-lift` (G1 compat) |
| `.transition-interactive` | Alias → `--micro-transition` property set |

Prefer `@extend .micro-interactive` / `.micro-focus-ring` in global partials over duplicating hover/focus blocks in component SCSS.

### 14.5 Theme animation presets

Baseline primitives (`--duration-normal: 300ms`, `--easing-enter: cubic-bezier(0.22, 1, 0.36, 1)`) apply to **light/default**. Dark and glass override the motion **personality** in their theme partials.

| Preset | Personality | Duration scale | Page enter | Micro hover | Focus ring | Spinner |
|--------|-------------|----------------|------------|-------------|------------|---------|
| **light / default** | Snappy, neutral | 300ms normal | `--spacing-md` lift | `1.02` scale, xs lift | Primary @ 22% | 3px, slow |
| **dark** | Fast, minimal | 120ms fast / 220ms normal | `--spacing-xs` lift | `1.015` scale, 2xs lift | Blue `#60a5fa` @ 28% | normal duration |
| **glass** | Elegant, fluid | 400ms normal / 600ms slow | `--spacing-lg` lift | `1.04` scale, sm lift | Primary @ 30% | slow, glass track |
| **dark-glass** (admin) | Inherits dark motion + glass form focus | — | N/A (admin) | — | `@ 22%` in forms block | — |

Theme override locations:

- `src/styles/themes/_default.scss` — light baseline + page/micro defaults
- `src/styles/themes/_dark.scss` — `--motion-duration-*`, `--page-transition-*`, `--micro-*`
- `src/styles/themes/_glass.scss` — longer durations, elegant easing, larger lifts

When adding a theme, override **only** the tokens whose personality differs — do not copy entire partials.

### 14.6 Accessibility & performance

**Reduced motion** (required):

1. Global fallback in `core/_base.scss` — `@media (prefers-reduced-motion: reduce)` sets all animation/transition durations to `0.01ms`.
2. Feature partials additionally disable specific animations where a static fallback is clearer (`_page-transitions.scss`, `_modals.scss`, `_product-detail.scss`, card hovers wrapped in `@media (prefers-reduced-motion: no-preference)`).

**Performance checklist**:

- ✅ Animate `opacity` + `transform` only (composite-friendly)
- ✅ Use `translate3d(0, …, 0)` for vertical motion
- ✅ Set `will-change: opacity, transform` only on short-lived enter animations (page transition); remove or avoid on persistent elements
- ❌ No `!important` to win animation conflicts — fix selector ownership
- ❌ No `@angular/animations` for route transitions — CSS tokens + outlet class keeps themes swappable without TS duration logic
- ❌ No inline `style="transition:…"` or hardcoded `300ms ease` in components

### 14.7 Adding motion to new UI

1. **Enter animation** — use existing keyframe + tokens:
   ```scss
   .my-panel {
     animation: motion-fade-in-up var(--motion-duration-normal) var(--motion-easing-enter) both;
   }
   ```
2. **Interactive control** — extend micro utilities in a global partial:
   ```scss
   .my-cta {
     @extend .micro-interactive;
     @extend .micro-focus-ring;
   }
   ```
3. **Theme-specific feel** — add overrides to `themes/_<name>.scss`, not the component:
   ```scss
   [data-theme='glass'] {
     --micro-hover-lift-y: calc(var(--spacing-sm) * -1);
   }
   ```
4. **New shared keyframe** — add to `_motion.scss`, reference via semantic tokens in consumers.

### 14.8 Related docs

- `docs/THEME_ENGINE.md` §7 — motion dimension in theme metadata
- `docs/REFACTORING_BOARD.md` — Epic G tasks G1, G13, G14, G15
- `docs/REDESIGN_PLAN.md` Phase 8 — animation system goals
- `.cursor/rules/no-important.mdc` — cascade rules for interactive states

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-08-05 (G15: animation system documented)*

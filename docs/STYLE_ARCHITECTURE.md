# Style Architecture — angular-ecommerce-3d

This document defines the complete style architecture for the application. It is the single source of truth for how styles are organized, how themes work, how tokens flow, and how Angular Material is integrated.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-28

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
│   │   └── _semantic-tokens.scss  # Contextual mappings for components
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
│   │   ├── _cards.scss
│   │   ├── _forms.scss            # stub (Epic E)
│   │   ├── _modals.scss           # stub (Epic E)
│   │   ├── _navigation.scss       # stub (Epic E)
│   │   ├── _theme-switcher.scss
│   │   └── _glass-helpers.scss    # .glass-theme, cart controls, .theme-price
│   │
│   └── overrides/                 # Third-party / Material overrides (ADR-005)
│       ├── _index.scss            # Re-exports overrides module
│       └── _material-overrides.scss  # Central Material overrides (B2 dump migrated; B3–B4 remain)
│
├── admin/
│   └── styles/                    # Admin-specific styles (parallel --admin-* until Epic C)
│       ├── admin.scss             # Admin entry (angular.json)
│       ├── material-theme.scss    # Material palette entry (angular.json)
│       ├── admin-global.scss
│       ├── admin-variables.scss
│       ├── admin-mixins.scss
│       ├── _admin-light.scss
│       ├── _admin-dark.scss
│       ├── _admin-glass.scss
│       ├── _admin-dark-glass.scss
│       ├── _admin-material-base.scss
│       └── (removed) _admin-theme-material.scss  # Migrated B2 → overrides/_material-overrides.scss
│
└── app/                           # Component styles (local only)
    └── **/*.component.scss
```

### Rules

- Partial files are prefixed with `_` and are never imported directly by components
- `_index.scss` files serve as the single import point for each module
- Component styles (under `src/app/`) are local and never imported globally
- Admin styles may reuse shared tokens but currently keep a parallel `--admin-*` namespace (Epic C)
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
│   ├── durations
│   ├── easing curves
│   └── transition preferences
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

Central file: `src/styles/overrides/_material-overrides.scss` (wired via `overrides/_index.scss` in `main.scss`). B2 migrated the admin dump onto semantic/bridge tokens (`--input-*`, `--surface-table-*`, …). Scattered component `.mat-` rules remain until B3; `material-theme.scss` palette binding is B4.

See `docs/migration/_admin-theme-material-migration.md` for the remap table.

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

Angular Material's prebuilt theme system is used for base theming. Custom overrides layer on top:

1. Load Angular Material prebuilt theme (or generate via SCSS functions)
2. Apply theme-specific CSS variables that override Material defaults
3. Use `::ng-deep` sparingly, only when Material's API doesn't expose the needed customization

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
| `!important` | Breaks cascade predictability | Increase specificity properly |
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
| Theme variables | ✅ Per-theme partials (`_default`/`_dark`/`_glass`) | Maintain; sync TS model (Epic F) |
| Admin styles | Parallel `--admin-*` system | Shared tokens, admin layout only (Epic C) |
| Material overrides | Central dump in `overrides/` (B2); component `.mat-` remain (B3) | All rules in `_material-overrides.scss` (Epic B) |
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
- [ ] No `!important` usage (unless explicitly documented and approved)
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

### 13.1 Separation Model

Admin panel uses `--admin-*` prefix to isolate from storefront. Key files:

| File | Purpose |
|------|---------|
| `src/admin/styles/admin-variables.scss` | `:root` fallback values for all `--admin-*` and component-specific tokens |
| `src/admin/styles/_admin-glass.scss` | `[data-theme="glass"]` overrides for admin |
| `src/admin/styles/_admin-dark.scss` | `[data-theme="dark"]` overrides for admin |
| `src/admin/styles/_admin-light.scss` | `[data-theme="light"]` overrides for admin |
| `src/admin/styles/admin-global.scss` | Global admin component styles — consume tokens only |

### 13.2 Token Naming for Admin Components

For **page-level** tokens (e.g., dashboard-specific), use a component prefix:
```scss
// In admin-variables.scss (:root):
--dashboard-stat-card-bg: var(--admin-bg-secondary);    // fallback
--stat-icon-products: var(--admin-success);              // fallback

// In _admin-glass.scss ([data-theme="glass"]):
--dashboard-stat-card-bg: rgba(255, 255, 255, 0.2);     // override
--stat-icon-products: #ffffff;                           // override
```

This follows the pattern: **define in theme file, consume in component**.

### 13.3 Known Token Groups

| Token Group | Variables | Defined In |
|-------------|-----------|------------|
| Layout | `--admin-bg-*`, `--admin-text-*`, `--admin-border-*` | `admin-variables.scss` |
| Glass surfaces | `--admin-glass-surface-*`, `--admin-glass-border-*`, `--admin-glass-shadow*` | `_admin-glass.scss` |
| Dashboard cards | `--dashboard-stat-card-*` | `admin-variables.scss` + `_admin-glass.scss` |
| Stat icons | `--stat-icon-*` | `admin-variables.scss` + `_admin-glass.scss` |
| Admin header | `--admin-header-*` | `admin-variables.scss` + `_admin-glass.scss` (Task-020) |
| Material tokens | `--mdc-*`, `--mat-*` | All admin theme files |

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-28 (B2: Material dump → overrides, Bridge tokens)*

# Style Architecture — angular-ecommerce-3d

This document defines the complete style architecture for the application. It is the single source of truth for how styles are organized, how themes work, how tokens flow, and how Angular Material is integrated.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-06

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

```
src/
├── styles.scss                    # Main entry (angular.json)
├── styles/
│   ├── main.scss                  # Master import file (imported by styles.scss)
│   │
│   ├── core/                      # Global resets and base styles
│   │   ├── _index.scss            # Re-exports core module
│   │   ├── _reset.scss            # CSS reset / normalize
│   │   ├── _base.scss             # Base element styles (html, body, etc.)
│   │   └── _typography.scss       # Typography scale and utilities
│   │
│   ├── tokens/                    # Design tokens (theme-independent)
│   │   ├── _index.scss            # Re-exports token module
│   │   ├── _design-tokens.scss    # Canonical token definitions
│   │   └── _functions.scss        # SCSS helper functions
│   │
│   ├── themes/                    # Theme definitions (theme-dependent)
│   │   ├── _index.scss            # Re-exports all themes
│   │   ├── _default.scss          # Default/light theme
│   │   ├── _dark.scss             # Dark theme
│   │   ├── _glass.scss            # Glass theme
│   │   └── _<name>.scss           # Additional themes
│   │
│   ├── components/                # Global component style presets
│   │   ├── _buttons.scss          # Button base styles
│   │   ├── _cards.scss            # Card base styles
│   │   ├── _forms.scss            # Form element styles
│   │   ├── _modals.scss           # Modal/dialog base styles
│   │   ├── _navigation.scss       # Navigation base styles
│   │   ├── _theme-switcher.scss   # Theme switcher styles
│   │   └── _empty-states.scss     # Empty state patterns
│   │
│   ├── material/                  # Angular Material overrides
│   │   ├── _overrides.scss        # Centralized Material overrides
│   │   └── _density.scss          # Material density adjustments
│   │
│   └── utilities/                 # Utility classes and mixins
│       ├── _mixins.scss           # Reusable SCSS mixins
│       └── _helpers.scss          # Utility classes
│
├── admin/
│   └── styles/                    # Admin-specific styles (extends shared)
│       ├── admin.scss             # Admin entry point
│       ├── _admin-layout.scss     # Admin layout overrides
│       └── _admin-theme-*.scss    # Admin theme variants
│
└── app/                           # Component styles (local only)
    ├── component/
    │   └── component.scss         # Component-local styles
```

### Rules

- Partial files are prefixed with `_` and are never imported directly by components
- `_index.scss` files serve as the single import point for each module
- Component styles (under `src/app/`) are local and never imported globally
- Admin styles may extend shared tokens but define their own layout rules

---

## 3. Style Hierarchy and Import Order

The import order in `src/styles/main.scss` is strict and must be preserved:

```scss
/* 1. Core — resets and base */
@use 'core/index';

/* 2. Tokens — theme-independent design tokens */
@use 'tokens/index';

/* 3. Themes — theme-dependent CSS variables */
@use 'themes/index';

/* 4. Material overrides — must come after themes */
@use 'material/overrides';

/* 5. Component presets — global component styles */
@use 'components/buttons';
@use 'components/cards';
@use 'components/forms';
@use 'components/navigation';

/* 6. Utilities — mixins and helper classes */
@use 'utilities/mixins';
@use 'utilities/helpers';
```

**Why this order matters**:

- Core establishes the baseline
- Tokens define the vocabulary
- Themes assign values to tokens
- Material overrides need theme variables available
- Component presets consume both tokens and theme variables
- Utilities are last (they may reference anything above)

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

1. **Global variables** are defined ONCE in `src/styles/tokens/_design-tokens.scss`
2. **Theme variables** are defined in each theme's SCSS partial under `[data-theme="<name>"]`
3. **Component variables** are forbidden unless approved by the UI Architect
4. A variable defined at a higher scope shadows lower-scope definitions of the same name

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

Angular Material components are overridden through a centralized file: `src/styles/material/_overrides.scss`

**Rules**:

1. Never override Material styles inside a component's SCSS file
2. All Material overrides use theme CSS variables, not hardcoded values
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
│ _design-tokens   │            ▲
│ .scss            │            │  Theme service sets
│                  │            │  data-theme attribute
│ --spacing-md:    │───────────┘
│   16px;          │
│ --radius-md:     │
│   8px;           │
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
| Token definitions | Scattered across 4+ files | Single `_design-tokens.scss` |
| Theme variables | Monolithic 723-line file | Per-theme partials |
| Admin styles | Completely separate | Shared tokens, admin-specific layouts |
| Material overrides | Scattered in components | Centralized `_overrides.scss` |
| Hardcoded colors | Present in many components | Zero — all use tokens |
| CSS vs SCSS variables | Mixed usage | CSS custom properties preferred |

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

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-06*

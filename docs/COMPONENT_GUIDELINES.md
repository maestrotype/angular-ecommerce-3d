# Component Styling Guidelines

Patterns and rules for styling Angular components in this project. This document ensures visual consistency across the codebase and proper integration with the theme engine.

**Related**: [STYLE_ARCHITECTURE.md](STYLE_ARCHITECTURE.md) (architecture), [THEME_ENGINE.md](THEME_ENGINE.md) (theme tokens)

---

## Table of Contents

- [General Principles](#general-principles)
- [Component SCSS Structure](#component-scss-structure)
- [Token Usage Rules](#token-usage-rules)
- [Angular Material Overrides](#angular-material-overrides)
- [Component Category Patterns](#component-category-patterns)
- [Forbidden Patterns](#forbidden-patterns)
- [Accessibility Requirements](#accessibility-requirements)

---

## General Principles

### 1. Everything Flows from Tokens

Components must NEVER use hardcoded visual values. Every color, spacing, radius, shadow, or typography value must come from a CSS custom property (design token).

```scss
// CORRECT
.my-component {
    background: var(--surface-primary);
    color: var(--text-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    box-shadow: var(--elevation-2);
}

// FORBIDDEN
.my-component {
    background: #ffffff;
    color: #1a1a2e;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 2. View Encapsulation Strategy

Components use `ViewEncapsulation.ShadowDom` equivalent through Angular's default `Emulated` encapsulation. SCSS styles are scoped to the component by default.

When global style penetration is absolutely necessary (e.g., Angular Material overrides, 3D viewer), use `::ng-deep` sparingly and document the reason.

### 3. BEM-like Naming Convention

Within component SCSS files, use a simplified BEM convention for complex components with multiple internal elements:

```scss
.product-card {
    &__header {
        display: flex;
        justify-content: space-between;
    }

    &__price {
        font-weight: var(--font-weight-bold);
        color: var(--accent-primary);
    }

    &--featured {
        border: 2px solid var(--accent-primary);
    }
}
```

---

## Component SCSS Structure

Every component SCSS file should follow this internal structure:

```scss
// 1. IMPORTS (if needed - prefer inheriting from parent module)
@use 'sass:math';

// 2. HOST LAYOUT (positioning the component in its parent)
:host {
    display: block;
    padding: var(--spacing-lg);
}

// 3. MAIN CONTAINER
.component-name {
    // Base styles using tokens
}

// 4. INTERNAL ELEMENTS (BEM elements)
.component-name__element {
    // Element styles
}

// 5. MODIFIERS (BEM modifiers)
.component-name--modifier {
    // Modifier styles
}

// 6. STATE VARIATIONS (:hover, :focus, :active)
.component-name {
    &:hover {
        // Hover states
    }

    &:focus-visible {
        outline: 2px solid var(--accent-primary);
        outline-offset: 2px;
    }
}

// 7. RESPONSIVE ADJUSTMENTS
@media (max-width: 768px) {
    .component-name {
        // Mobile adjustments - use tokens where possible
    }
}

// 8. ANIMATIONS (if component-specific)
@keyframes componentNameAnimation {
    from { /* ... */ }
    to   { /* ... */ }
}
```

---

## Token Usage Rules

### Hierarchy Reference

Components consume tokens at the **functional level**, never at the raw/primitive level.

| Level | Example Token | Used By |
|-------|---------------|---------|
| **Primitive** | `--color-blue-500`, `--size-4` | Theme authors only |
| **Functional** | `--accent-primary`, `--surface-card` | **Components consume these** |
| **Component** | `--product-card-padding` | Rare - only for component-specific overrides |

### Allowed Token Categories per Context

| Styling Context | Use These Tokens |
|----------------|------------------|
| **Backgrounds** | `--surface-*`, `--bg-*` |
| **Text** | `--text-*`, `--accent-*` |
| **Borders** | `--border-*`, `--accent-*` |
| **Spacing** | `--spacing-xs` through `--spacing-3xl` |
| **Radius** | `--radius-none` through `--radius-full` |
| **Shadows** | `--elevation-*`, `--shadow-*` |
| **Typography** | `--font-*`, `--text-*size*`, `--line-height-*` |
| **Transitions** | `--transition-*` |

### Fallback Values

Every CSS variable used in components MUST have a fallback value defined in the theme SCSS. Components should NOT define their own fallbacks inline:

```scss
// CORRECT - theme provides the value
background: var(--surface-primary);

// FORBIDDEN - inline fallbacks hide missing theme tokens
background: var(--surface-primary, #ffffff);
```

If a token is missing from a theme, fix the theme, don't hide it with an inline fallback.

---

## Angular Material Overrides

### Override Location

All Angular Material overrides live in `src/styles/material-overrides.scss` (or equivalent global location defined in STYLE_ARCHITECTURE.md). Component-level Material overrides are FORBIDDEN.

### Override Pattern

Material components must be themed through CSS variables, not through direct color values:

```scss
// In global material-overrides.scss

// MatCard
.mat-mdc-card {
    background: var(--surface-card);
    color: var(--text-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--elevation-2);

    .mat-mdc-card-title {
        color: var(--text-primary);
    }

    .mat-mdc-card-subtitle {
        color: var(--text-secondary);
    }
}

// MatButton
.mat-mdc-button {
    // Material buttons inherit from tokens via the theme
}

// MatInput
.mat-mdc-form-field {
    .mdc-notched-outline__leading,
    .mdc-notched-outline__notch,
    .mdc-notched-outline__trailing {
        border-color: var(--border-default);
    }
}
```

### Theme-Specific Material Overrides

When a theme requires customizing Material component appearance beyond tokens, place the overrides in the theme file itself:

```scss
// In src/styles/themes/_glass.scss
@mixin glass-theme {
    // ... token definitions ...

    // Material overrides specific to glass theme
    .mat-mdc-card {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
}
```

---

## Component Category Patterns

### 1. Card Components

Cards are the primary content container. They must use surface tokens and respond to theme changes.

```scss
.product-card {
    background: var(--surface-card);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--elevation-1);
    transition: box-shadow var(--transition-normal), transform var(--transition-normal);

    &:hover {
        box-shadow: var(--elevation-3);
        transform: translateY(-2px);
    }

    &__image {
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }

    &__content {
        padding: var(--spacing-md);
    }

    &__title {
        color: var(--text-primary);
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
    }

    &__description {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }

    &__price {
        color: var(--accent-primary);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
    }
}
```

### 2. Form Components

Forms must use consistent spacing, label positioning, and validation states driven by tokens.

```scss
.form-group {
    margin-bottom: var(--spacing-md);

    &__label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    &__input {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--surface-input);
        color: var(--text-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        transition: border-color var(--transition-fast);

        &:focus {
            border-color: var(--accent-primary);
            outline: none;
            box-shadow: 0 0 0 3px var(--accent-primary-alpha-20);
        }

        &--error {
            border-color: var(--color-error);

            &:focus {
                box-shadow: 0 0 0 3px var(--color-error-alpha-20);
            }
        }
    }

    &__hint {
        margin-top: var(--spacing-xs);
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
    }

    &__error {
        margin-top: var(--spacing-xs);
        font-size: var(--font-size-xs);
        color: var(--color-error);
    }
}
```

### 3. Navigation Components

Navigation must support both horizontal and vertical layouts, with active state indicators driven by tokens.

```scss
.nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: background-color var(--transition-fast), color var(--transition-fast);

    &:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
    }

    &--active {
        background: var(--accent-primary-alpha-10);
        color: var(--accent-primary);
        font-weight: var(--font-weight-semibold);
    }

    &__icon {
        width: 20px;
        height: 20px;
    }
}
```

### 4. Button Components

Buttons follow a variant pattern (primary, secondary, tertiary, danger) mapped to tokens.

```scss
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--transition-fast);

    // Primary - filled accent
    &--primary {
        background: var(--accent-primary);
        color: var(--text-on-accent);

        &:hover {
            background: var(--accent-primary-hover);
        }
    }

    // Secondary - outlined
    &--secondary {
        background: transparent;
        color: var(--accent-primary);
        border-color: var(--accent-primary);

        &:hover {
            background: var(--accent-primary-alpha-10);
        }
    }

    // Tertiary - ghost
    &--tertiary {
        background: transparent;
        color: var(--text-secondary);

        &:hover {
            background: var(--surface-hover);
            color: var(--text-primary);
        }
    }

    // Danger
    &--danger {
        background: var(--color-error);
        color: var(--text-on-accent);

        &:hover {
            background: var(--color-error-hover);
        }
    }

    // Disabled state
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
```

### 5. Dialog/Modal Components

Dialogs must use proper surface tokens, backdrop handling, and focus management.

```scss
.dialog-overlay {
    position: fixed;
    inset: 0;
    background: var(--backdrop-default);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
}

.dialog {
    background: var(--surface-dialog);
    border-radius: var(--radius-xl);
    box-shadow: var(--elevation-6);
    max-width: 500px;
    width: calc(100% - var(--spacing-lg) * 2);
    max-height: calc(100vh - var(--spacing-xl) * 2);
    overflow-y: auto;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-default);
    }

    &__title {
        color: var(--text-primary);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
    }

    &__body {
        padding: var(--spacing-lg);
    }

    &__footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
        border-top: 1px solid var(--border-default);
    }
}
```

### 6. Table Components

Tables must handle dense data display with proper row hover, selection states, and responsive behavior.

```scss
.data-table {
    width: 100%;
    border-collapse: collapse;

    &__header {
        background: var(--surface-table-header);
        color: var(--text-secondary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;

        th {
            padding: var(--spacing-sm) var(--spacing-md);
            text-align: left;
            border-bottom: 2px solid var(--border-strong);
        }
    }

    &__row {
        background: var(--surface-table-row);
        transition: background-color var(--transition-fast);

        &:hover {
            background: var(--surface-table-hover);
        }

        &--selected {
            background: var(--accent-primary-alpha-10);
        }

        td {
            padding: var(--spacing-sm) var(--spacing-md);
            border-bottom: 1px solid var(--border-default);
            color: var(--text-primary);
        }
    }

    &__cell {
        font-size: var(--font-size-sm);
    }
}
```

### 7. Empty State Components

Empty states guide users when no content is available.

```scss
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl);
    text-align: center;

    &__icon {
        width: 80px;
        height: 80px;
        margin-bottom: var(--spacing-lg);
        color: var(--text-tertiary);
    }

    &__title {
        color: var(--text-primary);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--spacing-sm);
    }

    &__description {
        color: var(--text-secondary);
        font-size: var(--font-size-md);
        max-width: 400px;
        margin-bottom: var(--spacing-lg);
    }

    &__action {
        // Uses .btn pattern above
    }
}
```

### 8. Loading State Components

Loading states provide feedback during async operations.

```scss
.loading-skeleton {
    background: var(--surface-skeleton);
    border-radius: var(--radius-md);
    animation: skeleton-pulse 1.5s ease-in-out infinite;

    &--text {
        height: var(--font-size-md);
        width: 100%;

        &--short {
            width: 60%;
        }
    }

    &--image {
        height: 200px;
        width: 100%;
    }

    &--circle {
        border-radius: var(--radius-full);
    }
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
```

---

## Forbidden Patterns

These patterns are strictly forbidden in component SCSS files:

| Pattern | Why Forbidden | Correct Alternative |
|---------|---------------|---------------------|
| Hardcoded hex colors (`#fff`, `rgb()`) | Breaks theme switching | Use `var(--token-name)` |
| Hardcoded spacing (`16px`, `24px`) | Breaks density settings | Use `var(--spacing-*)` |
| Hardcoded radius (`8px`, `50%`) | Breaks theme personality | Use `var(--radius-*)` |
| Hardcoded shadows (`0 2px 8px ...`) | Breaks elevation system | Use `var(--elevation-*)` |
| `!important` overrides | Creates unmaintainable cascade | Fix specificity or use tokens |
| Inline `@import` of theme files | Creates tight coupling | Inherit from parent |
| Component-specific CSS variables | Proliferates token surface | Use functional tokens |
| `@media` queries with hardcoded breakpoints | Breaks responsive consistency | Use `var(--breakpoint-*)` |
| Direct child selectors (`>`) for layout | Fragile to DOM changes | Use BEM or CSS grid/flex |
| Color mixing in components (`mix()`, `rgba()`) | Bypasses token system | Pre-compute alpha tokens in themes |

---

## Accessibility Requirements

### Minimum Contrast Ratios

All token combinations must meet WCAG 2.1 AA minimum contrast ratios:

| Element | Minimum Ratio |
|---------|---------------|
| Normal text (< 18pt) | 4.5:1 against background |
| Large text (>= 18pt bold) | 3:1 against background |
| UI components, graphics | 3:1 against adjacent colors |

Theme authors are responsible for verifying contrast ratios during theme creation. Components assume tokens meet these requirements.

### Focus Indicators

All interactive elements must show a visible focus indicator:

```scss
&:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
}
```

### Reduced Motion

Respect the user's motion preferences:

```scss
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

This rule is defined globally in `src/styles/core/_motion.scss` and applies to all components automatically.

---

## Component Creation Checklist

When creating a new component, verify:

- [ ] SCSS file follows the structure defined in [Component SCSS Structure](#component-scss-structure)
- [ ] All visual values use CSS custom properties (design tokens)
- [ ] No hardcoded colors, spacing, radius, or shadows
- [ ] Hover and focus states are defined
- [ ] Component respects `prefers-reduced-motion`
- [ ] BEM naming used for internal elements
- [ ] Responsive behavior tested at all breakpoints
- [ ] Component looks correct in both light and dark themes
- [ ] No `!important` usage
- [ ] No direct Angular Material overrides in component file

---

*This document is a living specification. Update patterns as the design system evolves.*
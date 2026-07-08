# ADR-001: Glass Theme Analysis and Reimplementation
## Date: 2025-07-07
## Status: Proposed

---

## 1. Problem Statement

The project requires a new "Glass" theme that implements a modern glassmorphism design language. Current implementation has issues:

- **Theme variable inconsistency**: CSS custom properties are scattered across multiple files
- **Token system not implemented**: No clear separation between design tokens and theme values
- **Component style fragmentation**: Components use hardcoded values instead of theme variables
- **Admin style contamination**: Admin-specific styles leak into shared SCSS modules
- **Inconsistent naming**: Multiple naming conventions for similar variables

---

## 2. Current Architecture Analysis

### 2.1 File Structure
```
src/styles/
├── main.scss                    # Main entry point
├── styles.scss                  # Root SCSS file
├── core/
│   ├── _base.scss              # Base styles
│   ├── _variables.scss         # Legacy variables (DEPRECATED)
│   └── _index.scss             # Core module index
├── components/
│   ├── _cards.scss             # Card component styles
│   ├── _navigation.scss        # Navigation styles
│   ├── _theme-switcher.scss    # Theme switcher
│   └── _index.scss             # Components index
├── tokens/
│   ├── _theme-variables.scss   # Token definitions (BROKEN)
│   └── _index.scss             # Tokens index
├── themes/
│   ├── _default.scss           # Default (Light) theme
│   ├── _dark.scss              # Dark theme
│   ├── _glass.scss             # Glass theme (NEEDS REFACTOR)
│   └── _index.scss             # Theme router
└── layout/
    └── _index.scss             # Layout styles

src/admin/styles/
├── admin.scss                  # Admin entry point
├── admin-global.scss           # Global admin styles
├── admin-variables.scss        # Admin variables
├── _admin-light.scss           # Admin light overrides
├── _admin-dark.scss            # Admin dark overrides
├── _admin-glass.scss           # Admin glass overrides (CONTAMINATED)
└── _admin-dark-glass.scss      # Admin dark-glass (DUPLICATE)
```

### 2.2 Current Theme System

**Theme Detection:**
```scss
/* Current approach in _index.scss */
body.theme-default {
  @import './themes/default';
}

body.theme-dark {
  @import './themes/dark';
}

body.theme-glass {
  @import './themes/glass';
}
```

**CSS Custom Properties:**
- Defined on `:root` and `[data-theme="*"]` selectors
- Inconsistent naming: `--color-*`, `--bg-*`, `--theme-*`
- ~500+ unique variable names across themes

---

## 3. Glass Theme Specification

### 3.1 Design Philosophy

The Glass theme implements **Glassmorphism** design principles:
- **Transparency**: Semi-transparent surfaces
- **Blur Effects**: Backdrop blur for depth
- **Subtle Borders**: Thin, luminous borders
- **Dark Base**: Deep dark backgrounds
- **Minimal Shadows**: Soft, diffused shadows

### 3.2 Visual Characteristics

| Aspect | Value | Rationale |
|--------|-------|-----------|
| Background | `#0f1115` | Deep dark, near-black |
| Primary Surface | `rgba(0, 0, 0, 0.4)` | Semi-transparent black |
| Secondary Surface | `rgba(255, 255, 255, 0.05)` | Subtle glass effect |
| Border | `rgba(255, 255, 255, 0.08-0.15)` | Luminous edges |
| Blur | `20-40px` | Strong frosted glass |
| Text | `#ffffff` | Maximum contrast |
| Accent | `#ffffff` | White as accent color |

### 3.3 Current Implementation Issues

**Issue 1: Variable Duplication**
```scss
// In _glass.scss
--bg-primary: #0f1115;
--background-primary: #0f1115;  // DUPLICATE!
--color-bg-primary: #0f1115;    // DUPLICATE!
```

**Issue 2: Admin Contamination**
```scss
// _admin-glass.scss contains frontend styles
.auth-modal { /* Frontend component! */ }
.product-card { /* Frontend component! */ }
```

**Issue 3: Hardcoded Values in Components**
```scss
// Component SCSS
.card {
  background: rgba(255, 255, 255, 0.1); // Should use variable!
  backdrop-filter: blur(20px);          // Should use variable!
}
```

---

## 4. Proposed Architecture

### 4.1 Token System

**Level 1: Abstract Tokens (Semantic)**
```scss
// tokens/_semantic.scss
--color-bg-primary: var(--bg-primary);
--color-bg-secondary: var(--bg-secondary);
--color-text-primary: var(--text-primary);
--color-text-secondary: var(--text-secondary);
--color-border-primary: var(--border-primary);
--color-border-secondary: var(--border-secondary);
--color-accent-primary: var(--accent-primary);
--effect-blur-sm: var(--blur-sm);
--effect-blur-md: var(--blur-md);
--effect-blur-lg: var(--blur-lg);
--effect-shadow-card: var(--shadow-card);
--radius-sm: var(--radius-sm);
--radius-md: var(--radius-md);
--radius-lg: var(--radius-lg);
```

**Level 2: Theme Tokens (Concrete)**
```scss
// themes/_glass.scss
:root, [data-theme="glass"] {
  // Core colors
  --bg-primary: #0f1115;
  --bg-secondary: rgba(0, 0, 0, 0.4);
  --bg-tertiary: rgba(255, 255, 255, 0.05);
  --bg-surface: rgba(0, 0, 0, 0.3);
  --bg-elevated: rgba(20, 22, 28, 0.8);

  // Text colors
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  --text-disabled: rgba(255, 255, 255, 0.3);
  --text-inverse: #000000;

  // Border colors
  --border-primary: rgba(255, 255, 255, 0.15);
  --border-secondary: rgba(255, 255, 255, 0.08);
  --border-tertiary: rgba(255, 255, 255, 0.05);
  --border-focus: #3b82f6;

  // Accent colors
  --accent-primary: #ffffff;
  --accent-secondary: rgba(255, 255, 255, 0.8);
  --accent-hover: rgba(255, 255, 255, 0.15);

  // Effects
  --blur-sm: 10px;
  --blur-md: 20px;
  --blur-lg: 40px;
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 20px 60px rgba(0, 0, 0, 0.4);

  // Border radius
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
}
```

### 4.2 Directory Structure (Proposed)

```
src/styles/
├── main.scss
├── core/
│   ├── _base.scss
│   ├── _typography.scss
│   └── _index.scss
├── tokens/
│   ├── _design-tokens.scss    // Abstract token mapping
│   ├── _semantic.scss         // Semantic tokens
│   └── _index.scss
├── components/
│   ├── _cards.scss
│   ├── _buttons.scss
│   ├── _forms.scss
│   ├── _navigation.scss
│   └── _index.scss
├── themes/
│   ├── _variables.scss        // Shared theme variables
│   ├── _default.scss
│   ├── _dark.scss
│   ├── _glass.scss
│   └
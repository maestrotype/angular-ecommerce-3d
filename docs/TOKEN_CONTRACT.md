# Token Contract — Design System API

> **Status:** Active | **Created:** 2026-07-08 | **ADR:** 001-style-architecture-refactoring
>
> This document defines the public API for all UI styling. Components consume only Semantic Tokens. Themes define only Primitive + Semantic mappings. No component may define global CSS variables.

---

## 1. Three-Layer Model

```
Raw Value → Primitive Token → Semantic Token → Component (local only)
  #1e293b     --color-slate-800    --text-primary      .card { color: var(--text-primary); }
```

| Layer | Count | Defined In | Consumed By |
|-------|-------|------------|-------------|
| Primitive | ~40 | Theme SCSS | Semantic tokens only |
| Semantic | ~50 | Theme SCSS | Components (via `var()`) |
| Component | 0 globally | Component local SCSS | N/A (no global output) |

---

## 2. Primitive Tokens

Raw design values. Theme-specific. Never consumed directly by components.

### Colors (`--color-*`)
```scss
--color-white
--color-black
--color-slate-50 through --color-slate-900
--color-primary-base    // Brand primary (per theme)
--color-secondary-base  // Brand secondary (per theme)
--color-accent-base     // Brand accent (per theme)
--color-success-base
--color-warning-base
--color-error-base
```

### Spacing (`--space-*`)
```scss
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Radius (`--radius-*`)
```scss
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

### Shadows (`--shadow-*`)
```scss
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.1)
--shadow-xl: 0 16px 48px rgba(0,0,0,0.15)
```

### Typography (`--font-*`, --text-*, --leading-*)
```scss
--font-sans: 'Roboto', sans-serif
--font-mono: 'Fira Code', monospace
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 20px
--text-2xl: 24px
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

### Motion (`--duration-*`, --easing-*)
```scss
--duration-fast: 150ms
--duration-normal: 300ms
--duration-slow: 500ms
--easing-default: ease
--easing-enter: cubic-bezier(0.22, 1, 0.36, 1)
--easing-leave: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 3. Semantic Tokens

Meaningful names that map to primitives. Components consume only this layer.

### Surface (`--surface-*`)
```scss
--surface-primary       // Main background
--surface-secondary     // Elevated panels, cards
--surface-tertiary      // Sidebar, toolbars
--surface-overlay       // Modals, dropdowns
--surface-inverse       // Contrasting sections
```

### Text (`--text-*`)
```scss
--text-primary          // Body text on primary surface
--text-secondary        // Muted/caption text
--text-inverse          // Text on inverse surface
--text-on-primary       // Text on primary color background
--text-link
```

### Border (`--border-*`)
```scss
--border-default        // Standard dividers
--border-strong         // Input borders, card outlines
--border-primary        // Branded accent borders
```

### Interactive (`--interactive-*`)
```scss
--interactive-primary         // Buttons, links (default)
--interactive-primary-hover
--interactive-secondary
--interactive-secondary-hover
--interactive-danger
--interactive-disabled        // Disabled state
```

### State (`--state-*`)
```scss
--state-success-bg
--state-success-text
--state-warning-bg
--state-warning-text
--state-error-bg
--state-error-text
```

### Composite (`--composite-*`)
```scss
--radius-card: var(--radius-md)       // Card border radius (theme may override)
--shadow-card: var(--shadow-sm)       // Card elevation (theme may override)
--glass-blur: 12px                    // Glassmorphism blur amount
--glass-opacity: 0.8                  // Glass background opacity
```

---

## 4. Rules

### For Themes
1. Define only Primitive tokens (~40 values)
2. Map Primitives to Semantic tokens (~50 values)
3. No component-specific variables allowed in theme files
4. Each theme = 1 SCSS partial + 1 TS metadata file

### For Components
1. Consume only `var(--semantic-token)` references
2. No defining CSS custom properties in component scope
3. No hardcoded colors, shadows, or spacing values
4. Component-local composition only (no `:host` variable output)

### Forbidden
- `::ng-deep` (deprecated, use Material overrides or CDK strategies)
- `!important` (≤2 documented exceptions maximum)
- Hardcoded hex/rgb in component SCSS
- Component-specific global variables (e.g., `--card-price-color`)

---

## 5. Validation

A new theme is valid when:
- [ ] Created by copying one TS file + one SCSS partial
- [ ] Only ~90 assignments modified (40 primitive + 50 semantic)
- [ ] Zero component code touched
- [ ] All existing components render correctly
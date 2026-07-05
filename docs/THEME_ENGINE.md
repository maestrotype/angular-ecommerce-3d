# Theme Engine — angular-ecommerce-3d

This document specifies the theme engine architecture. The goal is a future-proof system where themes change MUCH more than colors — each theme should feel like a different application.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-05

---

## 1. Design Philosophy

A theme is not a color palette. A theme is a **complete visual personality**.

When a user switches from "Professional" to "Cyberpunk", the application should feel like a different product — not just recolored. The theme engine controls layout behavior, spacing language, corner geometry, elevation style, motion personality, and surface treatment.

**Principles**:
1. **Deep Differentiation** — Themes change geometry, motion, and layout, not just colors
2. **Self-Containment** — Each theme defines all its dimensions explicitly
3. **Instant Switching** — Theme changes apply atomically via a single attribute
4. **Zero Code Changes** — Components never know which theme is active
5. **Composability** — New themes can be created by extending a base theme

---

## 2. Theme Dimensions

Each theme defines values across eight independent dimensions. A theme may override any subset, inheriting the rest from a base theme.

### 2.1 Appearance

Controls surface treatment and color personality.

| Token | Purpose | Example Values |
|-------|---------|----------------|
| `--bg-primary` | Main background | `#ffffff`, `#0a0a0f`, `rgba(255,255,255,0.1)` |
| `--bg-secondary` | Secondary surfaces | `#f5f5f5`, `#1a1a2e` |
| `--surface-primary` | Elevated surfaces | `#ffffff`, `#16213e` |
| `--text-primary` | Primary text | `#212121`, `#e0e0e0` |
| `--text-secondary` | Secondary text | `#757575`, `#9e9e9e` |
| `--accent-primary` | Brand accent | `#1976d2`, `#00ff88` |
| `--accent-secondary` | Secondary accent | `#f50057`, `#ff6b35` |
| `--gradient-primary` | Primary gradient | `linear-gradient(...)` |
| `--glass-blur` | Glassmorphism blur | `blur(12px)`, `none` |
| `--glass-opacity` | Glass surface opacity | `0.1`, `0.0` (solid) |

### 2.2 Shape

Controls corner geometry and overall visual softness.

| Token | Purpose | Professional | Creative | Cyberpunk |
|-------|---------|-------------|----------|-----------|
| `--radius-sm` | Small radius | 4px | 12px | 0px |
| `--radius-md` | Medium radius | 8px | 20px | 0px |
| `--radius-lg` | Large radius | 12px | 32px | 0px |
| `--radius-xl` | Extra large | 24px | 48px | 0px |
| `--radius-full` | Full radius | true | true | false |

### 2.3 Spacing

Controls internal padding and external margins — the "breathing room" of the theme.

| Token | Purpose | Compact | Default | Spacious |
|-------|---------|---------|---------|----------|
| `--spacing-xs` | Extra small | 2px | 4px | 8px |
| `--spacing-sm` | Small | 4px | 8px | 12px |
| `--spacing-md` | Medium | 8px | 16px | 24px |
| `--spacing-lg` | Large | 12px | 24px | 32px |
| `--spacing-xl` | Extra large | 16px | 32px | 48px |
| `--spacing-2xl` | 2x large | 24px | 48px | 64px |

### 2.4 Density

Controls how much content fits on screen. Derived from spacing but with additional layout implications.

| Token | Purpose | Values |
|-------|---------|--------|
| `--density-mode` | Density label | `compact`, `default`, `comfortable` |
| `--line-height-density` | Text line height | 1.2, 1.5, 1.8 |
| `--component-padding-y` | Vertical padding multiplier | 0.5, 1, 1.5 |

### 2.5 Elevation

Controls how depth is communicated — shadows, borders, or layering.

| Token | Purpose | Flat | Material | Glass |
|-------|---------|------|----------|-------|
| `--shadow-none` | No elevation | `none` | `none` | `none` |
| `--shadow-sm` | Small elevation | `none` | `0 1px 3px rgba(0,0,0,0.12)` | `0 8px 32px rgba(0,0,0,0.1)` |
| `--shadow-md` | Medium elevation | `none` | `0 4px 6px rgba(0,0,0,0.15)` | `0 12px 48px rgba(0,0,0,0.15)` |
| `--shadow-lg` | Large elevation | `none` | `0 10px 20px rgba(0,0,0,0.19)` | `0 16px 64px rgba(0,0,0,0.2)` |
| `--border-weight` | Border presence | 1px | 0px | 1px solid rgba(255,255,255,0.1) |
| `--elevation-style` | Elevation language | `flat`, `shadow`, `glass`, `border` |

### 2.6 Typography

Controls font personality and hierarchy.

| Token | Purpose | Example Values |
|-------|---------|----------------|
| `--font-family-base` | Body font | `'Inter'`, `'Space Mono'`, `'Playfair Display'` |
| `--font-family-heading` | Heading font | `'Poppins'`, `'Orbitron'`, `'Merriweather'` |
| `--font-family-mono` | Monospace font | `'Fira Code'`, `'JetBrains Mono'` |
| `--font-weight-light` | Light weight | 300, 400 |
| `--font-weight-regular` | Regular weight | 400, 500 |
| `--font-weight-bold` | Bold weight | 600, 700, 800 |
| `--letter-spacing-base` | Base letter spacing | `0`, `-0.02em`, `0.05em` |
| `--letter-spacing-heading` | Heading letter spacing | `0`, `-0.03em`, `0.1em` |

### 2.7 Motion

Controls animation personality and timing.

| Token | Purpose | Calm | Dynamic | Playful |
|-------|---------|------|---------|---------|
| `--duration-instant` | No perceived delay | 0ms | 0ms | 0ms |
| `--duration-fast` | Quick feedback | 100ms | 150ms | 200ms |
| `--duration-normal` | Standard transition | 150ms | 200ms | 300ms |
| `--duration-slow` | Deliberate motion | 200ms | 300ms | 500ms |
| `--easing-enter` | Entrance curve | `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--easing-exit` | Exit curve | `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | `cubic-bezier(0.6, -0.28, 0.74, 0.05)` |
| `--easing-default` | Default curve | `ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` |
| `--motion-intensity` | Animation scale | `reduced`, `normal`, `enhanced` |

### 2.8 Layout

Controls structural layout behavior.

| Token | Purpose | Values |
|-------|---------|--------|
| `--sidebar-width` | Sidebar width | 260px, 300px, 72px (icon-only) |
| `--sidebar-style` | Sidebar appearance | `solid`, `glass`, `overlay`, `minimal` |
| `--header-height` | Header height | 64px, 72px, 48px |
| `--header-behavior` | Header scroll behavior | `fixed`, `sticky`, `scroll-hide`, `minimal` |
| `--content-max-width` | Max content width | 1200px, 1440px, none |
| `--grid-gap` | Default grid gap | var(--spacing-md), var(--spacing-lg) |
| `--navigation-style` | Navigation pattern | `sidebar`, `topbar`, `bottom-bar`, `floating` |

---

## 3. Theme Interface (TypeScript)

```typescript
// src/app/core/themes/theme.model.ts

export interface ThemeDimension<T extends string> {
  [key: T]: string;
}

export interface ThemeAppearance {
  'bg-primary': string;
  'bg-secondary': string;
  'surface-primary': string;
  'surface-secondary': string;
  'text-primary': string;
  'text-secondary': string;
  'text-heading': string;
  'accent-primary': string;
  'accent-secondary': string;
  'border-color': string;
  'gradient-primary'?: string;
  'glass-blur'?: string;
  'glass-opacity'?: number;
}

export interface ThemeShape {
  'radius-sm': string;
  'radius-md': string;
  'radius-lg': string;
  'radius-xl': string;
}

export interface ThemeSpacing {
  'spacing-xs': string;
  'spacing-sm': string;
  'spacing-md': string;
  'spacing-lg': string;
  'spacing-xl': string;
  'spacing-2xl': string;
}

export interface ThemeElevation {
  'shadow-none': string;
  'shadow-sm': string;
  'shadow-md': string;
  'shadow-lg': string;
  'shadow-xl': string;
  'border-weight': string;
  'elevation-style': 'flat' | 'shadow' | 'glass' | 'border';
}

export interface ThemeTypography {
  'font-family-base': string;
  'font-family-heading': string;
  'font-weight-regular': number;
  'font-weight-bold': number;
  'letter-spacing-base': string;
}

export interface ThemeMotion {
  'duration-fast': string;
  'duration-normal': string;
  'duration-slow': string;
  'easing-default': string;
  'easing-enter': string;
  'easing-exit': string;
  'motion-intensity': 'reduced' | 'normal' | 'enhanced';
}

export interface ThemeDensity {
  'density-mode': 'compact' | 'default' | 'comfortable';
  'line-height-density': number;
}

export interface ThemeLayout {
  'sidebar-width'?: string;
  'sidebar-style'?: string;
  'header-height'?: string;
  'header-behavior'?: string;
  'content-max-width'?: string;
  'navigation-style'?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  isDark: boolean;
  baseThemeId?: string;  // Optional inheritance

  appearance: ThemeAppearance;
  shape: ThemeShape;
  spacing: ThemeSpacing;
  elevation: ThemeElevation;
  typography: ThemeTypography;
  motion: ThemeMotion;
  density: ThemeDensity;
  layout?: ThemeLayout;
}
```

---

## 4. Theme File Structure

```
src/app/core/themes/
├── theme.model.ts              # TypeScript interfaces (above)
├── theme-config.ts             # Theme registry + AVAILABLE_THEMES array
├── theme.service.ts            # Runtime theme switching service
└── themes/
    ├── light-theme.ts           # Light / default theme
    ├── dark-theme.ts            # Dark theme
    ├── glass-theme.ts           # Glassmorphism theme
    ├── dark-glass-theme.ts      # Dark glass theme
    └── <name>-theme.ts          # Future themes

src/styles/themes/
├── _index.scss                  # Re-exports all theme SCSS partials
├── _default.scss                # Light theme CSS variables
├── _dark.scss                   # Dark theme CSS variables
├── _glass.scss                  # Glass theme CSS variables
└── _<name>.scss                 # Future themes
```

---

## 5. Theme Switching Mechanism

### 5.1 Runtime Flow

```
User selects theme
      │
      ▼
ThemeSelectorComponent emits theme id
      │
      ▼
ThemeService.activateTheme('dark-glass')
      │
      ├── Sets document.documentElement.dataset.theme = 'dark-glass'
      ├── Saves to localStorage
      ├── Emits themeChanged event
      └── Runs validation (dev mode)
      │
      ▼
CSS automatically updates via [data-theme="dark-glass"] selectors
```

### 5.2 SCSS Selector Pattern

Each theme partial uses this exact pattern:

```scss
// src/styles/themes/_dark.scss
[data-theme="dark"] {
  // Appearance
  --bg-primary: #121212;
  --text-primary: #e0e0e0;

  // Shape
  --radius-md: 8px;

  // ... all other dimensions
}
```

### 5.3 Server-Side Rendering

For SSR, the theme is applied during hydration:
1. Default theme is used for initial server render
2. On client hydration, ThemeService reads localStorage and applies saved theme
3. No flash of wrong theme (FOUC) because the attribute is set before first paint

---

## 6. Adding a New Theme

### Step-by-Step Process

1. **Create TypeScript definition**: `src/app/core/themes/themes/cyberpunk-theme.ts`
2. **Create SCSS partial**: `src/styles/themes/_cyberpunk.scss`
3. **Register in theme-config.ts**: Add to `AVAILABLE_THEMES` array
4. **Export from SCSS index**: Add `@use 'themes/cyberpunk';` to `_index.scss`
5. **Test**: Switch to the theme, verify all components render correctly

### Theme Inheritance

When a new theme shares most values with an existing theme, it can extend the base:

```typescript
// cyberpunk-theme.ts
import { LIGHT_THEME } from './light-theme';
import { Theme } from '../theme.model';

export const CYBERPUNK_THEME: Theme = {
  ...LIGHT_THEME,           // Inherit all dimensions
  id: 'cyberpunk',
  name: 'Cyberpunk',
  isDark: true,
  baseThemeId: 'light',

  // Override only what differs
  appearance: {
    ...LIGHT_THEME.appearance,
    'bg-primary': '#0a0a1a',
    'accent-primary': '#00ff88',
  },
  shape: {
    'radius-sm': '0px',
    'radius-md': '0px',
    'radius-lg': '0px',
    'radius-xl': '0px',
  },
};
```

---

## 7. Example Theme Definitions

### 7.1 Professional (Default Light)
- Clean, corporate aesthetic
- Subtle shadows, moderate radius
- Inter + Poppins typography
- Standard spacing

### 7.2 Creative
- Rounded corners everywhere (up to 48px)
- Playful easing curves with overshoot
- Enhanced motion intensity
- Generous spacing

### 7.3 Cyberpunk
- Zero border-radius (sharp corners)
- Neon accent colors on dark backgrounds
- Monospace typography
- Reduced motion, instant feedback

### 7.4 Glass
- Semi-transparent surfaces with backdrop-filter blur
- Subtle borders with rgba colors
- Elevated shadows for depth
- Smooth, elegant easing

### 7.5 Minimal
- Flat elevation (no shadows)
- Thin borders for separation
- Compact density
- Minimal spacing, maximum content

### 7.6 Luxury
- Serif headings (Playfair Display)
- Gold accent palette
- Large spacing, comfortable density
- Slow, deliberate animations

---

## 8. Theme Validation

### 8.1 Runtime Checks (Development Mode)

When a theme is activated in development mode, the ThemeService validates:

1. **Completeness**: All required CSS variables are defined for the theme
2. **Value Format**: Color values are valid hex/rgb/rgba; sizes have valid units
3. **Contrast**: Text colors meet WCAG AA contrast against their background surfaces

### 8.2 Validation Output

```typescript
// Example console output on validation failure
[ThemeValidator] Theme "cyberpunk" has issues:
  ✗ Missing variable: --shadow-xl
  ✗ Invalid color: --accent-primary = "notacolor"
  ⚠ Low contrast: --text-secondary on --bg-primary (2.8:1, minimum 4.5:1)
```

---

## 9. Performance Considerations

### 9.1 CSS Bundle Size

Each theme partial adds its CSS variables to the bundle. With 8 dimensions and ~50 tokens per theme, each theme adds approximately 3-5KB of CSS (minified).

**Optimization**: Use CSS `@layer` to allow the browser to discard unused theme variables when possible.

### 9.2 Runtime Performance

Theme switching is a single DOM attribute change — O(1) operation with no JavaScript layout recalculation. The browser's CSS engine handles the variable reassignment natively.

### 9.3 Memory

Theme definitions in TypeScript are small (~2KB per theme). Storing all available themes in memory has negligible impact.

---

## 10. Migration from Current System

### Current State
- Theme defined as flat color map in `theme-config.ts`
- SCSS variables duplicated across `_theme-variables.scss`, admin variables, and theme partials
- No shape, motion, or layout dimensions

### Target State
- Theme defined as structured multi-dimensional object
- CSS variables defined once per theme in SCSS partials
- All eight dimensions supported

### Migration Path
1. Expand `Theme` interface (Phase 2, Task 2.1)
2. Create dimension-specific SCSS mixins (Phase 2, Task 2.2)
3. Migrate existing themes incrementally (Phase 2, Task 2.4)
4. Remove old flat color maps after all themes are migrated

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-05*
|
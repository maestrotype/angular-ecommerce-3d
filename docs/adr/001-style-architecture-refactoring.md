# ADR-001: Style Architecture Refactoring Using Nginx-Based Theme Serving

**Date:** 2026-07-07
**Status:** accepted
**Supersedes:** N/A
**Deciders:** AI Lead Developer (Principal UI Architect role per AI_CONSTITUTION.md §4)

---

## 1. Context & Problem Statement

### 1.1 Current State

The project currently has a monolithic style architecture with significant technical debt:

1. **Monolithic token file**: `src/styles/tokens/_theme-variables.scss` contains 723 lines of mixed design tokens, theme variables, and component-specific overrides
2. **Scattered token definitions**: CSS custom properties are defined in multiple locations (`_theme-variables.scss`, `_default.scss`, `_admin-glass.scss`, `admin-variables.scss`)
3. **Admin style duplication**: Admin panel maintains completely separate style systems (`_admin-light.scss`, `_admin-dark.scss`, `_admin-glass.scss`) that duplicate frontend token values
4. **Hardcoded values in components**: Many component SCSS files contain hardcoded colors, spacing, radius, and shadow values instead of referencing semantic tokens
5. **Mixed variable systems**: Project uses both SCSS variables (`$var`) and CSS custom properties (`var(--*)`) inconsistently
6. **Predictable theme URLs missing**: No clean URL structure for theme switching; theme selection relies on DOM attribute toggling without server-side support

### 1.2 Target State

Per `STYLE_ARCHITECTURE.md` §10, the target state requires:

| Aspect | Current | Target |
|--------|---------|--------|
| Token definitions | Scattered across 4+ files | Single unified token source |
| Theme variables | Monolithic 723-line file | Per-theme partials |
| Admin styles | Completely separate | Shared tokens, admin-specific layouts |
| Material overrides | Scattered in components | Centralized `_overrides.scss` |
| Hardcoded colors | Present in many components | Zero — all use tokens |
| CSS vs SCSS variables | Mixed usage | CSS custom properties preferred |
| Theme URLs | No predictable structure | `/theme/<slug>` per `THEME_ENGINE.md` §5 |

### 1.3 Business Requirements

1. **Multi-tenant theme support**: Each storefront instance must be customizable via `/theme/<slug>` URL
2. **Nginx-based asset serving**: Theme variations served via Nginx alias directories for zero-runtime-overhead switching
3. **AI-generated themes**: Support for procedurally generated theme files from 3D model analysis (per `AI_CONSTITUTION.md` §2 "AI-First Methodology")
4. **Admin theme isolation**: Admin panel must have independent theming without affecting storefront

---

## 2. Considered Options

### Option A: Single SCSS File with @use Aliases

**Description:** Create one monolithic `_design-tokens.scss` and use SCSS `@use 'tokens' as *` aliases throughout.

**Pros:**
- Simple SCSS-only solution
- No server configuration changes required
- Compile-time variable resolution

**Cons:**
- Defeats the purpose of runtime theme switching
- Cannot support `/theme/<slug>` URL pattern
- Requires full rebuild for theme changes
- Does not satisfy `THEME_ENGINE.md` §5 requirements

**Verdict:** REJECTED — Does not support runtime theme switching or multi-tenancy.

---

### Option B: CSS Custom Properties with JavaScript Theme Engine

**Description:** Define all themes as CSS custom property maps and use JavaScript to toggle `data-theme` attributes on `<html>`.

**Pros:**
- Zero server configuration needed
- Instant runtime theme switching
- Well-established Angular pattern

**Cons:**
- All theme CSS loaded upfront (larger initial payload)
- No SEO benefit from theme URLs
- Does not integrate with Nginx asset serving strategy
- Complex JavaScript state management for theme persistence

**Verdict:** REJECTED — While functional, does not align with the Nginx-based architecture decision. The current project already uses this approach as a baseline, but ADR-001 extends it with Nginx support.

---

### Option C: Nginx Alias Directories with CSS Custom Properties (SELECTED)

**Description:** Serve theme-specific CSS files from Nginx alias directories, mapped to `/theme/<slug>` URLs. Each theme is a self-contained CSS file that redefines CSS custom properties. Fallback to JavaScript-based switching for development environments.

**Pros:**
- Clean, predictable URLs (`/theme/minimalist`, `/theme/bold`, etc.)
- Zero JavaScript overhead for theme switching in production
- Each theme is a standalone, versionable file
- Supports multi-tenancy (different domains → different default themes)
- AI-generated themes can be dropped into the alias directory
- SEO-friendly (theme visible in URL)
- Cache-friendly (theme CSS cached independently)
- Aligns with `THEME_ENGINE.md` §5 "Predictable URL Pattern"
- Gradual migration possible (hybrid JS + Nginx during transition)

**Cons:**
- Requires Nginx configuration changes
- Theme switch causes page reload (unless enhanced with prefetching)
- Development environment needs fallback mechanism

**Verdict:** ACCEPTED — Best alignment with project goals of multi-tenancy, AI-generated themes, and clean URL architecture.

---

## 3. Decision

Implement **Option C: Nginx Alias Directories with CSS Custom Properties** as the primary theme serving mechanism, with JavaScript fallback for development.

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Nginx Layer                       │
│                                                      │
│  /theme/<slug>  ──alias──►  dist/themes/<slug>/     │
│                                                      │
│  /theme/minimalist  ──►  dist/themes/minimalist/    │
│  /theme/bold        ──►  dist/themes/bold/          │
│  /theme/dark        ──►  dist/themes/dark/          │
│  /theme/glass       ──►  dist/themes/glass/         │
└─────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────┐
│              Angular Build Pipeline                  │
│                                                      │
│  src/styles/themes/                                  │
│    ├── _design-tokens.scss    ← Single token source  │
│    ├── _default.scss          ← Default theme         │
│    ├── _dark.scss             ← Dark theme            │
│    ├── _glass.scss            ← Glass theme           │
│    └── _index.scss            ← Theme builder         │
│                                                      │
│  Build output:                                       │
│    dist/themes/<slug>/theme.css                      │
└─────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────┐
│              Runtime (Browser)                       │
│                                                      │
│  <html data-theme="minimalist">                      │
│    <link rel="stylesheet" href="/theme/minimalist/   │
│          theme.css">                                 │
│                                                      │
│  All components use:                                 │
│    var(--color-primary), var(--spacing-md), etc.     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Key Design Decisions

#### 3.2.1 Single Source of Truth for Tokens

**Decision:** All design tokens defined in one file: `src/styles/themes/_design-tokens.scss`

**Rationale:**
- Eliminates duplicate definitions (currently exists in 4+ files)
- Enforces `STYLE_ARCHITECTURE.md` §9.2 "Duplicate Definitions" prohibition
- Single file to audit for token completeness

**Implementation:**
```scss
// src/styles/themes/_design-tokens.scss
// This file defines the TOKEN CONTRACT — the complete set of
// design primitives available to all themes.
// Each token is a CSS custom property with a default value.

:root {
  // ===== Colors =====
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-secondary: #ec4899;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #1a1a2e;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-shadow: rgba(0, 0, 0, 0.1);

  // ===== Spacing =====
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  // ===== Border Radius =====
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  // ===== Typography =====
  --font-family-base: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;

  // ===== Shadows =====
  --shadow-sm: 0 1px 2px var(--color-shadow);
  --shadow-md: 0 4px 6px var(--color-shadow);
  --shadow-lg: 0 10px 15px var(--color-shadow);
  --shadow-xl: 0 20px 25px var(--color-shadow);

  // ===== Transitions =====
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;

  // ===== Z-Index =====
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-tooltip: 1060;
  --z-toast: 1070;
}
```

#### 3.2.2 Theme Files as Token Overrides

**Decision:** Each theme file only redefines tokens from `_design-tokens.scss`, never introduces new token names.

**Rationale:**
- Maintains token contract consistency across themes
- AI-generated themes can follow the same contract
- Predictable component behavior regardless of active theme

**Implementation:**
```scss
// src/styles/themes/_dark.scss
@use './design-tokens' as *;

[data-theme="dark"] {
  --color-primary: #818cf8;
  --color-primary-hover: #6366f1;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-shadow: rgba(0, 0, 0, 0.4);
}

// src/styles/themes/_glass.scss
@use './design-tokens' as *;

[data-theme="glass"] {
  --color-primary: #6366f1;
  --color-background: transparent;
  --color-surface: rgba(255, 255, 255, 0.1);
  --color-text: #ffffff;
  --color-border: rgba(255, 255, 255, 0.2);
  // ... glass-specific backdrop-filter applied in components
}
```

#### 3.2.3 Nginx Alias Structure

**Decision:** Each theme served from `dist/themes/<slug>/` directory via Nginx alias.

**Rationale:**
- Clean URL pattern matching `THEME_ENGINE.md` §5
- Each theme is independently deployable
- Supports hot theme swaps without full application redeployment

**Nginx Configuration:**
```nginx
# Theme serving configuration
location /theme/ {
    alias /usr/share/nginx/html/themes/;
    try_files $uri $uri/ =404;
    
    # Cache theme CSS aggressively
    expires 7d;
    add_header Cache-Control "public, immutable";
}
```

#### 3.2.4 Admin Theme Isolation

**Decision:** Admin panel uses separate token namespace with `--admin-*` prefix.

**Rationale:**
- Prevents admin styles from leaking to storefront
- Allows independent admin theme updates
- Maintains `STYLE_ARCHITECTURE.md` §10 target: "Shared tokens, admin-specific layouts"

**Implementation:**
```scss
// src/admin/styles/_admin-tokens.scss
:root {
  // Admin-specific tokens that may differ from storefront
  --admin-color-primary: #3b82f6;
  --admin-color-background: #f1f5f9;
  --admin-color-surface: #ffffff;
  --admin-sidebar-width: 260px;
  --admin-header-height: 64px;
}

// Admin dark theme
[data-admin-theme="dark"] {
  --admin-color-primary: #60a5fa;
  --admin-color-background: #0f172a;
  --admin-color-surface: #1e293b;
}
```

#### 3.2.5 Component Style Contract

**Decision:** All components must use semantic CSS custom properties exclusively.

**Rationale:**
- Enforces `STYLE_ARCHITECTURE.md` §9 "Forbidden Patterns"
- Guarantees theme compatibility
- Enables AI-generated themes to work without component changes

**Enforcement (Pre-Merge Checklist per `STYLE_ARCHITECTURE.md` §11.1):**
- No hardcoded colors, spacing, radius, or shadows
- No `!important` usage
- No inline `style=` bindings with design values
- All values reference `var(--*)` tokens

---

## 4. Consequences

### 4.1 Positive Consequences

1. **Predictable theme URLs**: `/theme/<slug>` enables bookmarking, sharing, and SEO
2. **Zero JavaScript theme switching**: Nginx serves theme CSS directly, no client-side computation
3. **AI theme generation support**: New themes can be dropped into `dist/themes/<slug>/` without code changes
4. **Reduced CSS bundle size**: Only active theme CSS loaded (vs. all themes loaded upfront)
5. **Independent caching**: Theme CSS cached separately from application CSS
6. **Multi-tenancy ready**: Different domains can default to different themes via Nginx server blocks
7. **Eliminated token duplication**: Single `_design-tokens.scss` as source of truth
8. **Clear migration path**: Hybrid JS + Nginx approach allows gradual migration

### 4.2 Negative Consequences

1. **Page reload on theme switch**: Initial implementation requires full page reload (mitigated by prefetching in Phase 4)
2. **Nginx dependency**: Development environment needs fallback (implemented via JavaScript theme service)
3. **Build pipeline complexity**: Additional build step to generate per-theme CSS files
4. **Token contract rigidity**: Adding new tokens requires updating all existing themes

### 4.3 Mitigation Strategies

| Consequence | Mitigation |
|-------------|-----------|
| Page reload on switch | Phase 4: Prefetch themes, inject via JS without reload |
| Nginx dependency in dev | JavaScript fallback in `ThemeService` for `ng serve` |
| Build complexity | Webpack plugin or postbuild script automates theme CSS generation |
| Token contract rigidity | Default values in `_design-tokens.scss` cover missing theme tokens |

---

## 5. Implementation Plan

### Phase 1: Token Consolidation
- [ ] Create `src/styles/themes/_design-tokens.scss` with complete token set
- [ ] Audit existing tokens in `_theme-variables.scss`, `_default.scss`, `_dark.scss`, `_glass.scss`
- [ ] Merge all tokens into single source of truth
- [ ] Update `src/styles/themes/_index.scss` to import from new structure
- [ ] Delete redundant token definitions

### Phase 2: Theme File Refactoring
- [ ] Refactor `_default.scss` to override tokens only
- [ ] Refactor `_dark.scss` to override tokens only
- [ ] Refactor `_glass.scss` to override tokens only
- [ ] Create theme build script that generates per-theme CSS files
- [ ] Output to `dist/themes/<slug>/theme.css`

### Phase 3: Nginx Integration
- [ ] Update `nginx.conf` with `/theme/` alias configuration
- [ ] Update `Dockerfile` to copy theme files to correct locations
- [ ] Update `docker-compose.yml` if needed
- [ ] Test theme switching via URL paths

### Phase 4: Component Migration
- [ ] Audit all component SCSS files for hardcoded values
- [ ] Replace hardcoded colors with `var(--color-*)` tokens
- [ ] Replace hardcoded spacing with `var(--spacing-*)` tokens
- [ ] Replace hardcoded radius with `var(--radius-*)` tokens
- [ ] Replace hardcoded shadows with `var(--shadow-*)` tokens
- [ ] Update `UI_AUDIT.md` with migration progress

### Phase 5: Admin Theme Isolation
- [ ] Create `src/admin/styles/_admin-tokens.scss`
- [ ] Migrate admin-specific tokens to new namespace
- [ ] Update admin components to use `--admin-*` tokens
- [ ] Ensure admin themes don't conflict with storefront themes

### Phase 6: JavaScript Fallback & Theme Service
- [ ] Enhance `ThemeService` to support URL-based theme detection
- [ ] Implement development-mode fallback (JS-based switching)
- [ ] Add theme prefetching for smooth transitions
- [ ] Implement theme persistence in localStorage

### Phase 7: Validation & Documentation
- [ ] Run full build and verify zero style regressions
- [ ] Test all theme combinations (default, dark, glass)
- [ ] Test admin theme isolation
- [ ] Update `THEME_ENGINE.md` with Nginx architecture
- [ ] Update `STYLE_ARCHITECTURE.md` to reference this ADR
- [ ] Update `BACKEND_ARCHITECTURE.md` if theme API endpoints added

---

## 6. Migration Checklist

Use this checklist during implementation. Each item maps to a verification step.

### Token Consolidation
- [ ] `_design-tokens.scss` created with 50+ tokens
- [ ] All existing tokens accounted for in new file
- [ ] No duplicate token definitions remain
- [ ] `npm run build` succeeds after consolidation

### Theme Refactoring
- [ ] Each theme file is < 100 lines (overrides only)
- [ ] Theme files reference `_design-tokens.scss` via `@use`
- [ ] Build script generates valid CSS per theme
- [ ] Generated CSS files are valid and minified

### Nginx Configuration
- [ ] `/theme/<slug>/theme.css` returns 200 for each theme
- [ ] `/theme/nonexistent/` returns 404
- [ ] Cache headers set correctly on theme CSS
- [ ] Docker build includes theme files

### Component Migration
- [ ] Zero hardcoded colors in component SCSS files
- [ ] Zero hardcoded spacing values in component SCSS files
- [ ] Zero hardcoded border-radius in component SCSS files
- [ ] Zero hardcoded box-shadow in component SCSS files
- [ ] Visual regression test passes for all themes

### Admin Isolation
- [ ] Admin uses `--admin-*` token namespace
- [ ] Storefront theme changes don't affect admin
- [ ] Admin dark theme works independently

---

## 7. Rollback Strategy

If the refactoring introduces regressions:

1. **Revert token consolidation**: Restore original `_theme-variables.scss` from git
2. **Disable Nginx theme routes**: Remove `/theme/` alias, fallback to JS-based switching
3. **Revert component changes**: Git revert the specific component SCSS files
4. **Document regression**: Log in `UI_AUDIT.md` per `STYLE_ARCHITECTURE.md` §11.4

Each phase is independently reversible. The hybrid JS + Nginx approach ensures the application remains functional during rollback.

---

## 8. References

| Document | Relevance |
|----------|-----------|
| `AI_CONSTITUTION.md` | §2 AI-First Methodology, §4 Architectural Authority, §6 Style Rules |
| `STYLE_ARCHITECTURE.md` | §10 Migration Strategy, §11 Contract Enforcement |
| `THEME_ENGINE.md` | §5 Predictable URL Pattern, §3 Theme Structure |
| `STYLE_REFACTOR_PLAN.md` | Phased migration plan alignment |
| `UI_AUDIT.md` | Current state audit findings |
| `REDESIGN_PLAN.md` | Visual design goals |
| `COMPONENT_GUIDELINES.md` | Component style contract |

---

## 9. Related ADRs

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-002 | *TBD: AI-Generated Theme Pipeline* | Extends this ADR with automated theme generation |
| ADR-003 | *TBD: Multi-Tenant Theme Configuration* | Builds on Nginx alias structure for multi-tenancy |

---

## 10. Review History

| Date | Author | Action |
|------|--------|--------|
| 2026-07-07 | AI Lead Developer | Created, self-reviewed per AI_CONSTITUTION.md §4 |
| 2026-07-07 | AI Lead Developer | Status: accepted |

---

*This ADR is maintained by the Principal UI Architect role as defined in AI_CONSTITUTION.md §4. Architectural decisions require Lead Developer approval.*
# UI Redesign Plan — angular-ecommerce-3d

This document defines the phased roadmap for the complete UI architecture redesign. Each phase is broken into atomic tasks suitable for independent implementation by AI agents (Qwen3-Coder).

> **⚠️ Status tracking moved**: Task and phase statuses are tracked ONLY in [REFACTORING_BOARD.md](REFACTORING_BOARD.md). This document remains the **reference catalog of task definitions** (especially Phases 7–9 / Epic G). Do not update statuses here.

**Last Updated**: 2026-07-28
**Prerequisites**: `STYLE_ARCHITECTURE.md` (architecture rules), `UI_AUDIT.md` (findings), `REFACTORING_BOARD.md` (progress)

---

## Roadmap Overview

| Phase | Name | Status | Est. Tasks | Description |
|-------|------|--------|------------|-------------|
| 1 | Style Architecture Audit | 🔄 In Progress | ~6 | Inventory all style files, identify duplicates, map dependencies |
| 2 | Theme Engine Redesign | ⏳ Pending | ~8 | Build future-proof theme engine supporting deep visual differentiation |
| 3 | Design Token Unification | ⏳ Pending | ~6 | Create single source of truth for all design tokens |
| 4 | Angular Material Integration | ⏳ Pending | ~5 | Proper override strategy for Material components |
| 5 | Style Cleanup | ⏳ Pending | ~10 | Remove duplicates, dead code, hardcoded values |
| 6 | Component Migration | ⏳ Pending | ~15 | Migrate all components to use design tokens |
| 7 | Premium UI Implementation | ⏳ Pending | ~12 | Visual redesign with premium aesthetics |
| 8 | Animation System | ⏳ Pending | ~6 | Theme-specific motion language and transitions |
| 9 | Polish & Consistency | ⏳ Pending | ~8 | Final review, edge cases, cross-theme verification |

---

## Phase 1: Style Architecture Audit

**Goal**: Produce a complete inventory of the current style architecture so all future phases have accurate data.

### Task 1.1 — Inventory All SCSS Files
- **Objective**: List every `.scss` file in `src/`, categorize by purpose (global, theme, component, admin)
- **Output**: Table in `UI_AUDIT.md` §1
- **Files to Edit**: `docs/UI_AUDIT.md`
- **Definition of Done**: Every SCSS file is categorized. No files missed.

### Task 1.2 — Map CSS Variable Definitions
- **Objective**: Find every location where CSS custom properties are defined (not just used, but defined)
- **Output**: Table in `UI_AUDIT.md` §2 showing variable name, all definition locations, conflicting values
- **Files to Edit**: `docs/UI_AUDIT.md`, `src/styles/tokens/_theme-variables.scss`
- **Definition of Done**: All duplicate variable definitions identified with exact line numbers

### Task 1.3 — Audit Hardcoded Colors
- **Objective**: Search all component SCSS files for hardcoded hex, rgb, rgba values
- **Output**: Table in `UI_AUDIT.md` §3
- **Files to Edit**: `docs/UI_AUDIT.md`
- **Search Pattern**: `#[0-9a-fA-F]{3,8}|rgb\(|rgba\(`
- **Definition of Done**: Every hardcoded color in component styles is documented

### Task 1.4 — Audit Admin Style Isolation
- **Objective**: Document how `src/admin/styles/` diverges from `src/styles/`
- **Output**: Section in `UI_AUDIT.md` §4
- **Files to Edit**: `docs/UI_AUDIT.md`, `src/admin/styles/`
- **Definition of Done**: Clear map of admin-only variables, mixins, and theme files

### Task 1.5 — Audit Angular Material Overrides
- **Objective**: Identify all locations where Angular Material styles are overridden
- **Output**: Table in `UI_AUDIT.md` §5
- **Files to Edit**: `docs/UI_AUDIT.md`
- **Definition of Done**: All Material override patterns documented with locations

### Task 1.6 — Identify Unused Files and Imports
- **Objective**: Find SCSS partials that are never imported
- **Output**: Table in `UI_AUDIT.md` §6
- **Files to Edit**: `docs/UI_AUDIT.md`
- **Definition of Done**: Candidate files for deletion are listed

---

## Phase 2: Theme Engine Redesign

**Goal**: Replace the current shallow theme system with a deep, future-proof theme engine.

### Task 2.1 — Design Theme Interface v2
- **Objective**: Expand `Theme` interface to support all theme dimensions (see `THEME_ENGINE.md`)
- **Files to Edit**: `src/app/core/themes/theme.model.ts`
- **Forbidden Files**: Existing theme implementation files (read-only during design)
- **Definition of Done**: New `Theme` interface includes all dimensions from THEME_ENGINE.md §3

### Task 2.2 — Create Theme Dimension Mixins
- **Objective**: Create SCSS mixins that apply theme dimensions as groups (spacing-language, radius-language, elevation-style, motion-language)
- **Files to Edit**: `src/styles/tokens/` (new files)
- **Definition of Done**: Each dimension has a corresponding SCSS mixin

### Task 2.3 — Refactor Theme Registry
- **Objective**: Clean `theme-config.ts` to support theme inheritance and composition
- **Files to Edit**: `src/app/core/themes/theme-config.ts`
- **Definition of Done**: Themes can extend a base theme, overriding only their differences

### Task 2.4 — Migrate Existing Themes to v2
- **Objective**: Convert light, dark, glass, dark-glass themes to new interface
- **Files to Edit**: `src/app/core/themes/themes/*.ts`, `src/styles/themes/_*.scss`
- **Definition of Done**: All 4 existing themes implement Theme v2. Build passes.

### Task 2.5 — Implement Theme Switching Without Layout Shift
- **Objective**: Ensure theme switches happen atomically without FOUC or layout shift
- **Files to Edit**: Theme service, app component
- **Definition of Done**: Switching themes shows no flash. Verified in browser.

### Task 2.6 — Create Theme Validation Utility
- **Objective**: Runtime check that verifies all required CSS variables exist when a theme is activated
- **Files to Edit**: New utility file in `src/app/core/themes/`
- **Definition of Done**: Console warning appears if any required variable is missing

### Task 2.7 — Add Theme Persistence
- **Objective**: Save selected theme to localStorage, restore on page load
- **Files to Edit**: Theme service
- **Definition of Done**: Theme survives page refresh and browser restart

### Task 2.8 — Document Theme Engine
- **Objective**: Ensure `THEME_ENGINE.md` matches implemented architecture
- **Files to Edit**: `docs/THEME_ENGINE.md`
- **Definition of Done**: Documentation matches code. Examples are accurate.

---

## Phase 3: Design Token Unification

**Goal**: Eliminate duplicate token definitions and create a single source of truth.

### Task 3.1 — Define Canonical Token Module
- **Objective**: Create `src/styles/tokens/_design-tokens.scss` as the single source for all theme-independent tokens
- **Files to Edit**: `src/styles/tokens/_design-tokens.scss` (new), `src/styles/tokens/_index.scss`
- **Definition of Done**: All spacing, radius, shadow, z-index, and transition tokens defined exactly once

### Task 3.2 — Consolidate CSS Variable Definitions
- **Objective**: Merge `_theme-variables.scss` into theme-specific partials, eliminating the monolithic 723-line file
- **Files to Edit**: `src/styles/tokens/_theme-variables.scss`, `src/styles/themes/_*.scss`
- **Definition of Done**: No variable is defined in more than one file

### Task 3.3 — Unify Admin and Frontend Tokens
- **Objective**: Share token definitions between `src/admin/styles/` and `src/styles/`
- **Files to Edit**: `src/admin/styles/admin-variables.scss`, shared token files
- **Definition of Done**: Admin panel uses the same spacing, radius, and color tokens as frontend

### Task 3.4 — Create Token Naming Convention
- **Objective**: Document and enforce consistent naming (BEM-style for component tokens, flat for global)
- **Files to Edit**: `docs/STYLE_ARCHITECTURE.md`
- **Definition of Done**: Naming convention documented with examples

### Task 3.5 — Migrate SCSS Variables to CSS Custom Properties
- **Objective**: Convert remaining `$scss-variable` usage in components to `var(--css-property)`
- **Files to Edit**: Component SCSS files as needed
- **Definition of Done**: No SCSS variables used for theme-dependent values in components

### Task 3.6 — Verify Token Coverage
- **Objective**: Confirm every token referenced in components is defined in the canonical module
- **Files to Edit**: None (verification task)
- **Definition of Done**: Zero undefined token references. Build passes.

---

## Phase 4: Angular Material Integration

**Goal**: Establish a clean, maintainable strategy for overriding Angular Material styles.

### Task 4.1 — Document Material Override Strategy
- **Objective**: Define which Material components are overridden and how
- **Files to Edit**: `docs/STYLE_ARCHITECTURE.md` §6
- **Definition of Done**: Override strategy documented with clear rules

### Task 4.2 — Create Material Theme Overrides Module
- **Objective**: Centralize all Material overrides in `src/styles/material/_overrides.scss`
- **Files to Edit**: New file, `src/styles/main.scss`
- **Definition of Done**: All scattered Material overrides moved to single file

### Task 4.3 — Align Material Palette with Design Tokens
- **Objective**: Generate Angular Material palette from design token colors, not hardcoded values
- **Files to Edit**: Material configuration files
- **Definition of Done**: Changing design token colors automatically updates Material components

### Task 4.4 — Fix Material Density Per Theme
- **Objective**: Apply theme-specific density to Material components
- **Files to Edit**: Theme files, Material overrides
- **Definition of Done**: Each theme can define its own Material density

### Task 4.5 — Verify Material Component Consistency
- **Objective**: Test all Material components (buttons, inputs, tables, dialogs, nav) across all themes
- **Files to Edit**: None (verification task)
- **Definition of Done**: All Material components respect current theme. No hardcoded colors remain.

---

## Phase 5: Style Cleanup

**Goal**: Remove all technical debt identified in Phase 1 audit.

### Task 5.1 — Delete Unused SCSS Files
- **Objective**: Remove files identified in `UI_AUDIT.md` §6
- **Files to Edit**: Various (deletion)
- **Definition of Done**: Listed files deleted. Build passes. No runtime style breaks.

### Task 5.2 — Remove Duplicate Variables
- **Objective**: Delete duplicate variable definitions, keep canonical versions
- **Files to Edit**: Files identified in `UI_AUDIT.md` §2
- **Definition of Done**: Each variable defined exactly once. Build passes.

### Task 5.3 — Replace Hardcoded Colors
- **Objective**: Systematically replace all hardcoded colors documented in `UI_AUDIT.md` §3
- **Files to Edit**: Component SCSS files
- **Definition of Done**: Zero hardcoded colors in component styles. Build passes.

### Task 5.4 — Remove Unused Mixins
- **Objective**: Delete mixins no longer referenced anywhere
- **Files to Edit**: SCSS files in `src/styles/`
- **Definition of Done**: Each remaining mixin is referenced at least once

### Task 5.5 — Clean !important Usage
- **Objective**: Find and resolve all `!important` declarations
- **Files to Edit**: Component SCSS files
- **Definition of Done**: `!important` only used where absolutely necessary (document exceptions)

### Task 5.6 — Normalize Indentation and Formatting
- **Objective**: Ensure consistent SCSS formatting across all style files
- **Files to Edit**: All SCSS files
- **Definition of Done**: Consistent 2-space indentation. Trailing commas consistent.

### Task 5.7 — Consolidate Component-Level Global Styles
- **Objective**: Move any `:host-context` or global styles out of components into proper global files
- **Files to Edit**: Component SCSS, `src/styles/`
- **Definition of Done**: No component leaks global styles unintentionally

### Task 5.8 — Remove Deprecated Theme Code
- **Objective**: Clean old theme switching code, deprecated CSS classes
- **Files to Edit**: Theme files, component styles
- **Definition of Done**: No deprecated code paths remain

### Task 5.9 — Verify Admin Style Cleanup
- **Objective**: Ensure admin styles are clean after unification
- **Files to Edit**: `src/admin/styles/`
- **Definition of Done**: Admin styles use shared tokens. No admin-only duplicates remain

### Task 5.10 — Final Build Verification
- **Objective**: Full build after all cleanup
- **Files to Edit**: None
- **Definition of Done**: `npm run build` succeeds with zero errors and no new warnings

---

## Phase 6: Component Migration

**Goal**: Migrate all components to use the new design token system consistently.

### Approach
Migrate component-by-component, verifying each before proceeding. Priority order: layout → shared → feature → admin.

### Migration Checklist Per Component
1. Replace all hardcoded values with token references
2. Verify proper use of `:host` encapsulation
3. Remove component-level variable definitions
4. Verify theme switching works correctly
5. Run build

### Component Groups
| Group | Components | Est. Tasks |
|-------|------------|------------|
| Layout | header, footer, hero, hero-glass, best-sellers | ~4 |
| Shared | theme-selector, modals, recommendations | ~4 |
| Product | product-detail, product-viewer, 3d-viewer | ~4 |
| Pages | favorites, dynamic-page, cart | ~3 |
| Admin | admin-layout, sidenav, tables, forms | ~5 |

---

## Phase 7: Premium UI Implementation

**Goal**: Apply premium visual design using the clean architecture foundation. All styling must use design tokens — no hardcoded values.

### Task 7.1 — Redesign Product Cards
- **Objective**: Implement premium product card with proper elevation, image treatment, and badge system
- **Files to Edit**: `src/styles/components/_cards.scss`, product card component styles
- **Definition of Done**: Card uses only design tokens. Looks correct in all 4 themes. Hover states polished.

### Task 7.2 — Redesign Typography Hierarchy
- **Objective**: Apply premium type scale with proper weight, line-height, and letter-spacing per theme
- **Files to Edit**: `src/styles/core/_typography.scss`, theme partials
- **Definition of Done**: H1–H6, body, caption all use token-driven type scale. Verified visually in all themes.

### Task 7.3 — Implement Empty States
- **Objective**: Create reusable empty state component with icon, title, description, and optional CTA
- **Files to Edit**: New shared component, `src/styles/components/_empty-states.scss`
- **Definition of Done**: Used in cart, search results, favorites, order history. Respects current theme.

### Task 7.4 — Implement Loading States
- **Objective**: Create skeleton loaders and loading spinners per theme motion language
- **Files to Edit**: New shared components, `src/styles/components/_loading.scss`
- **Definition of Done**: Skeleton loaders used in tables, card grids, and detail views. Theme-aware colors.

### Task 7.5 — Redesign Admin Data Tables
- **Objective**: Premium table styling with proper row hover, selection, density controls
- **Files to Edit**: `src/admin/components/blocks/admin-table/`, Material table overrides
- **Definition of Done**: Tables respect theme density. No hardcoded colors. Striped/compact modes work.

### Task 7.6 — Redesign Forms
- **Objective**: Premium form inputs with floating labels, validation states, and proper focus rings
- **Files to Edit**: `src/styles/components/_forms.scss`, Material form overrides
- **Definition of Done**: All input types consistent. Error/success/disabled states clear. Accessible focus rings.

### Task 7.7 — Redesign Navigation
- **Objective**: Premium header, footer, and sidebar navigation with proper active states
- **Files to Edit**: `src/styles/components/_navigation.scss`, layout component styles
- **Definition of Done**: Navigation respects theme. Mobile drawer polished. Breadcrumb consistent.

### Task 7.8 — Redesign Dialogs and Modals
- **Objective**: Premium auth modal, confirm dialogs, and info modals with proper backdrop and motion
- **Files to Edit**: `src/styles/components/_modals.scss`, modal component styles
- **Definition of Done**: Modals use theme backdrop, proper elevation, smooth enter/exit animations.

### Task 7.9 — Redesign Dashboard
- **Objective**: Premium admin dashboard with stat cards, charts containers, and activity feed
- **Files to Edit**: `src/admin/pages/dashboard/`, `src/admin/components/ui/stat-card/`
- **Definition of Done**: Dashboard looks professional in all themes. Stat cards use token-driven styling.

### Task 7.10 — Redesign Product Detail Page
- **Objective**: Premium product detail with image gallery, 3D viewer frame, info panel, and recommendations
- **Files to Edit**: `src/app/components/product-detail/` styles
- **Definition of Done**: PDP is the visual centerpiece. Image gallery, 3D viewer, and info panel all polished.

### Task 7.11 — Redesign Checkout Flow
- **Objective**: Premium checkout with clear step indicators, form validation, and order summary
- **Files to Edit**: Checkout component styles
- **Definition of Done**: 3-step checkout feels professional. Error states clear. Mobile-responsive.

### Task 7.12 — Cross-Theme Visual Review
- **Objective**: Screenshot every redesigned component in all 4 themes and verify consistency
- **Files to Edit**: None (verification task)
- **Definition of Done**: No visual regressions in any theme. All components pass visual review.

---

## Phase 8: Animation System

**Goal**: Implement theme-specific motion language.

### Task 8.1 — Define Animation Tokens
- Create timing functions per theme (spring, smooth, snappy, elegant)
- Define duration scale (instant, fast, normal, slow)

### Task 8.2 — Implement Page Transitions
- Route transitions respecting theme motion language

### Task 8.3 — Implement Micro-interactions
- Hover states, focus rings, loading spinners per theme

### Task 8.4 — Theme-Specific Animation Presets
- Each theme defines its animation personality

### Task 8.5 — Performance Optimization
- GPU-accelerated animations only
- Respect `prefers-reduced-motion`

### Task 8.6 — Animation Documentation
- Document all animation patterns in STYLE_ARCHITECTURE.md

---

## Phase 9: Polish & Consistency

**Goal**: Final quality pass ensuring pixel-perfect consistency across all themes.

### Task 9.1 — Cross-Theme Visual Audit
- Screenshot every major page in every theme
- Compare for consistency

### Task 9.2 — Responsive Verification
- Test all breakpoints in all themes

### Task 9.3 — Accessibility Review
- WCAG contrast ratios in all themes
- Focus visibility

### Task 9.4 — Dark Mode Edge Cases
- Verify no white-on-white or black-on-black

### Task 9.5 — Print Styles
- Basic print stylesheet if applicable

### Task 9.6 — Browser Compatibility
- Test in Chrome, Firefox, Safari, Edge

### Task 9.7 — Performance Metrics
- Measure CSS bundle size before/after
- Verify no runtime style flash

### Task 9.8 — Final Documentation Sync
- Ensure all docs match final implemented state

---

## Task Assignment Guidelines for AI Agents

When assigning a task from this plan to an AI agent (e.g., Qwen3-Coder):

1. Copy the task section above verbatim
2. Add specific file paths from `UI_AUDIT.md` if the task involves cleanup
3. Reference relevant sections of `STYLE_ARCHITECTURE.md` (rules) and `THEME_ENGINE.md` (theme dimensions)
4. Include the Definition of Done verbatim — do not modify acceptance criteria
5. Require `npm run build` verification before task completion
6. After completing the task, update `UI_AUDIT.md` §10 (Migration Progress Tracker)

### Task Format for Qwen3-Coder
```
Task: [Copy task title and description]
Files to Edit: [List from task definition]
Architecture Rules: See STYLE_ARCHITECTURE.md §[relevant section]
Definition of Done: [Copy verbatim]
Constraints: No hardcoded colors. Use design tokens only. Update UI_AUDIT.md after completion.
```

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-06*

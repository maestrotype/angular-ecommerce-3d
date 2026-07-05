# UI Audit — angular-ecommerce-3d

This document tracks the architectural cleanup of the style system. Each section records discovered issues and migration progress. Future AI agents must update this document after every style-related task.

**Role**: Principal UI Architect
**Last Updated**: 2026-07-05
**Audit Status**: Initial — pending codebase scan

---

## 1. SCSS File Inventory

_A complete list of every .scss file, categorized by purpose._

### 1.1 Global Styles (`src/styles/`)

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `src/styles/main.scss` | Master import file | KEEP | Entry point |
| `src/styles/core/_index.scss` | Core re-export | KEEP | |
| `src/styles/core/_base.scss` | Base element styles | KEEP | |
| `src/styles/core/_variables.scss` | SCSS variables | INVESTIGATE | May duplicate tokens |
| `src/styles/tokens/_index.scss` | Token re-export | KEEP | |
| `src/styles/tokens/_theme-variables.scss` | CSS variable definitions | INVESTIGATE | ~723 lines, likely duplicated |
| `src/styles/themes/_index.scss` | Theme re-export | KEEP | |
| `src/styles/themes/_default.scss` | Default/light theme | KEEP | |
| `src/styles/themes/_dark.scss` | Dark theme | KEEP | |
| `src/styles/themes/_glass.scss` | Glass theme | KEEP | |
| `src/styles/components/_cards.scss` | Card presets | KEEP | |
| `src/styles/components/_navigation.scss` | Navigation presets | KEEP | |
| `src/styles/components/_theme-switcher.scss` | Theme switcher styles | KEEP | |

### 1.2 Admin Styles (`src/admin/styles/`)

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `src/admin/styles/admin.scss` | Admin entry point | KEEP | |
| `src/admin/styles/admin-variables.scss` | Admin-specific variables | INVESTIGATE | Duplicates global tokens? |
| `src/admin/styles/_admin-light.scss` | Admin light theme | INVESTIGATE | Redundant with global themes? |
| `src/admin/styles/_admin-dark.scss` | Admin dark theme | INVESTIGATE | Redundant with global themes? |
| `src/admin/styles/_admin-glass.scss` | Admin glass theme | INVESTIGATE | Redundant with global themes? |
| `src/admin/styles/_admin-dark-glass.scss` | Admin dark glass theme | INVESTIGATE | Redundant with global themes? |
| `src/admin/styles/_admin-theme-material.scss` | Admin Material theme | INVESTIGATE | May be unused |
| `src/admin/styles/admin-global.scss` | Admin global styles | INVESTIGATE | Scope leakage risk |

### 1.3 Component Styles

_Component styles are listed per directory. A full scan is required during Phase 1._

**Frontend Components** (`src/app/`):
- `app.component.scss` — Root component
- `layout/header/header.component.scss`
- `layout/footer/footer.component.scss`
- `layout/hero/*.scss`, `layout/hero-glass/*.scss`
- `layout/best-sellers/best-sellers.component.scss`
- `components/product-detail/*.scss` (multiple sub-components)
- `components/product-viewer/*.scss`, `three-d-viewer/*.scss`
- `pages/favorites/`, `pages/dynamic-page/`
- `shared/modal/*.scss` (multiple)
- `shared/ui/theme-selector/*.scss`
- `shared/components/recommendations/*.scss` (multiple)

**Admin Components** (`src/admin/`):
- `components/layout/` — admin-layout, sidenav, header
- `components/blocks/` — admin-table, list-container
- `components/ui/` — stat-card
- `pages/*/` — dashboard, products, categories, orders, users, payments, messages, sections, pages, settings, seo

**Action Required**: Phase 1 Task 1.1 must generate a complete automated inventory using `find src -name "*.scss"`.

---

## 2. Duplicate CSS Variable Definitions

_Variables defined in multiple locations. Populated during Phase 1 Task 1.2._

| Variable Name | Definition Locations | Conflicting Values | Resolution |
|--------------|---------------------|-------------------|------------|
| _pending scan_ | | | |

**Known Suspects** (from file exploration):
- `--bg-primary`: likely in `_theme-variables.scss`, each theme partial, AND `admin-variables.scss`
- `--text-primary`: same pattern as above
- `--radius-md`: likely in `_theme-variables.scss` and admin variables
- `--shadow-*`: likely duplicated between global tokens and admin styles

**Search Command**: `grep -rn "^--" src/styles/ src/admin/styles/`

---

## 3. Hardcoded Colors

_Component SCSS files containing hardcoded hex/rgb/rgba values. Populated during Phase 1 Task 1.3._

| File | Line | Hardcoded Value | Should Use Token |
|------|------|----------------|------------------|
| _pending scan_ | | | |

**Search Pattern**: `#[0-9a-fA-F]{3,8}` or `rgb(` or `rgba(`

**Known Suspects**:
- Admin component styles: table rows, status badges, form states
- Frontend product cards: sale prices, badge colors
- Theme switcher: theme preview colors (acceptable exception)

---

## 4. Admin Style Isolation

_How admin styles diverge from shared styles._

### Current Architecture
```
src/styles/              ← Frontend styles (shared tokens)
src/admin/styles/        ← Admin styles (separate token definitions)
```

### Problem
Admin panel maintains its own variable system (`admin-variables.scss`) and theme variants (`_admin-light.scss`, `_admin-dark.scss`, etc.) that duplicate the global theme system.

### Target Architecture
```
src/styles/tokens/       ← Shared tokens (single source)
src/styles/themes/       ← Shared themes (single source)
src/admin/styles/        ← Admin LAYOUT only (imports shared tokens)
```

### Divergence Map

| Concern | Frontend Location | Admin Location | Duplicated? |
|---------|------------------|----------------|-------------|
| Color tokens | `_theme-variables.scss` | `admin-variables.scss` | YES |
| Light theme | `_default.scss` | `_admin-light.scss` | YES |
| Dark theme | `_dark.scss` | `_admin-dark.scss` | YES |
| Glass theme | `_glass.scss` | `_admin-glass.scss` | YES |
| Dark glass | (global) | `_admin-dark-glass.scss` | YES |
| Layout styles | N/A | `admin-layout.component.scss` | NO (correct) |

---

## 5. Hardcoded Shadows

| File | Line | Hardcoded Value | Should Use Token |
|------|------|----------------|------------------|
| _pending scan_ | | | |

---

## 6. Hardcoded Border Radius

| File | Line | Hardcoded Value | Should Use Token |
|------|------|----------------|------------------|
| _pending scan_ | | | |

---

## 7. Inconsistent Spacing Values

_Spacing values not using the spacing scale (4, 8, 12, 16, 20, 24, 32, 40, 48...)._

| File | Line | Value Found | Closest Token |
|------|------|------------|---------------|
| _pending scan_ | | | |

---

## 8. Angular Material Overrides

_Places where Material styles are manually overridden._

| File | What's Overridden | Why (Root Cause) | Better Solution |
|------|-------------------|-----------------|-----------------|
| _pending scan_ | | | |

---

## 9. Potentially Unused Files

_Files that may be orphaned or no longer imported._

| File | Last Known Import | Still Used? | Action |
|------|------------------|-------------|--------|
| `src/admin/styles/_admin-theme-material.scss` | Unknown | UNKNOWN | Investigate |
| `src/styles/core/_variables.scss` | Possibly by `main.scss` | UNKNOWN | Investigate |

---

## 10. Migration Progress Tracker

_Update after every style-related task._

| Phase | Task | Status | Completed Date | Agent | Notes |
|-------|------|--------|----------------|-------|-------|
| Phase 1 | Task 1.1: SCSS Inventory | PENDING | — | — | — |
| Phase 1 | Task 1.2: Duplicate Variables Audit | PENDING | — | — | — |
| Phase 1 | Task 1.3: Hardcoded Colors Audit | PENDING | — | — | — |
| Phase 1 | Task 1.4: Admin Isolation Analysis | PENDING | — | — | — |
| Phase 2 | Task 2.1: Theme Model Expansion | PENDING | — | — | — |
| Phase 2 | Task 2.2: SCSS Mixin Library | PENDING | — | — | — |
| Phase 2 | Task 2.3: ThemeService Refactor | PENDING | — | — | — |
| Phase 2 | Task 2.4: Theme Migration | PENDING | — | — | — |
| Phase 3-9 | ... | PENDING | — | — | — |

---

## How to Use This Document

1. **Before starting a style task**: Read the relevant sections above
2. **During the task**: Fill in discovered issues as you find them
3. **After completing the task**: Update the Migration Progress table
4. **When a section is fully resolved**: Mark it as RESOLVED with a date

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-05*
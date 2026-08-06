# ADR-002: UI Preservation During Style Refactoring

**Date:** 2026-07-14
**Status:** Accepted
**Type:** Constraint
**Replaces:** N/A

## Context

During the style architecture refactoring (commit `9c5508e`), replacing `_admin-theme-material.scss` with `admin-variables.scss` caused visual regression across all admin themes:

1. **Lost colored icons** in dashboard stat cards (green products, blue orders, orange users, purple revenue)
2. **Broken Glass theme** - header lost `backdrop-filter: blur(20px)`
3. **Missing CSS variables** - themes lacked required `--admin-*` tokens (`--admin-success`, `--admin-warning`, etc.)

**Root Cause:** The refactoring deleted a file containing active CSS custom properties without verifying all variables were migrated to the new token system. No visual regression testing was performed after the change.

## Decision

Establish mandatory rules for any future style refactoring that affects UI appearance:

### Rule 1: Variable Migration Checklist
Before deleting or replacing any SCSS/CSS file containing CSS custom properties:
- [ ] Extract ALL `--*` variables from the old file using `grep -r '\-\-[a-z]' file.scss`
- [ ] Verify EACH variable exists in the replacement file(s)
- [ ] Document any intentional removals with justification

### Rule 2: Theme Coverage Matrix
Every admin theme must define these required variables. Maintain a matrix:

| Variable | Light | Dark | Glass | Dark-Glass |
|----------|-------|------|-------|------------|
| `--admin-primary` | ✅ | ✅ | ✅ | ✅ |
| `--admin-success` | ✅ | ✅ | ✅ | ✅ |
| `--admin-warning` | ✅ | ✅ | ✅ | ✅ |
| `--admin-error` | ✅ | ✅ | ✅ | ✅ |
| `--admin-bg-card` | ✅ | ✅ | ✅ | ✅ |
| `--admin-bg-secondary` | ✅ | ✅ | ✅ | ✅ |
| `--admin-text-primary` | ✅ | ✅ | ✅ | ✅ |
| `--admin-text-secondary` | ✅ | ✅ | ✅ | ✅ |
| `--admin-border-primary` | ✅ | ✅ | ✅ | ✅ |

**Location:** `docs/STYLE_REFACTOR_PLAN.md` → "Critical Variables Checklist"

### Rule 3: Incremental Changes Only
- Maximum **1 style file** per commit during refactoring
- Each commit must pass visual verification before proceeding
- Use `git diff --stat` to measure impact scope
- If a commit changes >5 style files, split it into smaller commits

### Rule 4: Visual Regression Testing
After every style-related commit, verify these pages in ALL 4 themes:

| Page | Themes to Check |
|------|----------------|
| `/admin/dashboard` | Light, Dark, Glass, Dark-Glass |
| `/admin/products` | Light, Dark, Glass, Dark-Glass |
| `/admin/orders` | Light, Dark, Glass, Dark-Glass |
| `/admin/users` | Light, Dark, Glass, Dark-Glass |

**Quick Checklist:**
- [ ] Dashboard stat cards have colored icons (green/blue/orange/purple)
- [ ] Header has proper backdrop-filter in Glass themes
- [ ] Sidebar navigation renders correctly
- [ ] Tables have proper borders and alternating colors
- [ ] Buttons are clickable and show hover states

### Rule 5: File Deletion Protocol
Never delete a style file in production without:
1. Creating a `docs/migration/[filename]-migration.md` documenting what moved where
2. Running a full `grep -r 'old-variable-name' src/` to find orphaned references
3. Getting visual confirmation from at least one reviewer on all themes

## Consequences

### Positive
- Prevents visual regression during future refactoring
- Clear audit trail for style changes
- Faster debugging when issues do occur

### Negative
- Slightly slower refactoring process (safety checks add ~15 min per commit)
- More documentation to maintain

## Migration Status

The damage from commit `9c5508e` is being repaired in this cycle:
- [ ] Restore missing CSS variables to `admin-variables.scss`
- [ ] Fix Glass header backdrop-filter in `_admin-glass.scss`
- [ ] Verify all 4 themes pass visual checklist above
- [ ] Update `docs/STYLE_REFACTOR_PLAN.md` with new rules

## Related Documents
- [ADR-001](./001-style-architecture-refactoring.md) - Original style architecture refactoring
- [STYLE_REFACTOR_PLAN.md](../STYLE_REFACTOR_PLAN.md) - Refactoring plan and checklist
- [STYLE_ARCHITECTURE.md](../STYLE_ARCHITECTURE.md) - Overall style architecture
- [TOKEN_CONTRACT.md](../TOKEN_CONTRACT.md) - Token naming and usage conventions
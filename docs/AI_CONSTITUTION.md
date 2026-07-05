# AI Constitution — angular-ecommerce-3d

This document defines the rules, constraints and workflow that ALL AI agents must follow when working with this codebase. Violating these rules results in technical debt accumulation, style inconsistencies and theme breakage.

---

## 1. Role Definitions

| Role | Allowed Actions | Forbidden Actions |
|------|----------------|-------------------|
| **Principal UI Architect** (Cline) | Design architecture, create/modify documentation, define style systems, audit code | Write application logic, modify business code, implement features |
| **Implementation Engineer** (Qwen) | Implement features following architecture docs, style components using tokens, migrate code | Change architecture without approval, introduce new global patterns, bypass design tokens |
| **Code Reviewer** | Verify compliance with this constitution, flag violations | — |

---

## 2. Style Rules (NON-NEGOTIABLE)

### 2.1 Design Tokens — Single Source of Truth

| Category | Source File | Format |
|----------|-------------|--------|
| Design tokens (theme-independent) | `src/styles/tokens/_design-tokens.scss` | SCSS variables + CSS custom properties |
| Theme values (theme-dependent) | `src/styles/themes/_<theme>.scss` | CSS custom properties on `[data-theme="<theme>"]` |
| TypeScript theme definitions | `src/app/core/themes/themes/<theme>.ts` | Objects implementing `Theme` interface |

**RULE**: Never hardcode a color, spacing value, radius, shadow, or font size in a component stylesheet. Always reference a design token.

### 2.2 Forbidden Patterns

```scss
// FORBIDDEN — Hardcoded color
.my-component {
  color: #333;
  background: rgb(255, 255, 255);
  border-color: rgba(0, 0, 0, 0.12);
}

// FORBIDDEN — Inline hex in TypeScript
@Component({
  styles: [`color: #1976d2;`]
})

// FORBIDDEN — !important to override cascading
.my-component {
  color: var(--text-primary) !important;
}

// FORBIDDEN — Defining new global CSS variables in a component
.my-component {
  --my-custom-color: blue;
}

// FORBIDDEN — Duplicate variable definitions
$primary: #1976d2;        // in component file
$spacing-md: 16px;       // in component file
```

### 2.3 Correct Patterns

```scss
// CORRECT — Use design tokens
.my-component {
  color: var(--text-primary);
  background: var(--surface-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

// CORRECT — Use SCSS token functions where CSS vars aren't available
@use '../styles/tokens/design-tokens' as tokens;

:host {
  display: block;
}
```

### 2.4 Angular View Encapsulation

All components use `ViewEncapsulated.Emulated` by default. When styling child components or Angular Material elements:

- Prefer `::ng-deep` scoped to the component (not global)
- Never add global styles in a component file
- For Angular Material overrides, use the override strategy defined in `STYLE_ARCHITECTURE.md §6`

---

## 3. Theme Rules

### 3.1 Adding a New Theme

1. Create SCSS partial: `src/styles/themes/_<theme-name>.scss`
2. Create TypeScript definition: `src/app/core/themes/themes/<theme-name>-theme.ts`
3. Register in `src/app/core/themes/theme-config.ts` → `AVAILABLE_THEMES` array
4. Export from `src/styles/themes/_index.scss`
5. Update `UI_AUDIT.md` theme registry

### 3.2 Modifying an Existing Theme

1. Edit the theme's SCSS partial and TypeScript definition
2. Verify all CSS variables defined in `Theme` interface are present
3. Test both light and dark usage contexts

### 3.3 Theme Switching

Theme switching is performed by changing the `data-theme` attribute on `<html>`. All visual changes must flow through CSS custom properties — never by toggling classes on individual components.

---

## 4. File Access Rules

### 4.1 Protected Files (Read-Only Without Architect Approval)

| File | Reason |
|------|--------|
| `angular.json` | Build configuration — changes affect entire project |
| `src/styles/tokens/_design-tokens.scss` | Token definitions — changes cascade everywhere |
| `src/app/core/themes/theme.model.ts` | Theme interface — structural change breaks all themes |
| `src/app/core/themes/theme-config.ts` | Theme registry — improper changes break theme switching |
| `src/styles/main.scss` | Style entry point — import order matters |

### 4.2 Forbidden Files (Never Modify)

| Pattern | Reason |
|---------|--------|
| `node_modules/**` | Dependencies are managed by package.json |
| `dist/**` | Build output — regenerated on build |
| `backend/**` | Backend code (unless working on backend tasks) |

### 4.3 SCSS Import Rules

- Component styles import from relative paths only
- Global styles (`src/styles/`) may use `@use` for token modules
- Never import a component's SCSS into another component

---

## 5. Workflow Rules

### 5.1 Before Implementing Any UI Change

1. Read `STYLE_ARCHITECTURE.md` for current architecture
2. Read `UI_AUDIT.md` for known issues in the target area
3. Check `REDESIGN_PLAN.md` for active phase and current task

### 5.2 After Completing Any UI Task

1. Run `npm run build` — must succeed with zero errors
2. Update the active task file in `docs/tasks/`
3. Update `UI_AUDIT.md` if any audit items were resolved
4. Update `PROJECT_STATUS.md` section 3 (Completed Tasks) and section 4 (Known Issues)

### 5.3 When Discovering a New Architecture Issue

1. Document it in `UI_AUDIT.md` under the appropriate category
2. Mark status as `OPEN`
3. Do NOT attempt to fix issues outside your current task scope

### 5.4 Documentation Update Protocol

| When | What to Update |
|------|----------------|
| After style cleanup | `UI_AUDIT.md` — mark items as RESOLVED |
| After theme changes | `THEME_ENGINE.md` if new dimensions added |
| After architecture changes | `STYLE_ARCHITECTURE.md` — update affected sections |
| After phase completion | `REDESIGN_PLAN.md` — mark phase complete |

---

## 6. Build Verification

Every UI task MUST pass the following verification before marking complete:

```bash
npm run build          # Must succeed with 0 errors
```

Warnings are acceptable only if documented in `PROJECT_STATUS.md §4`.

---

## 7. Git Rules

- Commit messages must reference the task ID: `task-0XX: description`
- Do not commit generated files (`dist/`, `.build/`)
- Do not commit dependency changes unless the task explicitly requires them

---

## 8. Escalation

When an AI agent encounters a situation not covered by this constitution:

1. Document the situation clearly
2. Do NOT make architectural decisions autonomously
3. Flag for human review or Principal UI Architect consultation

---

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-05*
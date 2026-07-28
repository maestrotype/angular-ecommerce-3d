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
| **Style entry (imports only)** | `src/styles/main.scss` | Wired in `angular.json` `styles[]` — no CSS rules |
| Primitive tokens (theme-independent) | `src/styles/tokens/_primitive-tokens.scss` | CSS custom properties (raw values) |
| Semantic tokens (contextual) | `src/styles/tokens/_semantic-tokens.scss` | CSS custom properties mapping to primitives |
| Theme values (theme-dependent) | `src/styles/themes/_<theme>.scss` | CSS custom properties on `[data-theme="<theme>"]` |
| Material overrides (ADR-005) | `src/styles/overrides/_material-overrides.scss` | Token-driven `.mat-` / `.mat-mdc-` / `.mdc-` rules only |
| Material palette (B4) | `src/styles/tokens/_material-palettes.scss` + `src/admin/styles/material-theme.scss` | Sass maps mirror primitives; MDC CSS bridge → semantic |
| TypeScript theme definitions | `src/app/core/themes/themes/<theme>.ts` | Objects implementing `Theme` interface |

**RULE**: Never hardcode a color, spacing value, radius, shadow, or font size in a component stylesheet. Always reference a design token. Never append CSS to `main.scss` — it is imports-only.

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

// CORRECT — Consume semantic/primitive CSS vars; do not invent local globals
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

## 4. Developer & AI Contract

**Every developer and AI agent must follow these rules when modifying styles:**

1. **Consume semantic tokens only.** Components reference `--semantic-*` exclusively.
2. **Never declare global variables in component styles.** Component SCSS is self-contained.
3. **Never redefine theme variables outside theme files.** Theme definitions live in `src/styles/themes/`.
4. **Never hardcode design values.** Colors, spacing, radius, shadows, and typography flow through tokens.
5. **Never use `!important` or `::ng-deep`.** These bypass architectural boundaries.
6. **Material overrides live in one file.** Scattered overrides are forbidden per `STYLE_REFACTOR_PLAN.md §ADR-005`.
7. **New themes follow the nine-dimension model.** Color-only themes are insufficient per `STYLE_REFACTOR_PLAN.md §ADR-004`.
8. **`main.scss` contains imports only.** Appending CSS to the style entry file is forbidden per `STYLE_REFACTOR_PLAN.md §ADR-003`. (`src/styles.scss` was removed in A5.)
9. **Admin reuses shared tokens.** Admin-specific namespaces are reserved for layout values only per `STYLE_REFACTOR_PLAN.md §ADR-009`.
10. **When in doubt, read STYLE_REFACTOR_PLAN.md first.** It is the single source of truth for style architecture.

**Contract Violations:** Any violation of the above rules is treated as an architectural regression and must be reverted before merge.

---

## 5. File Access Rules

### 5.1 Protected Files (Read-Only Without Architect Approval)

| File | Reason |
|------|--------|
| `angular.json` | Build configuration — changes affect entire project |
| `src/styles/tokens/_primitive-tokens.scss` | Primitive token definitions — changes cascade everywhere |
| `src/styles/tokens/_semantic-tokens.scss` | Semantic mappings — changes cascade to all consumers |
| `src/styles/tokens/_material-palettes.scss` | Material Sass palettes + CSS bridge (B4) — keep hex in sync with primitives |
| `src/admin/styles/material-theme.scss` | Material theme entry — token-bound; do not reintroduce stock palettes |
| `src/styles/overrides/_material-overrides.scss` | Central Material overrides (ADR-005) |
| `src/app/core/themes/theme.model.ts` | Theme interface — structural change breaks all themes |
| `src/app/core/themes/theme-config.ts` | Theme registry — improper changes break theme switching |
| `src/styles/main.scss` | Style entry point — import order matters |

### 5.2 Forbidden Files (Never Modify)

| Pattern | Reason |
|---------|--------|
| `node_modules/**` | Dependencies are managed by package.json |
| `dist/**` | Build output — regenerated on build |
| `backend/**` | Backend code (unless working on backend tasks) |

### 5.3 SCSS Import Rules

- Component styles import from relative paths only
- Global styles (`src/styles/`) may use `@use` for token modules
- Never import a component's SCSS into another component

---

## 6. Workflow Rules

### 6.1 Before Implementing Any UI Change

1. Check `REFACTORING_BOARD.md` for the current epic, task, and its Definition of Done
2. Read `STYLE_REFACTOR_PLAN.md` for architectural decisions and target end-state
3. Read `STYLE_ARCHITECTURE.md` for current architecture
4. Read `UI_AUDIT.md` for known issues in the target area

### 6.2 After Completing Any UI Task

1. Run `npm run build` — must succeed with zero errors
2. Update the task status in `REFACTORING_BOARD.md` (§4) and affected metrics (§1) — re-measure, do not guess
3. Update `UI_AUDIT.md` if any audit findings were resolved
4. Add one changelog line to `PROJECT_STATUS.md` (Recent Changes)

**RULE**: Never mark a task ✅ without measurable proof (metric re-scan, screenshot, or grep output). Documentation drifted from code once; it must not happen again.

### 6.3 When Discovering a New Architecture Issue

1. Document it in `UI_AUDIT.md` under the appropriate category
2. Mark status as `OPEN`
3. Do NOT attempt to fix issues outside your current task scope

### 6.4 Documentation Update Protocol

| When | What to Update |
|------|----------------|
| After any refactoring task | `REFACTORING_BOARD.md` — task status + metrics (single source of truth for progress) |
| After style cleanup | `UI_AUDIT.md` — mark findings as RESOLVED |
| After theme changes | `THEME_ENGINE.md` if new dimensions added |
| After architecture changes | `STYLE_ARCHITECTURE.md` — update affected sections |
| After epic completion | `PROJECT_STATUS.md` — update epic status table |

---

## 7. Build Verification

Every UI task MUST pass the following verification before marking complete:

```bash
npm run build          # Must succeed with 0 errors
```

Warnings are acceptable only if documented in `PROJECT_STATUS.md §4`.

---

## 8. Git Rules

- Commit messages must reference the task ID: `task-0XX: description`
- Do not commit generated files (`dist/`, `.build/`)
- Do not commit dependency changes unless the task explicitly requires them

---

## 9. Escalation

When an AI agent encounters a situation not covered by this constitution:

1. Document the situation clearly
2. Do NOT make architectural decisions autonomously
3. Flag for human review or Principal UI Architect consultation

---

## Rule: No Replanning

When the project already contains an approved architecture, roadmap, ADR, or implementation plan, you MUST NOT create a new plan.

Before starting any task:

1. Read the existing documentation.
2. Identify the current implementation step.
3. Continue from that exact point.

You MUST NOT:
- rewrite the roadmap;
- create alternative implementation plans;
- propose a different architecture;
- regenerate documents that already exist;
- repeatedly summarize the same documentation;
- stop work to suggest another planning phase.

Planning is allowed ONLY if:
- the requested document does not exist; or
- the user explicitly asks to redesign the architecture.

Otherwise your response must begin implementation immediately.

If the task is too large, split it into small implementation steps and execute the first one instead of creating a new plan.

Default behavior:
**Read → Understand → Implement. Never Read → Replan.**

*This document is maintained by the Principal UI Architect. Last updated: 2026-07-06*
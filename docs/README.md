# Developer Documentation

Technical reference for the Angular 17+ 3D E-commerce Platform.

---

## AI Agent Workflow

> **Для ИИ-ассистентов**: Начните работу с этих файлов.

| File | Purpose |
|------|---------|
| [AI_CONSTITUTION.md](AI_CONSTITUTION.md) | **Read First** — Rules all AI agents must follow |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current status, active task, roadmap |
| [tasks/](tasks/) | Task descriptions (`task_XXX_name.md`) |
| [templates/task-template.md](templates/task-template.md) | Template for creating new tasks |

---

## Architecture Decision Records (ADRs)

> **ADR**s document significant architectural decisions, their context, and consequences.
> See [adr/](adr/) for the full list.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](adr/001-style-architecture-refactoring.md) | Style Architecture Refactoring | proposed |

---

## UI Architecture Documentation

> **Read before making any style, theme, or component changes.**

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [STYLE_REFACTOR_PLAN.md](STYLE_REFACTOR_PLAN.md) | Migration plan — Phase-by-phase refactoring roadmap | Before any architectural style changes |
| [STYLE_ARCHITECTURE.md](STYLE_ARCHITECTURE.md) | Style hierarchy, token flow, SCSS structure, forbidden patterns | Before any CSS/SCSS changes |
| [THEME_ENGINE.md](THEME_ENGINE.md) | Multi-dimensional theme engine specification | When adding/modifying themes |
| [REDESIGN_PLAN.md](REDESIGN_PLAN.md) | Phased redesign roadmap with atomic tasks | Before starting UI work |
| [UI_AUDIT.md](UI_AUDIT.md) | Architecture cleanup tracker — update after every style task | After completing style tasks |
| [COMPONENT_GUIDELINES.md](COMPONENT_GUIDELINES.md) | Component styling patterns and best practices | When creating new components |

---

## Application Documentation

| Module | Description |
|--------|-------------|
| [Quick Start Guide](GETTING_STARTED.md) | System requirements, environment configuration, local deployment |
| [Core Architecture](ARCHITECTURE.md) | SSR engine, hydration strategy, backend service layer |
| [Customization & Branding](CUSTOMIZATION.md) | Theme tokens (quick ref), 3D viewer config, i18n, social auth |
| [API Reference](BACKEND_API.md) | NestJS REST API, authentication guards, DTO structures |
| [Admin Dashboard Guide](ADMIN_GUIDE.md) | Managing products, categories, SEO via Admin UI |
| [Troubleshooting](TROUBLESHOOTING.md) | SSR hydration, 3D rendering, database connectivity issues |

---

## Document Navigation Map

```
                        Need to understand the project?
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
   AI_CONSTITUTION.md    PROJECT_STATUS.md      ARCHITECTURE.md
   (AI rules)            (Current state)        (App architecture)

                         Need to change styles?
                                │
         ┌──────────────────────────────────────────────┐
         ▼                                              ▼
    STYLE_REFACTOR_PLAN.md                     Need implementation details?
    (Architecture decisions, contracts)                  │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
    STYLE_ARCHITECTURE.md  THEME_ENGINE.md      COMPONENT_GUIDELINES.md
    (How styles work)     (Theme system)        (Component patterns)

                        Need to customize?
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
   CUSTOMIZATION.md      GETTING_STARTED.md   TROUBLESHOOTING.md
   (Dev customization)   (Setup guide)         (Problem solving)
```

---

## Technical Stack

- **Frontend**: Angular 17 (Standalone Components, SSR, Signals-ready architecture)
- **3D Engine**: Three.js with GLTFLoader and Meshopt decoder support
- **Backend**: NestJS 10 (TypeORM, JWT, Passport)
- **Database**: PostgreSQL (Relational)

---

*For high-level project information, refer to the root [README.md](../README.md).*
# Developer Documentation

Technical reference for the Angular 17+ 3D E-commerce Platform.

---

## AI Agent Workflow

> **Для ИИ-ассистентов**: Начните работу с этих файлов.

| File | Purpose |
|------|---------|
| [AI_CONSTITUTION.md](AI_CONSTITUTION.md) | **Read First** — Rules all AI agents must follow |
| [REFACTORING_BOARD.md](REFACTORING_BOARD.md) | **Single source of truth for refactoring progress** — metrics, epics, tasks (Done / In Progress / To Do / Planned) |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | High-level project status and changelog |
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

> **Buyer / marketplace pack:** open the visual hub → [`client/index.html`](client/index.html)  
> Rebuild: `npm run docs:client` (from Markdown sources below).

| Module | Description | Visual HTML |
|--------|-------------|-------------|
| [Quick Start](QUICK_START.md) | Under-10-minute setup | [client/quick-start.html](client/quick-start.html) |
| [Getting Started](GETTING_STARTED.md) | Environment, SSR, deploy | [client/getting-started.html](client/getting-started.html) |
| [Installation](INSTALLATION.md) | Full install + security checklist | [client/installation.html](client/installation.html) |
| [Architecture](ARCHITECTURE.md) | SSR & service layer overview | [client/architecture.html](client/architecture.html) |
| [Customization](CUSTOMIZATION.md) | Themes, 3D, i18n | [client/customization.html](client/customization.html) |
| [3D Platform Showcase](3D_PLATFORM_PRESENTATION.md) | Showcase of 3D features and future tasks | [client/3d-presentation.html](client/3d-presentation.html) |
| [API Reference](BACKEND_API.md) | NestJS REST API | [client/backend-api.html](client/backend-api.html) |
| [Admin Guide](ADMIN_GUIDE.md) / [Admin Manual](ADMIN_MANUAL.md) | Store owner docs | [client/admin-manual.html](client/admin-manual.html) |
| [Payments](PAYMENT_SETUP.md) | Stripe / LiqPay / PayPal | [client/payment-setup.html](client/payment-setup.html) |
| [FAQ](FAQ.md) · [Troubleshooting](TROUBLESHOOTING.md) · [Support](SUPPORT.md) | Help | [client/faq.html](client/faq.html) |
| [Backend Diagram](BACKEND_ARCHITECTURE_DIAGRAM.html) | Interactive NestJS map | same file |

---

## Business & Launch

| Document | Purpose |
|----------|---------|
| [MARKETPLACE_LAUNCH_ROADMAP.md](MARKETPLACE_LAUNCH_ROADMAP.md) | Template launch checklist (Track A) and enterprise hardening path (Track B) |

---

## Document Navigation Map

```
                        Need to understand the project?
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
   AI_CONSTITUTION.md    PROJECT_STATUS.md      ARCHITECTURE.md
   (AI rules)            (Current state)        (App architecture)

                        Need a task to work on?
                               │
                               ▼
                      REFACTORING_BOARD.md
                (Progress metrics, epics A–G, task statuses)

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
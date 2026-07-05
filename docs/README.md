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

## UI Architecture Documentation

> **Read before making any style, theme, or component changes.**

| Document | Purpose |
|----------|---------|
| [STYLE_ARCHITECTURE.md](STYLE_ARCHITECTURE.md) | Style hierarchy, token flow, folder structure, forbidden patterns |
| [THEME_ENGINE.md](THEME_ENGINE.md) | Multi-dimensional theme engine specification |
| [REDESIGN_PLAN.md](REDESIGN_PLAN.md) | Phased redesign roadmap with atomic tasks |
| [UI_AUDIT.md](UI_AUDIT.md) | Architecture cleanup tracker — update after every style task |

---

## Application Documentation

| Module | Description |
|--------|-------------|
| [Quick Start Guide](GETTING_STARTED.md) | System requirements, environment configuration, local deployment |
| [Core Architecture](ARCHITECTURE.md) | SSR engine, hydration strategy, backend service layer |
| [Customization & Branding](CUSTOMIZATION.md) | Theme tokens, 3D viewer configuration, localization |
| [API Reference](BACKEND_API.md) | NestJS REST API, authentication guards, DTO structures |
| [Admin Dashboard Guide](ADMIN_GUIDE.md) | Managing products, categories, SEO via Admin UI |
| [Troubleshooting](TROUBLESHOOTING.md) | SSR hydration, 3D rendering, database connectivity issues |

---

## Technical Stack
- **Frontend**: Angular 17 (Standalone Components, SSR, Signals-ready architecture)
- **3D Engine**: Three.js with GLTFLoader and Meshopt decoder support
- **Backend**: NestJS 10 (TypeORM, JWT, Passport)
- **Database**: PostgreSQL (Relational)

---

*For high-level project information, refer to the root [README.md](../README.md).*
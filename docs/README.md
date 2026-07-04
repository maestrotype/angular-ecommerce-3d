# Developer Documentation

Technical reference for the Angular 17+ 3D E-commerce Platform.

## AI Agent Workflow (New)

> **Для ИИ-ассистентов**: Начните работу с этих файлов.

| Файл | Назначение |
|------|-----------|
| [AI_PROJECT_PROMPT.md](AI_PROJECT_PROMPT.md) | Системный промпт: правила кода, дизайн-система, prompt templates |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Текущий статус проекта, активная задача, дорожная карта |
| [tasks/](tasks/) | Описание задач в формате `task_XXX_name.md` |
| [templates/task-template.md](templates/task-template.md) | Шаблон для создания новой задачи |

## Documentation Modules

1. **[Quick Start Guide](GETTING_STARTED.md)**
   System requirements, environment configuration, and local deployment instructions.

2. **[Core Architecture](ARCHITECTURE.md)**
   Technical overview of the SSR engine, hydration strategy, and backend service layer.

3. **[Customization & Branding](CUSTOMIZATION.md)**
   Guide on theme tokens, 3D viewer configuration, and localization.

4. **[API Reference](BACKEND_API.md)**
   Overview of the NestJS REST API, authentication guards, and DTO structures.

5. **[Admin Dashboard Guide](ADMIN_GUIDE.md)**
   Operational guide for managing products, categories, and SEO settings via the Admin UI.

6. **[Troubleshooting](TROUBLESHOOTING.md)**
   Common issues related to SSR hydration, 3D rendering, and database connectivity.

## Technical Stack
- **Frontend**: Angular 17 (Standalone Components, SSR, Signals-ready architecture).
- **3D Engine**: Three.js with GLTFLoader and Meshopt decoder support.
- **Backend**: NestJS 10 (TypeORM, JWT, Passport).
- **Database**: PostgreSQL (Relational).

---
*For high-level project information, refer to the root [README.md](../README.md).*

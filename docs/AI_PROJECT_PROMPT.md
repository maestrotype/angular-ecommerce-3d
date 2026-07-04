# AI Project Prompt — Универсальный системный промпт

> **Project**: angular-ecommerce-3d
> **Цель**: Привести проект к чёткой архитектуре, устранить проблемы без повторения ошибок, вести историю исправлений.
> **Целевая модель**: Qwen3-Coder-30B / Claude / GPT (адаптируется под любой AI-ассистент)
> **Формат**: Скопируйте этот файл в корень `docs/` вашего проекта и адаптируйте под него.

---

## ЧАСТЬ 1: AI Конституция

### 1.1 Запуск и управление контекстом

- **Читать ТОЛЬКО 3 файла при старте**:
  1. `docs/AI_PROJECT_PROMPT.md` (этот файл)
  2. `docs/PROJECT_STATUS.md` (текущий статус и дорожная карта)
  3. Активный файл задачи, указанный в `PROJECT_STATUS.md` (например `docs/tasks/task_XXX.md`)
- **НЕ читать другие файлы документации** (например, файлы в `docs/` кроме указанных выше).
- **НЕ сканировать репозиторий** рекурсивно. Читать только файлы, явно указанные в активной задаче.
- **НЕ выполнять фазы планирования** или писать сравнения решений. Начинать кодирование немедленно.

### 1.2 Ограничения кода

- **Без архитектурных изменений**: Не предлагать рефакторинги, переименования или перемещения папок, если это явно не указано в активной задаче.
- **Держать компоненты маленькими**:
  - TypeScript логика: `< 150` строк кода.
  - HTML шаблон: `< 120` строк кода.
  - SCSS/CSS стили: `< 200` строк кода.
- **Без дублирования UI**: Всегда проверять `shared/ui/` (или аналогичную папку) перед созданием кнопок, инпутов, модалок, карточек, бейджей или спиннеров.
- **Строгая типизация**:
  - Всегда использовать явные типы. Никогда не использовать `any`.
  - Использовать точные enum и union типы, определённые в компонентах UI.
- **Без плейсхолдеров и логов**:
  - НЕ писать `console.log`, `TODO`, `FIXME` или временные mock-структуры.
  - Писать полный production-ready код.

### 1.3 Границы области видимости

- **Редактировать ТОЛЬКО файлы**, указанные в секции "Files to edit" активной задачи.
- **НИКОГДА не редактировать файлы**, указанные в секции "Files forbidden to edit".
- **НЕ модифицировать файлы документации** (кроме обновления статуса в `docs/PROJECT_STATUS.md` после завершения).

### 1.4 Компиляция, фикс и верификация

- **Компилировать после изменений**: Немедленно запустить build команду из активной задачи.
- **Исправлять ошибки компиляции мгновенно**:
  - Если билд упал — остановиться, прочитать ошибку, определить файл и строку, исправить конфликт.
  - НЕ модифицировать другой нереLATED код при исправлении build ошибок.
- **Формат коммита**: Подготовить commit message точно по шаблону активной задачи (Conventional Commits).

---

## ЧАСТЬ 2: Дизайн-система

### 2.1 CSS Custom Property Токены

> **Правило**: Использовать custom properties напрямую в SCSS/CSS компонентах. Никогда не использовать захардкоженные hex, RGB или raw HSL значения.

#### Текст
| Токен | Назначение |
|-------|-----------|
| `--text-primary` | Основной текст (#1e293b default / #f8fafc dark) |
| `--text-secondary` | Вторичный текст (#64748b default / #cbd5e1 dark) |
| `--text-tertiary` | Приглушённый текст (#94a3b8 default / #94a3b8 dark) |
| `--text-inverse` | Инверсный текст (#ffffff default / #000000 glass) |

#### Поверхности (Surfaces)
| Токен | Назначение |
|-------|-----------|
| `--surface-primary` | Базовый фон карточек (#ffffff default / #1e293b dark) |
| `--surface-secondary` | Фон панелей (#f8f9fa default / #334155 dark) |
| `--surface-tertiary` | Фон поверхностных элементов (#e9ecef default / #475569 dark) |
| `--surface-hover` | Фон при наведении (#f1f3f4 default / #3b82f6 dark) |

#### Бордеры
| Токен | Назначение |
|-------|-----------|
| `--border-primary` | Стандартный бордер (#e5e7eb default) |
| `--border-secondary` | Утончённый бордер (#f3f4f6 default) |
| `--border-focus` | Бордер состояния фокуса (#6366f1 default) |

#### Кнопки
| Токен | Назначение |
|-------|-----------|
| `--button-primary-bg` | Основной фон кнопки (#6366f1 dark) |
| `--button-primary-text` | Текст кнопки (#ffffff) |
| `--button-primary-border` | Бордер кнопки (#6366f1 dark) |

#### Карточки
| Токен | Назначение |
|-------|-----------|
| `--card-radius` | Радиус карточек (0px default / 8px dark / 24px glass) |

#### Glass-эффекты
| Токен | Назначение |
|-------|-----------|
| `--glass-btn-bg` | Фон glass-кнопки |
| `--glass-btn-border` | Бордер glass-кнопки |
| `--glass-btn-color` | Цвет текста glass-кнопки |
| `--glass-btn-shadow` | Тень glass-кнопки |

#### Секции (Header, Footer, Hero и др.)
| Токен | Назначение |
|-------|-----------|
| `--header-bg` | Фон хедера |
| `--header-text` | Цвет текста хедера |
| `--footer-bg` | Фон футера |
| `--footer-text` | Цвет текста футера |
| `--hero-bg-gradient` | Градиент hero-секции |

> **Полный список токенов**: `src/styles/tokens/_theme-variables.scss`

### 2.2 Темы

Проект поддерживает **3 темы**, переключаемые через `data-theme` атрибут на `<html>`:

| Тема | `data-theme` | Описание |
|------|-------------|----------|
| Default | `"default"` или `"light"` | Светлая тема с нейтральными цветами |
| Dark | `"dark"` | Тёмная тема (slate palette: #0f172a, #1e293b, #334155) |
| Glass | `"glass"` | Glassmorphism тема с прозрачностью и blur-эффектами |

### 2.3 Правила композиции компонентов

- **Smart vs Dumb компоненты**:
  - **Smart (Pages)**: Отвечают за роутинг, композицию layout и подключение состояния (signals/services).
  - **Dumb (Entities/Widgets/Shared)**: Получают данные через `@Input` / `signal input()`, отправляют события через `@Output` / `output()`. Без прямой мутации состояния или роутинга.
- **Shared UI First**:
  - Никогда не писать сырые `<button>`, `<input>`, `<select>` в страницах или виджетах.
  - Использовать компоненты из `shared/ui/`.
- **Строгая типизация для Shared UI**:
  - Всегда соответствовать точным union типам для входных параметров компонентов.
  - НЕ передавать динамические строки напрямую в variant inputs, если они не соответствуют разрешённым типам.

### 2.4 Структурные ограничения

- **Глубина вложенности**: Максимум 4 уровня в HTML шаблонах.
- **Flexbox vs Grid**: Flexbox для выравнивания и линейных компонентов. Grid только для табличных сеток карточек.
- **OnPush Change Detection**: Каждый компонент должен объявлять `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Разделение файлов компонентов**: Не использовать inline styles и templates. Держать файлы разделённые: `.component.ts`, `.html`, `.scss`/`.css`.

---

## ЧАСТЬ 3: Система задач

### 3.1 Формат описания задачи

Каждая задача описывается в отдельном файле `docs/tasks/task_XXX_<name>.md`. Шаблон находится в `docs/templates/task-template.md`.

```markdown
# Task XXX: <Название задачи>

## Goal
<Описание цели в 1-2 предложениях>

## Files to Edit
- `path/to/file1.ext`
- `path/to/file2.ext`

## Files Forbidden to Edit
- `path/to/forbidden-file.ext`
- Any files under `shared/ui/`

## Context Specs
- <Контекстная информация, необходимая для выполнения задачи>
- <Технические детали и зависимости>

## Definition of Done
1. <Критерий завершения 1>
2. <Критерий завершения 2>
3. `npm run build` выполняется без ошибок

## Build Command
```bash
npm run build
```

## Commit Message
```
feat(scope): краткое описание изменения
```
```

### 3.2 Фазовая структура

Рекомендуемые фазы:
1. **Infrastructure** — базовые сервисы, утилиты, конфигурация
2. **3D Pipeline** — загрузка, сохранение и генерация 3D моделей
3. **Layouts & Core Shell** — базовая структура, layout-контейнеры
4. **Auth Views** — страницы авторизации
5. **Dashboard** — главная панель админки
6. **Feature Pages** — страницы фич
7. **Overlays & Dialogs** — модалки, диалоги
8. **Polish & Animations** — анимации, финальная полировка

---

## ЧАСТЬ 4: История исправлений (Bug History)

> **Цель**: Вести журнал багов, их причин и решений. При появлении нового бага — сначала проверить эту таблицу.

### 4.1 Формат записи

| # | Дата | Баг / Проблема | Причина | Решение | Как предотвратить |
|---|------|---------------|---------|---------|-------------------|
| BH-001 | — | — | — | — | — |
| BH-002 | — | — | — | — | — |

### 4.2 Правила работы с Bug History

1. **Перед исправлением нового бага** — проверить таблицу на похожие проблемы.
2. **После исправления бага** — добавить запись в таблицу с полной информацией.
3. **При рефакторинге** — проверить, не затрагивает ли он ранее исправленные области.
4. **При обзоре кода** — убедиться, что решение не вводит уже известные паттерны ошибок.

### 4.3 Common Pitfalls (типичные ловушки)

| Паттерн | Описание | Решение |
|---------|----------|---------|
| **Shadow CSS** | Стили не применяются из-за Angular view encapsulation | Использовать `::ng-deep` (минимально) или переместить стили в глобальный/родительский SCSS |
| **Type mismatch** | Динамическая строка не соответствует union-типу компонента | Маппить значения перед передачей, или использовать fallback |
| **Memory leak** | Subscriptions не отписываются при уничтожении компонента | Использовать `takeUntilDestroyed` / `async` pipe |
| **Stale signals** | Signal не обновляется из-за мутации объекта | Заменять объект целиком, а не мутировать поля |
| **Double change detection** | Ручной `detectChanges()` вызывает цикл | Убрать ручной CD, полагаться на signal-based updates |
| **Three.js memory** | GL geometries/materials не очищаются при удалении модели | Вызывать `.dispose()` для geometry, material и texture перед удалением объекта |

---

## ЧАСТЬ 5: Prompt Templates

### 5.1 Implement Task (выполнить задачу)
```
Read docs/AI_PROJECT_PROMPT.md and docs/PROJECT_STATUS.md.
Read active task spec: [path/to/task.md].
Implement the target changes in the listed files. Run the build command and verify.
```

### 5.2 Fix Build Errors (исправить ошибки сборки)
```
The build failed:
[PASTE BUILD ERROR LOG]
Identify the file and line, resolve the type/syntax conflict, and build again to verify.
Do NOT edit other files.
```

### 5.3 Refactor Component (рефакторинг компонента)
```
Refactor component [component-name]:
- Maintain OnPush change detection.
- Keep TS < 150 lines, HTML < 120 lines, SCSS < 200 lines.
- Ensure all styled elements use var(--color-*) design tokens.
Run the build command after refactoring.
```

### 5.4 Debug & Fix (отладка и исправление бага)
```
Bug: [DESCRIPTION]
Steps to reproduce: [STEPS]
Expected behavior: [EXPECTED]
Actual behavior: [ACTUAL]

Check docs/AI_PROJECT_PROMPT.md Bug History table for similar issues.
Identify root cause, fix the issue, update Bug History table, and verify with build + tests.
```

### 5.5 Update Progress (обновить прогресс)
```
Task is successful. Update docs/PROJECT_STATUS.md:
- Mark the current task as completed [x].
- Set the next task in the roadmap as the active task.
Propose a git commit message following Conventional Commits.
```

### 5.6 Stop After Completion (остановиться после завершения)
```
The task is finished and build passes. Propose the commit message and STOP.
Do not select or begin any new tasks.
```

---

## ЧАСТЬ 6: Technical Stack Reference

### Frontend
| Технология | Версия | Назначение |
|-----------|--------|-----------|
| Angular | 17.3 | Основной фреймворк (Standalone Components, SSR) |
| TypeScript | 5.2 | Язык разработки |
| Three.js | 0.158 | 3D рендеринг (GLTFLoader, DRACOLoader, MeshoptDecoder) |
| RxJS | 7.8 | Реактивное программирование |
| Angular Material | 17.3 | UI компоненты |
| ng2-charts | 6.0 | Графики на Chart.js |
| @ngx-translate | 16.0 | Интернационализация (en, ru, ua) |

### Backend
| Технология | Назначение |
|-----------|-----------|
| NestJS | REST API сервер |
| TypeORM | ORM для базы данных |
| JWT + Passport | Аутентификация |

### Testing
| Инструмент | Назначение |
|-----------|-----------|
| Jest | Unit тесты |
| Playwright | E2E тесты |

### Build Commands
```bash
npm run build           # Сборка frontend
npm run build:prod      # Production сборка (frontend + SSR server)
npm run start           # Dev сервер (ng serve)
npm run test            # Запуск Jest тестов
npm run e2e             # Запуск Playwright e2e тестов
```

---

## Приложение A: Conventional Commits формат

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`

**Примеры**:
```
feat(3d-viewer): add GLTF model caching with skeleton cloning
fix(product-detail): resolve card radius token mismatch in dark theme
refactor(admin): consolidate user table into shared admin-table component
chore(docs): update project status after task 001 completion
```

## Приложение B: Чеклист качества кода

Перед каждым коммитом проверить:

- [ ] Нет `any` типов
- [ ] Нет `console.log`, `TODO`, `FIXME`
- [ ] Компонент `< 150` строк TS, `< 120` HTML, `< 200` SCSS
- [ ] Все цвета через CSS custom properties (`--text-primary`, `--surface-primary` и т.д.)
- [ ] OnPush change detection установлен
- [ ] Используются shared UI компоненты (не сырые HTML элементы)
- [ ] Build проходит без ошибок (`npm run build`)
- [ ] Bug History обновлён (если исправлялся баг)
- [ ] PROJECT_STATUS.md обновлён

---

> **Версия промпта**: 1.0
> **Последнее обновление**: 2026-07-04
> **Проект**: angular-ecommerce-3d
# Task XXX: <Название задачи>

## Status: 🔄 IN PROGRESS
<!-- Options: ⏳ PENDING | 🔄 IN PROGRESS | ✅ COMPLETED -->

## Goal
<Описание цели в 1-2 предложениях. Что должно быть сделано и какой результат ожидается?>

## Files to Edit
- `path/to/file1.ext`
- `path/to/file2.ext`

## Files Forbidden to Edit
- `path/to/forbidden-file.ext`
- Any files under `shared/ui/` (если не требуется)

## Context Specs
- <Контекстная информация, необходимая для выполнения задачи>
- <Технические детали и зависимости>
- <Ссылки на связанные модели, сервисы или компоненты>

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

---

## Implementation Log
<!-- Заполняйте по мере выполнения задачи -->

### Changes Made
| File | Change Description |
|------|-------------------|
| `path/to/file.ext` | <Что изменено и почему> |

### Issues Encountered
- <Проблема и как решена>

## Post-Task: Update Project Status
**Обязательно обновите документацию после завершения задачи:**

1. **Измените статус в этом файле** на `## Status: ✅ COMPLETED`
2. **Заполните Implementation Log** всеми изменениями и проблемами
3. **Обновите `docs/PROJECT_STATUS.md`:**
   - Раздел 1: Обновите Current Active Task (статус ✅ COMPLETED)
   - Раздел 3: Добавьте задачу в Completed Tasks Record
   - Раздел 4: Обновите Known Issues (удалите решённые, добавьте новые)
4. **Обновите `docs/tasks/task_XXX_<name>.md`:**
   - Добавьте раздел "Implementation Details" со всеми изменениями
   - Заполните Testing Checklist
   - Добавьте раздел "Files Modified" с таблицей всех изменений

## Notes
- <Дополнительные заметки, ссылки на код или дизайн>
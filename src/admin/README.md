# Admin Panel Theme System

## Обзор

Система тем для админ-панели использует CSS переменные для централизованного управления цветами и стилями. Это позволяет легко изменять тему всего приложения, изменяя только несколько переменных.

## Структура файлов

```
src/admin/styles/
├── admin-variables.scss    # Основные переменные цветов и размеров
├── admin-mixins.scss       # SCSS миксины для переиспользования стилей
└── admin-global.scss       # Глобальные стили для Material компонентов
```

## Основные переменные

### Цвета

#### Основные цвета (синяя тема)
- `--admin-primary: #1976d2` - Основной синий цвет
- `--admin-primary-light: #42a5f5` - Светлый синий
- `--admin-primary-dark: #1565c0` - Темный синий
- `--admin-accent: #2196f3` - Акцентный синий

#### Фоны
- `--admin-bg-primary: #121212` - Основной фон
- `--admin-bg-secondary: #1e1e1e` - Вторичный фон
- `--admin-bg-tertiary: #2d2d2d` - Третичный фон
- `--admin-bg-card: #374151` - Фон карточек
- `--admin-bg-header: #1976d2` - Фон хедера (синий)
- `--admin-bg-sidenav: #1f2937` - Фон сайдбара
- `--admin-bg-content: #1f2937` - Фон контента

#### Текст
- `--admin-text-primary: rgba(255, 255, 255, 0.87)` - Основной текст
- `--admin-text-secondary: rgba(255, 255, 255, 0.6)` - Вторичный текст
- `--admin-text-disabled: rgba(255, 255, 255, 0.38)` - Отключенный текст
- `--admin-text-inverse: #000000` - Инвертированный текст

#### Границы
- `--admin-border-primary: #404040` - Основные границы
- `--admin-border-secondary: #4b5563` - Вторичные границы
- `--admin-border-light: #6b7280` - Светлые границы

#### Статусы
- `--admin-success: #4caf50` - Успех (зеленый)
- `--admin-warning: #ff9800` - Предупреждение (оранжевый)
- `--admin-error: #f44336` - Ошибка (красный)
- `--admin-info: #2196f3` - Информация (синий)

### Размеры

#### Отступы
- `--admin-spacing-xs: 4px`
- `--admin-spacing-sm: 8px`
- `--admin-spacing-md: 16px`
- `--admin-spacing-lg: 24px`
- `--admin-spacing-xl: 32px`

#### Радиусы
- `--admin-border-radius-sm: 4px`
- `--admin-border-radius-md: 8px`
- `--admin-border-radius-lg: 12px`

#### Тени
- `--admin-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3)`
- `--admin-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3)`
- `--admin-shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.3)`

#### Переходы
- `--admin-transition-fast: 0.15s ease`
- `--admin-transition-normal: 0.3s ease`
- `--admin-transition-slow: 0.5s ease`

## Использование

### В SCSS файлах

```scss
.my-component {
  background-color: var(--admin-bg-card);
  color: var(--admin-text-primary);
  padding: var(--admin-spacing-md);
  border-radius: var(--admin-border-radius-md);
  box-shadow: var(--admin-shadow-sm);
  transition: var(--admin-transition-normal);
}
```

### Использование миксинов

```scss
.my-card {
  @include admin-card;
}

.my-button {
  @include admin-button('primary');
}

.my-form-field {
  @include admin-form-field;
}

.my-table {
  @include admin-table;
}
```

### Изменение темы

Для изменения темы на светлую, добавьте атрибут `data-theme="light"` к корневому элементу:

```html
<div data-theme="light">
  <!-- Содержимое с светлой темой -->
</div>
```

## Компоненты

### Material Design Override

Все Material Design компоненты автоматически стилизуются для темной темы:

- Form Fields (поля ввода)
- Buttons (кнопки)
- Tables (таблицы)
- Paginator (пагинация)
- Select (выпадающие списки)
- Menu (меню)
- Dialog (диалоги)
- Tooltip (подсказки)
- Snackbar (уведомления)

### Кастомные компоненты

Все кастомные компоненты админки используют переменные:

- Header (хедер)
- Sidenav (сайдбар)
- Cards (карточки)
- Forms (формы)
- Tables (таблицы)

## Быстрое изменение цветов

Для изменения основной цветовой схемы, отредактируйте файл `admin-variables.scss`:

```scss
:root {
  // Измените эти переменные для новой цветовой схемы
  --admin-primary: #your-color;
  --admin-bg-header: #your-header-color;
  --admin-accent: #your-accent-color;
}
```

## Совместимость

Система совместима с:
- Angular Material 15+
- Angular 17+
- Все современные браузеры
- Мобильные устройства

## Поддержка

При добавлении новых компонентов:
1. Используйте переменные вместо хардкода цветов
2. Добавьте новые переменные в `admin-variables.scss` при необходимости
3. Создайте миксины для переиспользуемых стилей
4. Обновите документацию 
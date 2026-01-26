# 📸 Руководство по визуальным материалам

Структура папок и рекомендации для скриншотов и видео для продажи на маркетплейсах.

---

## 📁 Структура папок проекта

```
angular-ecommerce-3d/
├── screenshots/              # Все скриншоты для документации
│   ├── desktop/             # Скриншоты desktop версии
│   ├── mobile/              # Скриншоты мобильной версии
│   └── admin/               # Скриншоты админ-панели
├── preview-images/          # Preview изображения для маркетплейсов
│   ├── themeforest/        # Для ThemeForest
│   └── templatemonster/    # Для TemplateMonster
├── demo-video/             # Demo видео
│   ├── raw/                # Исходные файлы
│   └── final/              # Финальное видео
└── docs/                   # Документация (уже создана)
```

---

## 📸 Скриншоты (Screenshots)

### Расположение: `/screenshots/`

### Desktop скриншоты (`/screenshots/desktop/`)

**Требования:**
- ✅ Разрешение: **1920x1080px** (Full HD)
- ✅ Формат: **PNG** (для качества) или **WebP** (для размера)
- ✅ Качество: **Максимальное**
- ✅ Оптимизация: Да (TinyPNG, ImageOptim)

**Файлы для создания:**

1. `01-homepage-light.png` - Главная страница (светлая тема)
2. `02-homepage-dark.png` - Главная страница (тёмная тема)
3. `03-homepage-glass.png` - Главная страница (glass тема)
4. `04-homepage-darkglass.png` - Главная страница (dark glass тема)
5. `05-shop-page.png` - Страница магазина с фильтрами
6. `06-product-page-3d.png` - Страница товара с 3D viewer
7. `07-product-page-details.png` - Детали товара
8. `08-cart-page.png` - Корзина
9. `09-checkout-page.png` - Оформление заказа
10. `10-payment-page.png` - Страница оплаты

### Mobile скриншоты (`/screenshots/mobile/`)

**Требования:**
- ✅ Разрешение: **375x812px** (iPhone X/13/14) или **414x896px** (iPhone XR/11)
- ✅ Формат: **PNG**
- ✅ Можно использовать device frames (рамки телефонов)

**Файлы для создания:**

1. `mobile-01-homepage.png` - Главная (светлая тема)
2. `mobile-02-homepage-dark.png` - Главная (тёмная тема)
3. `mobile-03-shop.png` - Каталог
4. `mobile-04-product-3d.png` - Товар с 3D (главная фича!)
5. `mobile-05-cart.png` - Корзина

### Admin скриншоты (`/screenshots/admin/`)

**Требования:**
- ✅ Разрешение: **1920x1080px**
- ✅ Формат: **PNG**
- ✅ Показать реальные данные (не пустые таблицы)

**Файлы для создания:**

1. `admin-01-login.png` - Страница входа
2. `admin-02-dashboard.png` - Главная админки с аналитикой
3. `admin-03-products-list.png` - Список товаров
4. `admin-04-product-edit.png` - Редактирование товара
5. `admin-05-product-3d-upload.png` - Загрузка 3D модели (важно!)
6. `admin-06-orders-list.png` - Список заказов
7. `admin-07-order-details.png` - Детали заказа
8. `admin-08-users-list.png` - Управление пользователями
9. `admin-09-settings-theme.png` - Настройки тем
10. `admin-10-settings-payment.png` - Настройки оплаты

---

## 🖼️ Preview Images (для маркетплейсов)

### ThemeForest (`/preview-images/themeforest/`)

**Главный preview:**
- 📐 Размер: **590x300px**
- 📁 Имя: `preview-main.jpg`
- 🎨 Дизайн: Яркий, привлекательный, показать 3D фичу!
- 💡 Содержание:
  - Название проекта
  - Главный визуал (3D viewer)
  - Ключевые features (3-4 иконки)
  - "Angular 17 + NestJS + Three.js"

**Дополнительные previews для галереи:**
- 📐 Размер: **590x300px** каждый
- 📁 Файлы:
  - `preview-02-features.jpg` - Список фич
  - `preview-03-themes.jpg` - 4 темы рядом
  - `preview-04-admin.jpg` - Админ-панель
  - `preview-05-mobile.jpg` - Мобильная версия
  - `preview-06-3d-viewer.jpg` - 3D viewer крупно

### TemplateMonster (`/preview-images/templatemonster/`)

**Главный preview:**
- 📐 Размер: **800x600px**
- 📁 Имя: `preview-main.jpg`
- 🎨 Аналогичный дизайн, но другой размер

---

## 🎥 Demo Video

### Расположение: `/demo-video/`

### Структура:

```
demo-video/
├── raw/                    # Исходные файлы
│   ├── screen-recording.mp4
│   ├── voiceover.mp3
│   ├── music.mp3
│   └── project-file.prproj (Adobe Premiere)
└── final/                  # Финальное видео
    ├── demo-video-1080p.mp4
    ├── demo-video-720p.mp4
    └── thumbnail.jpg
```

### Требования к финальному видео:

**Технические:**
- ⏱️ Длительность: **2-3 минуты** (идеально 2:30)
- 📐 Разрешение: **1920x1080px** (1080p)
- 🎬 Формат: **MP4** (H.264 codec)
- 📊 Bitrate: **8-10 Mbps**
- 🔊 Аудио: **192 kbps AAC**
- 🎵 Музыка: **Royalty-free** (Epidemic Sound, Artlist)

**Содержание (сценарий):**

1. **Intro (0:00-0:15)**
   - Логотип + название проекта
   - Tagline: "Modern E-commerce with 3D Product Visualization"

2. **Homepage Tour (0:15-0:35)**
   - Показать все 4 темы (по 5 секунд каждая)
   - Smooth transitions

3. **3D Viewer Demo (0:35-0:55)**
   - Главная фича! Уделить больше времени
   - Показать взаимодействие (rotate, zoom)
   - На desktop и mobile

4. **Shop Features (0:55-1:15)**
   - Каталог товаров
   - Фильтры
   - Корзина
   - Checkout flow

5. **Admin Panel (1:15-1:45)**
   - Dashboard
   - Добавление товара
   - **Загрузка 3D модели** (важно!)
   - Управление заказами

6. **Technologies (1:45-2:00)**
   - Angular 17
   - NestJS
   - Three.js
   - PostgreSQL
   - Stripe/PayPal

7. **Outro (2:00-2:15)**
   - Call to action
   - "Buy Now" / Link
   - Contact info

### Thumbnail для видео:

- 📐 Размер: **1280x720px**
- 📁 Имя: `demo-video/final/thumbnail.jpg`
- 🎨 Яркий, с текстом "3D E-commerce Platform"

### Где разместить видео:

1. **YouTube** (рекомендуется):
   - Создать unlisted video
   - Добавить в описание ссылки
   - Использовать теги: angular, ecommerce, threejs, 3d

2. **Vimeo** (альтернатива):
   - Professional вид
   - Хорошее качество

3. **Маркетплейсы**:
   - Загрузить напрямую при submission
   - Также добавить YouTube ссылку

---

## 📝 Чек-лист создания визуальных материалов

### Подготовка:

- [ ] Заполнить базу демо-данными (30+ товаров)
- [ ] Добавить красивые изображения товаров
- [ ] Загрузить 3D модели для демонстрации
- [ ] Очистить browser cache
- [ ] Использовать Incognito mode для чистых скриншотов

### Desktop скриншоты:

- [ ] 10 основных скриншотов desktop версии
- [ ] Все 4 темы показаны
- [ ] 3D viewer в действии

### Mobile скриншоты:

- [ ] 5 скриншотов мобильной версии
- [ ] 3D viewer на мобильном

### Admin скриншоты:

- [ ] 10 скриншотов админ-панели
- [ ] Показана загрузка 3D модели
- [ ] Реальные данные (не пустые таблицы)

### Preview Images:

- [ ] ThemeForest: 1 главный + 5 дополнительных
- [ ] TemplateMonster: главный preview
- [ ] Все в правильном размере

### Demo Video:

- [ ] Записан screen recording
- [ ] Добавлен voiceover или титры
- [ ] Royalty-free музыка
- [ ] Финальное видео экспортировано
- [ ] Thumbnail создан
- [ ] Загружено на YouTube/Vimeo

### Оптимизация:

- [ ] Все PNG сжаты (TinyPNG, ImageOptim)
- [ ] Все изображения < 500KB каждое
- [ ] Видео < 50MB
- [ ] Проверено качество

---

## 🛠️ Инструменты для создания

### Скриншоты:

**macOS:**
- `Cmd + Shift + 3` - полный экран
- `Cmd + Shift + 4` - выделенная область
- `Cmd + Shift + 5` - запись экрана
- **CleanShot X** - профессиональный инструмент (платно)

**Windows:**
- `Win + Shift + S` - Snipping Tool
- **ShareX** - бесплатный, мощный

**Browser Extensions:**
- **Awesome Screenshot** - полные страницы
- **Full Page Screen Capture**

### Mobile скриншоты:

- **Chrome DevTools** - Device Mode (F12 → Toggle device toolbar)
- **Responsively** - приложение для тестирования

### Device Frames:

- **Screely** - онлайн, бесплатно
- **MediaModifier** - mockups

### Оптимизация изображений:

- **TinyPNG** - онлайн сжатие PNG/JPG
- **ImageOptim** - macOS приложение
- **Squoosh** - Google инструмент

### Видео:

**Запись экрана:**
- **OBS Studio** - бесплатно, мощно
- **ScreenFlow** - macOS (платно)
- **Camtasia** - Windows/Mac (платно)

**Редактирование:**
- **DaVinci Resolve** - бесплатно, профессионально
- **Adobe Premiere Pro** - индустриальный стандарт
- **Final Cut Pro** - macOS

**Voiceover:**
- **Audacity** - бесплатная запись голоса
- **Adobe Audition** - профессионально

### Музыка (Royalty-Free):

- **Epidemic Sound** - платная подписка, качество
- **Artlist** - платная подписка
- **YouTube Audio Library** - бесплатно
- **Free Music Archive** - бесплатно

### Preview Images / Graphics:

- **Canva** - простые preview
- **Figma** - профессиональный дизайн
- **Adobe Photoshop** - если умеете

---

## 💡 Советы по созданию материалов

### Для скриншотов:

1. **Используйте реальные данные** - не "Lorem ipsum"
2. **Покажите ценность** - заполненные корзины, заказы
3. **Чистый browser** - без расширений, закладок
4. **Правильный размер окна** - ровно 1920x1080
5. **Убрать отвлекающее** - курсор мыши, уведомления

### Для demo видео:

1. **Плавные переходы** - не резкие прыжки
2. **Highlight главное** - 3D viewer, админка
3. **Текст читаемый** - крупные надписи
4. **Темп умеренный** - не слишком быстро
5. **Quality > Quantity** - лучше 2 мин качества, чем 5 мин скуки

### Для preview images:

1. **Яркие цвета** - привлекают внимание
2. **Показать 3D фичу** - это ваше УТП
3. **Технологии видны** - Angular, NestJS, Three.js
4. **Читаемый текст** - даже в маленьком размере

---

## 📊 Примерный размер файлов

| Тип файла | Количество | Размер каждого | Общий размер |
|-----------|------------|----------------|--------------|
| Desktop PNG | 10 | ~300-500 KB | ~3-5 MB |
| Mobile PNG | 5 | ~200-300 KB | ~1-1.5 MB |
| Admin PNG | 10 | ~300-500 KB | ~3-5 MB |
| Preview JPG | 7 | ~100-200 KB | ~700 KB - 1.4 MB |
| Demo Video | 1 | ~30-50 MB | ~30-50 MB |
| **ИТОГО** | **33 файла** | - | **~40-65 MB** |

---

## 📤 Где использовать материалы

### Скриншоты используются в:

1. **Документации** (`/docs/`) - вставить в `.md` файлы
2. **README.md** - главная страница проекта
3. **Маркетплейс галерея** - при submission
4. **Landing page** (если создадите)

### Как вставить в документацию:

```markdown
![Admin Dashboard](../screenshots/admin/admin-02-dashboard.png)
```

### Demo video используется в:

1. **Маркетплейс** - главное видео
2. **README.md** - ссылка на YouTube
3. **Социальные сети** - маркетинг
4. **Landing page**

### Preview images используются в:

1. **ThemeForest submission** - обязательно
2. **TemplateMonster submission** - обязательно
3. **Социальные сети OG images**

---

## ✅ Следующие шаги

1. **Создать папки** (уже сделано)
2. **Заполнить демо-данными** базу
3. **Сделать 25 скриншотов** (~2-3 часа)
4. **Создать preview images** (~2-3 часа)
5. **Записать и смонтировать видео** (~8-12 часов)
6. **Оптимизировать все** (~1 час)

**Общее время**: ~13-20 часов работы

---

**Удачи с созданием визуальных материалов!** 📸🎥

Если нужна помощь - пишите!

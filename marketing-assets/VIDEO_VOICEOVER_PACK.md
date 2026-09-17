# Marketplace video — voiceover pack

**Audience:** CodeCanyon / Gumroad buyers (agencies, freelancers).  
**Language for recording:** Russian below (your delivery). For Envato reach, also cut an **English** take using the same shot list (or burn English subtitles).

**Recording:** 1920×1080 · hide extensions · seeded demo · Stripe **test** · no real cards · soft music −20 dB under voice.

---

## How many videos?

| # | Role | Length | Where it lives |
|---|------|--------|----------------|
| **V0** | **Main trailer** (required) | **4:30–5:30** | CodeCanyon item video + YouTube unlisted |
| **V1** | Feature: themes & i18n | 45–60 s | YouTube playlist / Gumroad / Shorts |
| **V2** | Feature: 3D & Product Stage | 60–75 s | Same |
| **V3** | Feature: admin media (remove.bg + GLB + AI) | 75–90 s | Same |
| **V4** | Feature: CMS, payments, deploy | 60–75 s | Same |

**Minimum to publish:** only **V0**.  
**Optimal:** V0 + V2 + V3 (3D and media sell the SKU).  
**Full pack:** all five.

Do **not** claim live PayPal API, PCI/GDPR certificates, or hosted production DB.

---

# V0 — Main trailer (CodeCanyon)

**Total ~5:00** · One continuous edit · Chapters in YouTube description.

### Shot prep
- Home with **Product Stage** on, catalog seeded (bags / clothing / shoes + GLB).
- Themes: Light → Dark → Aurora ready in header.
- Admin: Ice or Ember; product with photo + GLB; Remove.bg key configured if you demo BG removal (or show toggle + “API key in Integrations”).
- Stripe test keys in Admin → Settings.

---

### Block A — Intro (0:00–0:35)

**On screen**
1. Title card 3 s: *Angular 3D Ecommerce* · *Angular 17 + NestJS + Three.js*.
2. Cut to homepage (Light), slow pan over Product Stage; orbit one model once.

**Voiceover**
> Это Angular 3D Ecommerce — полноценный full-stack шаблон интернет-магазина: витрина на Angular 17, API на NestJS, PostgreSQL, админка и интерактивный 3D-просмотр товаров на Three.js. Не лендинг-заглушка, а рабочий стартер под кастом и деплой — для агентств и команд, которым нужна 3D-примерка обуви, сумок, мебели или коллекционных товаров.

---

### Block B — Themes & language (0:35–1:05)

**On screen**
1. Theme switch: Light → Dark → Aurora (pause ~1 s each on home).
2. Language switch: UA → EN → RU on header; show translated nav/category labels.

**Voiceover**
> Дизайн построен на токенах: четыре визуальных режима. На витрине — Light, Dark и Aurora; в админке — Ice и Ember. Переключение мгновенное, без хардкода цветов в компонентах. Из коробки три языка: английский, украинский и русский — через ngx-translate.

---

### Block C — Catalog & PDP / 3D (1:05–1:55)

**On screen**
1. Open Shop — scroll grid (shoes/bags).
2. Open PDP with GLB — switch image ↔ 3D, drag orbit, zoom.
3. Scroll to tabs / similar products briefly.
4. Optional 8 s: DevTools mobile width 390px on PDP 3D.

**Voiceover**
> Каталог, фильтры, карточки и карточка товара в духе современных маркетплейсов. Главная фишка — Three.js: покупатель крутит GLB-модель прямо на странице. Есть бандл демо-моделей, чтобы шаблон работал сразу после установки. Похожие товары и избранное уже вшиты в сценарий витрины.

---

### Block D — Cart & checkout (1:55–2:25)

**On screen**
1. Add to cart from PDP or Product Stage → cart modal with line item.
2. Checkout page — highlight Stripe; briefly show payment method list.
3. Do **not** complete a live charge; stop on form / test banner.

**Voiceover**
> Корзина, избранное, оформление заказа. Stripe подключён по-настоящему — ключи задаются в админке. LiqPay готов для региональных платежей. PayPal в интерфейсе есть, но в режиме mock — это честно подписано, без ложных обещаний live API.

---

### Block E — Admin: dashboard & catalog (2:25–3:10)

**On screen**
1. `/admin/login` → dashboard (KPIs / wow band if present).
2. Products list → open edit form.
3. Show fields: name locales, price, stock, category.

**Voiceover**
> Админка на JWT: дашборд, товары, заказы, пользователи. Создаёте и редактируете каталог, статусы заказов и доступы. Это не «статичный HTML-тема», а связка витрины с NestJS API — со Swagger-документацией по адресу api slash docs.

---

### Block F — Media: photos, remove.bg, 3D upload (3:10–4:00)

**On screen**
1. In product form: upload product image.
2. Toggle **Remove background** (and optimize if visible) → process → show result (transparent/clean cutout).
3. Upload / attach **GLB** zone; save; jump to storefront PDP and spin the new model (or existing seeded GLB if upload is slow).

**Voiceover**
> Загрузка медиа прямо из админки. Для фото можно включить удаление фона через Remove.bg и оптимизацию — удобно для витрины fashion и аксессуаров. Отдельно — загрузка 3D-моделей GLB: модель сразу появляется у товара на витрине. Есть опциональный Cloudinary и экспериментальная AI-генерация 3D по ключам провайдера — Tripo и другие; без ваших ключей это не «магия из коробки», а готовый каркас интеграций.

---

### Block G — CMS sections, SEO, settings (4:00–4:35)

**On screen**
1. Admin → Sections: disable/enable Product Stage (or reorder a section); refresh home.
2. SEO or Settings briefly (Stripe/LiqPay fields masked).
3. Optional: one extra section type (FAQ / features) if quick.

**Voiceover**
> Секции и страницы управляются из CMS: герои, Product Stage, сетки, FAQ и другие блоки. Можно собрать витрину под бренд без правки ядра. Плюс SEO-настройки и централизованные интеграции — платежи, почта, ключи AI — в одном месте.

---

### Block H — Stack, Docker, docs, CTA (4:35–5:10)

**On screen**
1. 5 s terminal montage: `npm start` + `backend:start:dev` or `docker compose up`.
2. Open `docs/client/index.html` hub.
3. End card: Regular / Extended · support email · feature bullets.

**Voiceover**
> Стек: Angular 17, NestJS 10, PostgreSQL, TypeORM, Docker Compose, путь SSR. В комплекте документация для покупателя, демо-ассеты и честный список возможностей. Angular 3D Ecommerce — берите, кастомизируйте, деплойте. Ссылки на демо и документацию — в описании товара.

**End card text (on screen, no need to read all):**
`Angular 17 · NestJS · Three.js · Stripe · Multi-theme · i18n · Docker`  
`Docs included · support@maestrotype.com`

---

# V1 — Short: Themes & i18n (45–60 s)

**On screen:** Home only. Light → Dark → Aurora. Then UA → EN → RU.

**Voiceover**
> Один шаблон — несколько лиц. Light, Dark и Aurora на витрине, отдельные темы админки Ice и Ember. Дизайн на CSS-токенах: меняете тему — меняется весь магазин. Три языка из коробки: английский, украинский, русский. Идеально для мультирегиональных магазинов и агентских проектов.

---

# V2 — Short: 3D & Product Stage (60–75 s)

**On screen:** Home Product Stage orbit → click into PDP → image/3D tabs → similar products strip.

**Voiceover**
> Это не статичные фото. Product Stage на главной и полноценный Three.js viewer на карточке товара: вращение, зум, GLB из коробки. Покупатель «держит» кроссовок или сумку до покупки. Плюс похожие товары и привычный e-commerce flow — каталог, корзина, избранное.

---

# V3 — Short: Admin media power (75–90 s)

**On screen:** Admin product form → upload image → Remove background ON → result → GLB upload hint → Integrations keys (blur secrets).

**Voiceover**
> В админке — полный контроль медиа. Загрузили фото, включили удаление фона Remove.bg, оптимизировали картинку. Загрузили GLB — и 3D уже на витрине. Нужен Cloudinary или AI-генерация моделей — подключаете ключи в Integrations. Шаблон готов к продакшен-медиапайплайну, а не только к демо-картинкам.

---

# V4 — Short: CMS, payments, ship it (60–75 s)

**On screen:** Sections toggle → Checkout Stripe fields → Docker/`docs` flash → end card.

**Voiceover**
> Собирайте страницы секциями, настраивайте SEO, принимайте оплату через Stripe и LiqPay. PayPal в UI — mock, без обмана. Деплой: Docker Compose или свой Node-хостинг, SSR-путь есть. Документация в zip. Angular 3D Ecommerce — от идеи магазина до запуска быстрее.

---

## Practical tips for you (director)

| Moment | Do this |
|--------|---------|
| Themes | Don’t rush; 1 full home paint per theme |
| 3D | Slow orbit; cursor visible; avoid empty canvas |
| Remove.bg | Use a photo **with** background so before/after is obvious |
| Secrets | Blur API keys; never show live Stripe secret |
| Admin password | Demo login only if rotated; prefer cut before password field |
| Audio | One voice, room quiet; music bed optional under −18 dB |
| Export | H.264 1080p; main trailer under ~50–80 MB for Envato |

## YouTube description skeleton (V0)

```
Angular 3D Ecommerce — full-stack Angular 17 + NestJS + Three.js

0:00 Intro
0:35 Themes & i18n
1:05 Catalog & 3D PDP
1:55 Cart & checkout
2:25 Admin
3:10 Media: remove.bg + GLB
4:00 CMS & settings
4:35 Stack & CTA

Demo: YOUR_LIVE_DEMO_URL
Docs in the purchase zip
```

---

*Seller-only companion to `VIDEO_SCRIPT.md` and `docs/seller/LAUNCH_PLAYBOOK.md`.*

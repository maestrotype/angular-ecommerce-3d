# UI Polish Plan — liquid glass quality pass

> **Контекст:** рефакторинг A–G закрыт. Цель — **реальное жидкое стекло**, не тёмный HUD.  
> Эталон рецепта: admin `_admin-glass.scss` (prod-aligned liquid glass).  
> Прогресс — здесь. Метрики рефакторинга — [REFACTORING_BOARD.md](REFACTORING_BOARD.md).

**Last updated:** 2026-08-05

---

## North star: liquid glass

Эталон атмосферы/chrome: **ice / water** (светло-серый). Дальше — секции и карточки в том же языке.

| Свойство | Не то (было) | Цель |
|----------|--------------|------|
| Fill | opaque black / saturated navy | frosted ice `rgba(255,255,255,0.38–0.55)` |
| Blur | слабый / невидимый | `blur(32px) saturate(135%)` + ice atmosphere |
| Edge | нет | white frost border + inset highlight |
| Text | white on dark / unreadable | dark slate ink on ice (`#1e293b`) |
| Atmosphere | navy / flat black | light gray–water ice (`#f4f7f9` → `#c8d5e0`) |

**Правило:** правим theme layer (`_glass.scss`), компоненты только читают `--header-*` / `--footer-*` / `--chrome-*`.

---

## Задачи

| ID | Задача | Статус |
|----|--------|--------|
| **U0** | Ice / water liquid-glass recipe (tokens + atmosphere) | ✅ эталон цвета OK |
| **U1** | Footer → liquid chrome | ✅ |
| **U2** | Header → liquid chrome | ✅ |
| **U3** | Product cards all themes (light/dark/glass `--card-*`) | ✅ |
| **U10** | Best sellers — shared cards + theme grid | ✅ |
| **U4** | `color-scheme` for glass | ✅ light (ice) |
| **U5** | Убрать legacy `.glass-theme` | 📋 |
| **U6** | Home visual pass по эталону | 📋 |
| **U7** | Cross-theme parity (light/dark не ломать) | 📋 |
| **U8** | Footer code hygiene | 📋 |
| **U9** | Theme-based shop grid columns (light 2 / dark 4 / glass 3) | ✅ |

---

## Что смотреть сейчас (hard refresh)

1. Glass theme → `/home`
2. **Header** — полупрозрачный стальной tint, сквозь него виден hero/атмосфера, светлая кромка сверху
3. **Footer** — тот же язык стекла, не чёрная плита
4. Theme switcher popover — frosted, не flat dark

Если «ещё слишком тёмно / мало blur / мало блика» — напиши что именно; подкрутим alpha / blur / saturate / atmosphere.

---

## Связанные файлы

- `src/styles/themes/_glass.scss` — storefront liquid recipe + atmosphere
- `src/admin/styles/_admin-glass.scss` — эталон admin
- `src/app/layout/header/header.component.scss`
- `src/app/layout/footer/footer.component.scss`

# Cross-Theme Visual Review (G16)

**Epic G16** — REDESIGN 7.12, 9.1  
**Date**: 2026-08-05  
**Branch**: `feature/redesign`

Storefront themes under test: **light** (default), **dark**, **glass**.  
Admin themes (separate area): **light**, **dark**, **glass**, **dark-glass**.

---

## 1. Review matrix

Mark each cell after manual pass in browser (`ng serve`, 1920×1080 + 375×812).

### Storefront

| Page / surface | Route | light | dark | glass | Notes |
|----------------|-------|:-----:|:----:|:-----:|-------|
| Home | `/` | ☐ | ☐ | ☐ | Hero, best sellers, footer |
| Shop | `/shop` | ☐ | ☐ | ☐ | Grid, filters, product cards hover |
| Product detail | `/product/:id` | ☐ | ☐ | ☐ | Gallery, info panel, CTA, tabs |
| Favorites | `/favorites` | ☐ | ☐ | ☐ | Empty + populated states |
| Checkout | `/checkout` | ☐ | ☐ | ☐ | Stepper, summary, form validation |
| Payment | `/payment/:id` | ☐ | ☐ | ☐ | Loading, method, status states |
| Payment success | `/payment/success` | ☐ | ☐ | ☐ | Panel, actions |
| Payment error | `/payment/error` | ☐ | ☐ | ☐ | Panel, actions |
| Cart modal | header cart icon | ☐ | ☐ | ☐ | Qty controls, checkout CTA |
| Auth modal | header profile | ☐ | ☐ | ☐ | Form fields, focus rings |
| Page transition | any navigation | ☐ | ☐ | ☐ | Enter animation; reduced-motion off |
| Header / footer | global | ☐ | ☐ | ☐ | Nav active, theme switcher |

### Admin (smoke)

| Page | Route | light | dark | glass | dark-glass |
|------|-------|:-----:|:----:|:-----:|:----------:|
| Dashboard | `/admin/dashboard` | ☐ | ☐ | ☐ | ☐ |
| Products list | `/admin/products` | ☐ | ☐ | ☐ | ☐ |
| Orders | `/admin/orders` | ☐ | ☐ | ☐ | ☐ |

---

## 2. Automated audit (2026-08-05)

| Check | Result |
|-------|--------|
| Hex colors in `src/app/**/*.scss` | **0** files with hex |
| `getThemeClass()` in storefront | **0** (removed from payment success/error) |
| `glass-theme` on storefront HTML | **0** (cart modal migrated) |
| `!important` in `src/styles/` | **3** (scrollbars + 2 Material overrides — pre-existing, tracked M3) |
| `npm run build` | **Pass** |

---

## 3. Fixes applied in G16

| Issue | Fix |
|-------|-----|
| Payment success/error used `getThemeClass()` anti-pattern | Global `components/_payment-result.scss`; components slimmed to `:host` |
| Cart modal buttons hardcoded `glass-theme` (glass look in all themes) | `components/_cart-modal.scss` — token + micro-interaction controls per theme |
| Legacy `_glass-helpers.scss` cart rules | Removed; `.theme-price` retained; `.glass-theme` deprecated shell |
| Payment error "Go to cart" → `/cart` (non-existent route) | Navigate to `/shop` |

---

## 4. Manual verification steps

1. Start app: `npm start` (or `ng serve`).
2. For each storefront theme (theme switcher in header):
   - Walk matrix rows top to bottom.
   - Toggle **Reduce motion** once — confirm page enter + hovers degrade gracefully.
3. Admin: switch admin theme in settings; spot-check dashboard stat cards (glass/dark-glass).
4. Capture screenshots per `docs/VISUAL_ASSETS_GUIDE.md` when marketing assets needed.

---

## 5. Known acceptable deltas (by design)

| Delta | Reason |
|-------|--------|
| Glass uses longer motion + larger hover lift | Theme personality (see `STYLE_ARCHITECTURE.md` §14.5) |
| Dark uses faster transitions, blue focus ring | Theme personality |
| Admin dark-glass not on storefront | `ThemeService` rejects dark-glass for frontend |
| PDP glass has no accent bar | Hotfix — glass artifact removed (G11) |

---

## 6. Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Dev audit + code fixes | AI agent | 2026-08-05 | Automated checks pass |
| Visual QA (human) | — | — | Pending matrix ☐ |

---

*Related: `docs/STYLE_ARCHITECTURE.md` §14, `docs/THEME_ENGINE.md` §7.1, `docs/VISUAL_ASSETS_GUIDE.md`*

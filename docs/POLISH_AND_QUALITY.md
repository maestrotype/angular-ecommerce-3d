# Polish & Quality Checklist (G17)

**Epic G17** — REDESIGN 9.2–9.8  
**Date**: 2026-08-05  
**Branch**: `feature/redesign`

Final quality pass for Epic G (Premium UI). Complements `docs/CROSS_THEME_VISUAL_REVIEW.md` (G16).

---

## 1. Responsive (9.2)

| Check | Status | Notes |
|-------|--------|-------|
| Breakpoints: 375, 768, 1024, 1920 | ☐ Manual | Shop grid, PDP, checkout stepper |
| Mobile bottom nav clears content | ✅ Code | `main` `padding-bottom` + safe-area (G17) |
| Checkout/payment forms single-column ≤768px | ✅ Code | `form-grid` + checkout partial |
| PDP gallery stacks ≤1024px | ✅ Code | `_product-detail.scss` |
| Admin tables horizontal scroll | ☐ Manual | list-container |

---

## 2. Accessibility (9.3)

| Check | Status | Notes |
|-------|--------|-------|
| Skip link → `#main-content` | ✅ Code | `core/_a11y.scss` + `app.component.html` |
| Mobile nav uses `<button>` not `<div click>` | ✅ Code | G17 |
| Focus rings via `--micro-focus-ring` | ✅ Code | G14 — forms, buttons, nav, cart |
| `prefers-reduced-motion` global + feature | ✅ Code | `_base.scss`, motion partials |
| Viewport allows pinch zoom | ✅ Code | Removed `user-scalable=no` (G17) |
| Loading spinner `role="status"` | ✅ Code | G3 |
| Checkout stepper `aria-current` / labels | ✅ Code | G12 |
| WCAG contrast all themes | ☐ Manual | Use browser axe / Lighthouse |

---

## 3. Dark mode edge cases (9.4)

| Check | Status | Notes |
|-------|--------|-------|
| `color-scheme: dark` on `[data-theme="dark"]` | ✅ Code | Native controls, scrollbars |
| `color-scheme: light` on light/glass | ✅ Code | G17 |
| No rogue `:root` resetting theme tokens | ✅ Code | Fixed G11 hotfix |
| Text on surfaces uses `--text-*` | ✅ Audit | 0 hex in `src/app/**/*.scss` |
| Glass PDP transparent page bg | ✅ Code | `--pdp-page-bg: transparent` |

---

## 4. Print (9.5)

| Check | Status | Notes |
|-------|--------|-------|
| Hide chrome (header, footer, mobile nav, modals) | ✅ Code | `_base.scss` `@media print` |
| Main content prints without extra padding | ✅ Code | G17 |
| Page transitions disabled in print | ✅ Code | G17 |

---

## 5. Browser compatibility (9.6)

| Browser | Version | Smoke test |
|---------|---------|------------|
| Chrome | latest | ☐ |
| Firefox | latest | ☐ |
| Safari | latest | ☐ |
| Edge | latest | ☐ |

**CSS features used**: `backdrop-filter`, `color-scheme`, `env(safe-area-inset-*)`, `@media (prefers-reduced-motion)` — all supported in evergreen browsers; Safari requires `-webkit-backdrop-filter` (present).

---

## 6. Performance (9.7)

| Metric | Value (2026-08-05 build) | Target |
|--------|--------------------------|--------|
| `styles.css` (raw) | ~549 KB | Monitor; token layer acceptable for multi-theme |
| `styles.css` (gzip est.) | ~48 KB | — |
| `main.js` (raw) | ~999 KB | Separate from G17 scope |
| FOUC / theme flash | Mitigated | Inline script in `index.html` sets `data-theme` before paint |
| Animations GPU-safe | ✅ | opacity + transform only (`STYLE_ARCHITECTURE.md` §14.6) |

---

## 7. Documentation sync (9.8)

| Doc | Updated |
|-----|---------|
| `STYLE_ARCHITECTURE.md` §14 Animation | G15 |
| `THEME_ENGINE.md` §7.1 Motion presets | G15 |
| `CROSS_THEME_VISUAL_REVIEW.md` | G16 |
| `POLISH_AND_QUALITY.md` | G17 (this file) |
| `REFACTORING_BOARD.md` G17 | G17 |

---

## 8. G17 code changes summary

- `core/_a11y.scss` — skip link, `.sr-only`
- `app.component` — skip link, `main#main-content`, mobile nav `<button>` + focus
- Mobile main bottom padding for fixed footer
- `index.html` — accessible viewport meta
- Print rules — hide non-content chrome
- `color-scheme` on light/dark/glass themes
- i18n `A11Y.*` keys (en/ru/ua)

---

## 9. Epic G sign-off

| Task | Status |
|------|--------|
| G1–G17 | ✅ Board |
| Human visual matrix (G16 §6) | ☐ Pending |
| Human responsive/a11y audit (this doc §1–3) | ☐ Pending |

---

*Related: `docs/STYLE_ARCHITECTURE.md`, `docs/CROSS_THEME_VISUAL_REVIEW.md`*

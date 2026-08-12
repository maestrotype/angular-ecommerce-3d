# Admin Mobile UX — Phased Rollout (M1–M6)

Mobile admin fixes follow a shared layout system (tokens + global patterns), not page-by-page `@media` hacks.

**Breakpoint:** `768px` (matches `HeaderComponent.checkScreenSize`).

**Style rules:** token-based CSS only, no `!important`, no hardcoded colors. See `docs/AI_CONSTITUTION.md`.

---

## Agent handoff rule (required)

After completing **each phase** (M1, M2, …), the agent MUST:

1. Mark the phase status in the table below.
2. Append an **English commit message** under **Suggested commits** (Conventional Commits format).
3. Include that same English text in the chat response when handing off to the user.

Do **not** run `git commit` unless the user explicitly asks. The English message is for the user to copy or for the next agent to reuse.

**Commit message format:**

```
<type>(<scope>): <short summary> (Phase MX)

Optional one-line body explaining why, not what.
```

Example:

```
fix(admin-mobile): stack page chrome and filters on small screens (Phase M2)

Unify list-container and dashboard padding so content uses full viewport width at 768px.
```

---

## Phase status

| Phase | Scope | Status | Notes |
|-------|--------|--------|-------|
| **M1** | Shell — header, sidenav, touch targets | ✅ Done | Storefront on mobile toolbar + sidenav |
| **M2** | Page chrome — list-container, dashboard, filters/CTA stack | ✅ Done | Full-width content, shared `_responsive.scss` contract |
| **M3** | Forms / search — no label+placeholder overlap | ✅ Done | `app-search-bar` mobile placeholder-only; list search fields cleaned |
| **M4** | Status banners & card grids (Integrations) | ✅ Done | `admin-status-banner`, `admin-card-grid`, Integrations migrated |
| **M5** | Tables → mobile cards (Sections, Orders, Users, Payments) | ✅ Done | Shared `admin-mobile-card`, global desktop/mobile toggle |
| **M6** | Page leftovers (section architect, touch targets) | ☐ Pending | |

---

## Suggested commits

### M1 — Shell

```
fix(admin-mobile): add mobile shell contract for header and sidenav (Phase M1)

Hide toolbar title on small screens, keep storefront visible with 44px touch targets, and dedupe navigation in mobile sidenav.
```

### M2 — Page chrome

```
fix(admin-mobile): unify page chrome and full-width content layout (Phase M2)

Add shared mobile contract for list pages and dashboard; stack headers, filters, and CTAs in a single column at 768px.
```

### M3 — Forms / search

```
fix(admin-mobile): prevent search label and placeholder overlap (Phase M3)

Use placeholder-only search on mobile in app-search-bar; remove redundant placeholders on labeled list filters and drop floatLabel=always on product category select.
```

### M4 — Banners & cards

```
fix(admin-mobile): stack status banners and fix integration card grids (Phase M4)
```

### M5 — Tables

```
fix(admin-mobile): add shared mobile card layout for admin tables (Phase M5)
```

### M6 — Leftovers

```
fix(admin-mobile): polish remaining admin mobile edge cases (Phase M6)
```

---

## Key files

| Layer | Files |
|-------|--------|
| Tokens | `src/admin/styles/_admin-layout-tokens.scss` |
| Patterns | `src/admin/styles/global/_patterns.scss` |
| Responsive contract | `src/admin/styles/global/_responsive.scss` |
| Forms | `src/admin/styles/global/_forms-controls.scss` |
| Shell | `src/admin/components/layout/header/`, `sidenav/` |
| List chrome | `src/admin/components/blocks/list-container/` |
| Search | `src/admin/components/ui/search-bar/` |

---

## QA checklist (after each phase)

- Viewports: **375**, **414**, **768**
- Themes: light, dark (+ glass if time)
- Pages: Dashboard, Products, Integrations, Sections, Orders

---

*Last updated: 2026-08-12*

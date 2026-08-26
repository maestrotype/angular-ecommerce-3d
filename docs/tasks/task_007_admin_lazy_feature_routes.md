# Task 007: Admin lazy feature routes

## Status: ⏳ PENDING

## Goal
Split the monolithic `AdminModule` (~1.6 MB lazy chunk) into feature modules with `loadChildren`, so editing one admin area does not rebuild the entire admin bundle.

## Epic
**Epic J — Build, DX & Architecture** (J4)

## Files to Edit
- `src/admin/admin-routing.module.ts`
- `src/admin/admin.module.ts` (shrink declarations/imports)
- **New modules** (suggested):
  - `src/admin/pages/products/products.module.ts`
  - `src/admin/pages/sections/sections.module.ts`
  - `src/admin/pages/orders/orders.module.ts`
  - `src/admin/pages/categories/categories.module.ts`
  - `src/admin/pages/pages/pages.module.ts` (custom pages)
  - `src/admin/pages/dashboard/dashboard.module.ts`
- `docs/BUILD_AND_DEV_PERFORMANCE.md`

## Files Forbidden to Edit
- Storefront routes
- Section-map / section-renderer

## Context Specs
- Today only `seo`, `profile`, `settings` use `loadChildren`; all other admin routes declare components directly in `AdminRoutingModule`.
- `AdminModule` declares 30+ components including `SectionFormComponent` (~1940 lines).
- Follow existing pattern from `settings.module.ts` / `seo.module.ts`.
- Keep `AdminLayoutComponent`, `SidenavComponent`, `HeaderComponent` in shell module.

## Definition of Done
1. At least **sections**, **products**, and **orders** are lazy-loaded feature modules
2. Admin navigation still works (all sidenav links resolve)
3. `ng build` produces separate lazy chunks for migrated features (verify in `dist/`)
4. `npm run build` passes
5. Document new module structure in ARCHITECTURE.md

## Build Command
```bash
npm run build
```

## Commit Message
```
perf(admin): lazy-load feature modules to reduce dev rebuild scope
```

## Notes
- Do not lazy-load shared admin dialogs globally — use `AdminSharedModule` imported by feature modules.
- Priority for marketplace: **sections** module first (heaviest form).

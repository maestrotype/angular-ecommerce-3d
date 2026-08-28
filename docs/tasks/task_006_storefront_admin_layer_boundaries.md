# Task 006: Storefront/admin layer boundaries

## Status: ✅ DONE (2026-08-26)

## Implementation
- `SectionService` moved to `src/app/core/services/section.service.ts`
- `rg "from 'src/admin" src/app` → 0 matches
- Admin section CRUD unchanged via admin re-exports

## Goal
Remove all direct imports from `src/app/` into `src/admin/`. Public API services used by the storefront must live in `src/app/core/services/` or `src/shared/`.

## Epic
**Epic J — Build, DX & Architecture** (J3)

## Files to Edit
- `src/app/pages/home/home.component.ts`
- `src/app/pages/shop/shop.component.ts`
- `src/app/pages/about/about.component.ts`
- `src/app/components/product-detail/product-detail.component.ts`
- **New or moved**: `src/app/core/services/section.service.ts` (storefront-facing API)
- `src/admin/services/section.service.ts` (extend or delegate to shared implementation)
- `docs/ARCHITECTURE.md` § Layer boundaries

## Files Forbidden to Edit
- Unrelated admin pages
- Backend API

## Context Specs
- Current violation: `SectionService` from `src/admin/services/section.service.ts` used on storefront.
- Admin `SectionService` includes admin-only methods (`getSections`, `upload3dModel`, etc.) — split into:
  - **Public**: `getActiveSections`, `getSection` (read-only storefront needs)
  - **Admin**: CRUD, upload, reorder — stays in admin or `AdminSectionService`
- Prefer single implementation class in `core/` with admin extending/wrapping if needed.

## Definition of Done
1. `rg "from 'src/admin|from \"src/admin" src/app` returns **zero** matches (except comments)
2. Home, shop, product-detail, about still load sections correctly
3. Admin section CRUD unchanged
4. `npm run build` passes
5. Update ARCHITECTURE.md layer diagram

## Build Command
```bash
npm run build
```

## Commit Message
```
refactor(architecture): move SectionService out of admin layer for storefront use
```

## Notes
- Marketplace buyers copying patterns from `home.component.ts` should see `core/services`, not `admin/services`.

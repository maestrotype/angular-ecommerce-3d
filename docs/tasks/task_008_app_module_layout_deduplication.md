# Task 008: AppModule layout deduplication

## Status: ⏳ PENDING

## Goal
Remove duplicate eager imports of layout section components from `AppModule` that are already lazy-loaded via `section-map.ts` and `SectionRendererComponent`.

## Epic
**Epic J — Build, DX & Architecture** (J5)

## Files to Edit
- `src/app/app.module.ts`
- Verify: `src/app/components/section-renderer/section-map.ts`
- Verify: `src/app/shared/shared.module.ts` (SectionRenderer export)
- `docs/BUILD_AND_DEV_PERFORMANCE.md`

## Files Forbidden to Edit
- Section component implementations (unless import path fix required)
- Admin module

## Context Specs
- **Duplicate imports in AppModule** (also in section-map):
  - `HeroComponent`, `HeroGlassComponent`
  - `CategoriesComponent`, `SpecialOfferComponent`, `BestSellersComponent`, `BrandsComponent`
- Home page uses `SectionRenderer` — does not need these in root module.
- `HeaderComponent` / `FooterComponent` may still be needed in app chrome — **keep** if used in `AppComponent` template directly.
- `ThreeDViewerComponent` — evaluate: keep if used outside section renderer (PDP modal, app-level).

## Definition of Done
1. Removed layout components from `AppModule.imports` that are only used via section renderer
2. Home, dynamic pages, shop still render all section types
3. `main.js` bundle size reduced (record in Implementation Log)
4. `npm run build` passes
5. No runtime errors for missing component imports

## Build Command
```bash
npm run build
```

## Commit Message
```
perf(storefront): remove duplicate layout imports from AppModule
```

## Notes
- Test all section types on home after change — especially hero, best-sellers, product-carousel.
- If a component is used in both app shell and sections, keep one eager import path only.

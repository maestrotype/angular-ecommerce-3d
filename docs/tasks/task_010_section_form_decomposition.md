# Task 010: Section form decomposition

## Status: ✅ DONE

## Goal
Split `section-form.component.ts` (~1940 lines) into type-specific sub-forms or a registry pattern, reducing compile scope and improving maintainability for marketplace customization.

## Epic
**Epic J — Build, DX & Architecture** (J7)

## Files to Edit
- `src/admin/pages/sections/section-form/section-form.component.ts` (shrink)
- `src/admin/pages/sections/section-form/section-form.component.html`
- **New** (suggested):
  - `section-form/shared/section-form-base.component.ts`
  - `section-form/types/product-carousel-form.component.ts`
  - `section-form/types/hero-form.component.ts`
  - `section-form/types/header-footer-form.component.ts`
  - `section-form/section-form-factory.ts` or switch registry
- `docs/BUILD_AND_DEV_PERFORMANCE.md`

## Files Forbidden to Edit
- Storefront section components (unless shared types extracted to `shared/`)
- Backend sections API

## Context Specs
- Single form handles 19+ section types via `*ngSwitchCase` in template.
- Heavy logic: i18n fields, carousel settings, presets, page templates, visual overrides.
- Depends on Task 007 (sections feature module) for best results — can start before J4 if scoped to file split only.
- Extract typed `SectionSettings` interfaces per section type (replace `settings?: any` gradually).

## Definition of Done
1. `section-form.component.ts` reduced to **< 400 lines** (orchestration shell)
2. At least **product-carousel**, **hero**, **header/footer** extracted to dedicated form components
3. Save/load/preview behavior unchanged for extracted types
4. `npm run build` passes
5. No new `!important` in styles

## Build Command
```bash
npm run build
```

## Commit Message
```
refactor(admin): decompose section-form into type-specific sub-forms
```

## Notes
- Marketplace buyers often customize section types — small focused files are a selling point.
- Coordinate with `section-presets.ts` and `page-template-presets.ts` when splitting.

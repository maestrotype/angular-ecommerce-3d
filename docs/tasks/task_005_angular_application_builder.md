# Task 005: Migrate to Angular application builder

## Status: ⏳ PENDING

## Goal
Migrate `angular.json` from the legacy webpack `browser` builder to `@angular-devkit/build-angular:application` (esbuild-based) for faster dev server and production builds.

## Epic
**Epic J — Build, DX & Architecture** (J2)

## Files to Edit
- `angular.json`
- `tsconfig.app.json` (if builder requires `application` tsconfig adjustments)
- `package.json` scripts (if SSR/serve targets change)
- `docs/BUILD_AND_DEV_PERFORMANCE.md`
- `docs/GETTING_STARTED.md` (if serve command changes)

## Files Forbidden to Edit
- Component business logic (unless required for standalone bootstrap migration)
- Style/token files

## Context Specs
- Angular version: **17.3.x** — application builder is stable in this range.
- Current builder: `@angular-devkit/build-angular:browser` with output `dist/angular-ecommerce-3d/browser`.
- SSR target exists: `angular-ecommerce-3d:server` — verify compatibility after migration.
- Service worker enabled in build options — preserve PWA config.
- Global styles array must remain: `material-theme.scss`, `admin.scss`, `main.scss`.

## Definition of Done
1. `ng build` succeeds with `application` builder
2. `ng serve` starts and storefront + admin load correctly
3. SSR path still works: `npm run build:prod` (or updated equivalent)
4. Output paths documented if they change (`browser` subfolder vs flat)
5. Record before/after build times in task Implementation Log
6. No new `!important` in styles

## Build Command
```bash
npm run build && npm run build:prod
```

## Commit Message
```
perf(frontend): migrate to Angular application builder for faster builds
```

## Notes
- Official guide: [Angular migration to application builder](https://angular.dev/tools/cli/build-system-migration)
- Test admin Material components and section preview after migration — esbuild can surface import issues webpack hid.

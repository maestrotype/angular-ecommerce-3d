# Task 004: Backend incremental dev scripts

## Status: ✅ DONE (2026-08-26)

## Implementation
- Removed `prebuild` tsbuildinfo wipe from default build path; `build:clean` available for full rebuilds
- `npm start` in backend delegates to `start:dev` (watch mode)
- Docs updated to recommend `npm run backend:start:dev` from repo root

## Goal
Fix backend npm scripts so daily development uses incremental TypeScript compilation and watch mode. Buyers and agents should never wait for a full `nest build` on every backend restart.

## Epic
**Epic J — Build, DX & Architecture** (J1)

## Files to Edit
- `backend/package.json`
- `backend/nest-cli.json` (optional: `deleteOutDir`)
- `docs/GETTING_STARTED.md`
- `docs/QUICK_START.md`
- `docs/BUILD_AND_DEV_PERFORMANCE.md` (mark J1 done when complete)

## Files Forbidden to Edit
- Application business logic under `backend/src/` (unless required for build)
- `backend/tsconfig.json` compiler strictness flags (out of scope)

## Context Specs
- **Problem**: `prebuild` and `start`/`start:dev` run `rm -f tsconfig.tsbuildinfo`, defeating `incremental: true`.
- **Problem**: `npm start` runs full `nest build && node dist/main.js` — wrong for dev.
- **Baseline**: cold `nest build` ~4–5 s; with cache wiped every start, dev feels much slower.
- **`@gltf-transform/cli`**: move from `dependencies` → `devDependencies` if runtime only spawns CLI from `node_modules` path (verify `glb-optimization.service.ts` still works in prod).

## Definition of Done
1. `npm run start:dev` preserves `tsconfig.tsbuildinfo` between runs
2. `prebuild` no longer deletes tsbuildinfo (or only runs on CI clean builds via separate script)
3. `npm start` documented as production-like shortcut OR renamed to `start:once`; dev docs point to `start:dev`
4. Second consecutive `nest build` measurably faster than first (incremental)
5. `cd backend && npm run build` passes
6. Update GETTING_STARTED / QUICK_START if script names change

## Build Command
```bash
cd backend && npm run build
```

## Commit Message
```
fix(backend): preserve incremental build cache and clarify dev start scripts
```

## Notes
- Marketplace buyers often run `npm start` in backend folder expecting watch — make failure mode obvious in docs.
- Do not disable TypeORM synchronize in this task (separate Track B concern).

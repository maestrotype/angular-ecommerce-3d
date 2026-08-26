# Task 011: Monorepo / npm workspaces (optional)

## Status: 💡 PLANNED

## Goal
Evaluate and optionally implement npm workspaces (or Nx) to share dependencies between frontend and backend, reduce duplicate `node_modules` (~1.3 GB combined), and enable split Angular projects for storefront vs admin.

## Epic
**Epic J — Build, DX & Architecture** (J8)

## Files to Edit
- Root `package.json` (workspaces config)
- `backend/package.json`
- Possibly split `angular.json` into multi-project workspace
- `docs/BUILD_AND_DEV_PERFORMANCE.md`
- `docs/GETTING_STARTED.md`
- CI: `.github/workflows/ci.yml`

## Files Forbidden to Edit
- Business logic (unless import paths must change)

## Context Specs
- Current: separate `node_modules` at root (939 MB) and `backend/` (396 MB).
- **Option A (light)**: npm workspaces — hoist shared deps (`rxjs`, `typescript`), single install at root.
- **Option B (heavy)**: Nx monorepo with `storefront` + `admin` Angular apps + `backend` Nest app.
- Marketplace packaging must remain simple: buyer runs `npm install` + documented start commands.
- Only proceed if Task 005–007 complete and buyer DX docs updated.

## Definition of Done
1. Decision documented: Option A, Option B, or defer with rationale
2. If implemented: single root `npm install` works; CI green
3. Install size or install time improved (measure and record)
4. GETTING_STARTED.md updated with new install flow
5. No breaking change to Docker path without Dockerfile update

## Build Command
```bash
npm install && npm run build && cd backend && npm run build
```

## Commit Message
```
chore(monorepo): adopt npm workspaces for shared dependencies
```

## Notes
- **Low priority** for Track A marketplace launch — defer if increases buyer complexity.
- Track B enterprise may justify Nx for CI caching and affected builds.

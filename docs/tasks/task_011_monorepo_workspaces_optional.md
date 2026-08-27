# Task 011: Monorepo / npm workspaces (optional)

## Status: ✅ DONE

## Decision: Option A (npm workspaces)

**Chosen:** Light npm workspaces at the repo root with `backend` as the only nested workspace.

**Deferred:** Option B (Nx monorepo with split Angular storefront/admin apps) — unnecessary for Track A marketplace launch; would increase buyer complexity without proportional DX gain at current scale.

## Implementation summary

| Item | Change |
|------|--------|
| Root `package.json` | `"private": true`, `"workspaces": ["backend"]`, `backend:*` scripts |
| Lockfile | Single root `package-lock.json` (removed `backend/package-lock.json`) |
| TypeScript | Pinned `~5.4.5` via root `overrides` (Angular 17 requires `<5.5`) |
| CI | One `npm ci` + `npm run backend:lint` / `backend:build` |
| Docker / Render | `render.yaml` `rootDir: .`; `backend/Dockerfile` uses monorepo context |

## Install size (measured 2026-08-27)

| Layout | `node_modules` size |
|--------|---------------------|
| Before (separate installs) | ~939 MB root + ~396 MB backend ≈ **1.33 GB** |
| After (workspaces) | ~**1.20 GB** root + ~332 KB backend symlinks ≈ **1.20 GB** |
| **Savings** | **~130 MB (~10%)**; one install command |

## Root scripts

```bash
npm install              # frontend + backend
npm run build:all        # frontend + backend production builds
npm run backend:start:dev
npm run backend:build
npm run backend:lint
npm run backend:seed
```

## Epic
**Epic J — Build, DX & Architecture** (J8)

## Definition of Done

1. ✅ Decision documented: Option A (workspaces); Option B deferred
2. ✅ Single root `npm install` / `npm ci` works; builds pass locally
3. ✅ Install size measured and recorded (~10% reduction)
4. ✅ GETTING_STARTED.md updated
5. ✅ Docker path updated (`render.yaml` + `backend/Dockerfile`); no breaking isolated-backend Docker without root context

## Build Command

```bash
npm ci && npm run build && npm run backend:build
```

## Commit Message

```
chore(monorepo): adopt npm workspaces for shared dependencies
```

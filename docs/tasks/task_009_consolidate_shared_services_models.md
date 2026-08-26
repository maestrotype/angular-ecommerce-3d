# Task 009: Consolidate shared services and models

## Status: ✅ DONE

## Goal
Eliminate duplicate `ProductService`, `AuthService`, and parallel model files in `admin/models/` vs `shared/models/`. Establish one source of truth for marketplace buyers.

## Epic
**Epic J — Build, DX & Architecture** (J6)

## Files to Edit
- `src/admin/services/product.service.ts` → rename or merge
- `src/app/core/services/product.service.ts`
- `src/admin/services/auth.service.ts`
- `src/app/core/services/auth.service.ts`
- Similar pairs: `category`, `payment`, `message`, `notification` services
- `src/admin/models/*.model.ts` vs `src/shared/models/*.model.ts`
- All import sites in admin and app
- `docs/ARCHITECTURE.md`

## Files Forbidden to Edit
- Backend entities/DTOs (separate task if alignment needed)
- Unrelated components

## Context Specs
- Both `ProductService` classes use `providedIn: 'root'` — different class references, confusing for DI and docs.
- **Recommended naming after merge**:
  - Storefront: `ProductService`, `AuthService` in `core/services/`
  - Admin extensions: `AdminProductService` or admin methods in same service behind role checks — pick one pattern and document
- Models: consolidate to `src/shared/models/`; admin re-exports if needed for backward compat during migration.

## Definition of Done
1. No duplicate class names for the same domain service in admin vs app
2. All models for Product, Category, Order, User, Section exist once in `shared/models/`
3. Admin and storefront flows tested: login, product CRUD, shop listing, checkout auth
4. `npm run build` passes
5. ARCHITECTURE.md documents service ownership table

## Build Command
```bash
npm run build
```

## Commit Message
```
refactor(shared): consolidate duplicate services and models into shared layer
```

## Notes
- Large refactor — do in sub-PRs: models first, then ProductService, then AuthService.
- Update marketplace docs if buyer-facing API paths change.

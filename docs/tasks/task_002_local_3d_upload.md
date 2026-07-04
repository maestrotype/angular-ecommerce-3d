# Task 002: Local 3D Model Upload & Cloudinary Archival Flow

## Status: 🔄 IN PROGRESS (Started 2026-07-04)

## Problem Statement
When uploading a 3D model in the admin panel during local development:
1. The UI shows "Загрузка в Cloudinary..." (Loading to Cloudinary...) even when working locally
2. The upload process tries to send files to Cloudinary unnecessarily, causing slow uploads and 404 errors
3. There's no clear distinction between local storage (fast, for development) and Cloudinary storage (for production)
4. Developers have no easy way to later push a locally-saved model to Cloudinary

## Root Cause Analysis

### Current Upload Flow (Before Fix)
```
Admin Panel → Backend (temp dir) → Cloudinary upload attempt → DB stores Cloudinary URL
```

The issue: Even when `isLocalApi = true` (working with local backend), the frontend still shows Cloudinary-related messages and the upload flow tries to use Cloudinary.

### Backend Already Handles This Correctly
The backend (`uploads.controller.ts` lines 140-195) already has logic:
```typescript
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const isCloudinaryConfigured = this.cloudinaryConfigService.isConfigured();
const useCloudinary = isProduction || isCloudinaryConfigured;
```

When Cloudinary is not configured, it saves locally via `saveModelToLocalDisk()`. The problem is purely in the **frontend UI messaging** and user experience.

## Architecture Design

### New Upload Flow
```
┌──────────────────────────────────────────────────────────────┐
│              3D Model Upload - New Flow                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  LOCAL DEVELOPMENT (isLocalApi = true):                      │
│  ┌─────────────────────────────────────────────┐             │
│  │ Admin Upload → Backend local storage       │             │
│  │ (backend/uploads/products-3d/)              │             │
│  │                                              │             │
│  │ ✓ Fast - no network upload                  │             │
│  │ ✓ Immediate feedback                         │             │
│  │ ✓ Shows "LOCAL STORAGE" badge                │             │
│  │                                              │             │
│  │ [Archive to Cloudinary Button] ← Manual     │             │
│  └─────────────────────────────────────────────┘             │
│                                                               │
│  PRODUCTION (isLocalApi = false):                             │
│  ┌─────────────────────────────────────────────┐             │
│  │ Admin Upload → Cloudinary                   │             │
│  │                                              │             │
│  │ ✓ Direct to cloud                           │             │
│  │ ✓ Shows "CLOUDINARY" badge                  │             │
│  └─────────────────────────────────────────────┘             │
│                                                               │
│  MIGRATION (Local → Cloudinary):                              │
│  ┌─────────────────────────────────────────────┐             │
│  │ Click "Archive to Cloudinary" button        │             │
│  │ → POST /uploads/archive-local               │             │
│  │ → File optimized and uploaded to Cloudinary │             │
│  │ → DB updated with model3dUrl + publicId     │             │
│  └─────────────────────────────────────────────┘             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Frontend UI Updates

#### 1.1 `src/admin/pages/products/product-form/product-form.component.ts`
- [ ] Update `on3dFileSelected()` - ensure upload status messages reflect local vs Cloudinary
- [ ] Update `archiveLocalModel()` - verify it works correctly for manual archival
- [ ] Add method to check if current environment is local API

#### 1.2 `src/admin/pages/products/product-form/product-form.component.html`
- [ ] Remove "Загрузка в Cloudinary..." text during upload
- [ ] Replace with context-aware message:
  - Local: "Сохранение в локальное хранилище..." (Saving to local storage...)
  - Production: "Загрузка в Cloudinary..." (Loading to Cloudinary...)

### Phase 2: Translation Updates
- [ ] `src/assets/i18n/en.json` - Add/update translation keys
- [ ] `src/assets/i18n/ru.json` - Add/update translation keys
- [ ] `src/assets/i18n/ua.json` - Add/update translation keys

### Phase 3: Testing
- [ ] Test local upload (isLocalApi = true) - should save locally and show correct message
- [ ] Test Cloudinary archival button visibility and functionality
- [ ] Verify model loads correctly after local upload
- [ ] Verify model still works after archiving to Cloudinary

## Rules & Best Practices (DO NOT VIOLATE)

### ❌ DO: Multi-language (Translation Rules)
- **NEVER hardcode text in templates** - always use `{{ 'KEY' | translate }}`
- **ALWAYS add translations to ALL language files** (en.json, ru.json, ua.json)
- **Use descriptive key names**: `PRODUCT_3D.UPLOADING_LOCAL`, `PRODUCT_3D.ARCHIVE_TO_CLOUDINARY`
- **DO NOT mix languages** in the same file

### ❌ DO: Import Management
- **NEVER import unused libraries/modules** - this causes bundle bloat and potential errors
- **ALWAYS verify imports are used** before committing changes
- **Check for Express/Multer conflicts** - NestJS FileInterceptor already handles file uploads, don't add manual express middleware
- **Import only what you need** from each module

### ❌ DO: 3D Model Upload Rules
- **Local uploads should NEVER try Cloudinary first** when `isLocalApi = true`
- **Backend handles storage decision** - frontend should not force Cloudinary uploads
- **Always show clear visual feedback** about where the model is stored (LOCAL vs CLOUDINARY badge)
- **Preserve localModel3dUrl even after Cloudinary archival** - it's useful for reference
- **Use the existing `archiveLocalModel()` flow** for manual migration - don't create new endpoints

### ❌ DO: Code Quality
- **NEVER leave console.log in production code** without proper logging service
- **ALWAYS handle errors gracefully** - show user-friendly messages
- **Keep component methods focused** - extract logic to services when possible
- **Use existing services** (ProductService, UploadService) rather than making direct HTTP calls

### ❌ Do: Architecture Decisions
- **NEVER modify the backend upload logic for frontend UX issues** - the backend already handles local vs Cloudinary correctly
- **Frontend should reflect backend behavior** in its UI messages, not override it
- **Keep separation of concerns**: Admin panel = UI only, Backend = storage logic

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/admin/pages/products/product-form/product-form.component.ts` | Update upload status messages | High |
| `src/admin/pages/products/product-form/product-form.component.html` | Replace Cloudinary text with context-aware messages | High |
| `src/assets/i18n/en.json` | Add translation keys | Medium |
| `src/assets/i18n/ru.json` | Add translation keys | Medium |
| `src/assets/i18n/ua.json` | Add translation keys | Medium |

## Previous Related Work
- See `docs/tasks/task_001_3d-model-loading.md` - Initial 3D model loading infrastructure
- The archive-to-Cloudinary flow already exists, just needs better UI visibility

## Open Questions
1. Should we add a setting in admin panel to default upload behavior (local vs Cloudinary)?
2. Should we batch-archive multiple local models at once?

## Changelog

| Date | Change | Notes |
|------|--------|-------|
| 2026-07-04 | Task created | Documented problem, root cause, and implementation plan |
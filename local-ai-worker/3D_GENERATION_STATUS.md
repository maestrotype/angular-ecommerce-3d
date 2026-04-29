# 3D Generation Pipeline Status & Summary

This file tracks the status of the local AI 3D generation pipeline and recent fixes.

## Latest Updates (2026-04-25)

### 1. Functional Fixes
- **Local Path Propagation**: Updated `main.py` and backend providers (`HunyuanV2Provider`, `Unique3DProvider`) to return the absolute local file path of the generated GLB.
- **Frontend Capture**: `product-form.component.ts` now captures the `localPath` and stores it in `model3dPublicId` with a `LOCAL:` prefix.
- **Cloudinary Archiving**: Fixed the "Archive to Cloudinary" button to correctly trigger the upload of locally generated models.
    - If the model is served from `localhost:8000`, it uses the `downloadModel` backend logic.
    - If it has a `LOCAL:` prefix, it uses the `archive-local` endpoint.
- **Error Handling**: Polling logic now extracts and displays specific error messages from the AI worker (e.g., CUDA/MPS errors) instead of a generic "Failed" message.

### 2. Quality Improvements
- **Hunyuan3D-V2**: Increased default parameters for better quality.
    - Standard: 15 steps, 256 resolution.
    - HQ: 40 steps, 512 resolution, and uses the `full` model instead of `mini`.
- **MPS Optimization**: Enabled `PYTORCH_ENABLE_MPS_FALLBACK=1` and disabled CUDA in inference scripts for better performance on Mac M4 Max.

### 3. UX & Feedback (Latest)
- **Problematic Engine Warnings**: Implemented a "Beautiful" glassmorphism warning dialog for engines known to have issues on specific hardware (e.g., Unique3D on Apple Silicon).
- **In-App Instructions**: Users now get technical advice directly in the app when selecting problematic engines, explaining why they might fail and recommending alternatives like HunyuanV2.
- **Settings Clarity**: Added `(Legacy)` and `(Incompatible)` labels to the engine selection dropdown in Integrations settings.
- **Auto-Switching**: The warning dialog allows users to switch to a functional engine (HunyuanV2) with one click without leaving the product form.

### 4. Current Blockers / Known Issues
- **Unique3D & Pytorch3d**: `Unique3D` is currently broken on Apple Silicon because `pytorch3d` lacks native support and is difficult to compile.
    - *Status*: Disabled/Broken until a Docker solution or pre-compiled wheel is used.
- **Hunyuan3D Texture Quality**: Even with HQ settings, textures from Hunyuan3D-V2 might look "washed out" or low-res compared to SOTA online models. This is a limitation of the current open-source model.

## Next Steps
1. **Fix 404 errors** during source image download in worker (occurring when worker tries to fetch images from Cloudinary before they are fully indexed).
2. **Implement local background removal (rembg)** to avoid Cloudinary roundtrips and speed up the 3D generation flow.

---
*Last updated by: Antigravity AI Assistant*

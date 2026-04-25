# 3D Generation Task Status (Paused)

## Current Status: **Not Working**

### Issues Identified:
1. **Unique3D Failure**: The local AI worker fails when running Unique3D because `pytorch3d` is missing in the virtual environment. Installing `pytorch3d` on Mac (MPS) is non-trivial and may require building from source.
2. **InstantMesh ImportError**: Attempting to run InstantMesh failed with `ImportError: cannot import name 'find_pruneable_heads_and_indices' from 'transformers.pytorch_utils'`. This is likely a version mismatch in the `transformers` library.
3. **Hunyuan3D-V2 State**: Model weights (total ~11GB) were being downloaded. The script `hunyuan3d_inference.py` was tested and the help command works, but a full run was not completed.
4. **Frontend UI Bug**: The toast message shows "AI Generation failed: success", which is confusing. The polling logic correctly identifies a `failed` status from the backend, but the message string seems to be pulled from a field that contains "success" (possibly the HTTP status text instead of the task error).

### Done so far:
- Analysis of the 3D generation pipeline (Frontend -> Backend Gateway -> Python Worker).
- Verified `local-ai-worker/venv` exists and has most dependencies.
- Downgraded `transformers` to `4.34.1` to try and fix InstantMesh (caused conflicts with `hy3dgen`).
- Started background download of Hunyuan3D-V2 weights.

### Next Steps for Resumption:
1. **Fix Dependencies**: Resolve the `pytorch3d` issue or finalize `Hunyuan3D-V2` setup (finish downloads and test).
2. **Device Optimization**: Ensure all scripts in `local-ai-worker/` are using `device='mps'`. `InstantMesh/run_mps.py` is already tailored for this.
3. **Backend Logic**: Update `LocalAIWorker.main.py` or the Backend Provider to allow switching between models (InstantMesh vs Unique3D) more easily via settings.
4. **UI Cleanup**: Fix the confusing "failed: success" toast message in the Angular frontend.

## Environment:
- **OS**: macOS (Apple Silicon M4 Max)
- **Worker Port**: 8000 (Local FastAPI)
- **Backend Port**: 3000 (NestJS)
- **Frontend Port**: 4200 (Angular)

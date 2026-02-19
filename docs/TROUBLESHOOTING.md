# Troubleshooting Reference

Common issues and their resolutions for the Angular 3D E-commerce Platform.

## Server-Side Rendering (SSR) Issues

### Hydration Mismatch Errors
**Symptom**: Console warnings about "Hydration node mismatch" or UI flickering during load.
**Cause**: Discrepancies between server-generated HTML and client-side DOM (often caused by direct manipulation of the DOM or using `window` outside of platform guards).
**Solution**: Ensure all browser-specific logic is wrapped in `isPlatformBrowser(this.platformId)`. Check `app.component.ts` for logic related to theme cleanup and ensure it matches the server's initial state.

### Build Failures (NG6008)
**Symptom**: `NG6008: Component is standalone, and cannot be declared in an NgModule`.
**Cause**: Standalone components (like `HeroGlassComponent`) being added to `declarations` instead of `imports` in `AppModule`.
**Solution**: Move the component from `declarations` to the `imports` array in the relevant module.

## 3D Rendering (Three.js)

### Model Not Loading
**Symptom**: Product page loads but the 3D viewer remains empty.
**Cause**: 
1. Incorrect `modelPath` in the database.
2. CORS issues if models are hosted on an external CDN.
3. Missing decompression library (Meshopt).
**Solution**: Verify the path in the `uploads/` directory on the backend. Check the browser's Network tab for 404 errors on `.glb` files.

### Low FPS / Performance Lag
**Symptom**: Choppy animation or high CPU usage.
**Cause**: Anti-aliasing or high-resolution shadow maps on low-end hardware.
**Solution**: The viewer already limits the pixel ratio to 1.5. If issues persist, consider reducing the `mapSize` of the `DirectionalLight` in `ThreeDViewerComponent`.

## Connectivity

### Local API Failure
**Symptom**: "Error loading products" when running locally.
**Cause**: The frontend is attempting to connect to `localhost:3002` while the backend is down.
**Solution**: The `ApiConfigService` implements an automatic failover. Ensure you are running `npm start` on the frontend and `npm run start:dev` on the backend. If the local backend is unreachable after 1 second, it will failover to the production URL defined in `environment.ts`.

## Deployment

### Image Upload Failures
**Symptom**: 500 Error when uploading product images.
**Cause**: Missing Cloudinary API keys or directory permission issues in the `uploads/` folder.
**Solution**: Verify permissions for the `backend/uploads` directory. For production, ensure `CLOUDINARY_API_KEY` and associated variables are set in your environment.

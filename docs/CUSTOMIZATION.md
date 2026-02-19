# Customization and Extensibility

Instructions for extending the platform's functionality and visual style.

## Theme Architecture

The platform uses a CSS variable-based token system located in `src/styles/themes/`.

### Modifying Theme Tokens
Each theme (Light, Dark, Glass, Dark Glass) is defined by a set of functional tokens. To modify the accent color across all themes:

1. Locate the specific theme SCSS file.
2. Update the `--accent-primary` or `--hero-gradient` variables.
3. The `ThemeService` handles the runtime application of these tokens to the `[data-theme]` attribute on the `<body>` element.

## 3D Viewer Configuration

The `ThreeDViewerComponent` is the core engine for product visualization.

### Component Inputs
- `modelPath`: URI to the `.glb` or `.gltf` asset.
- `scale`: `[x, y, z]` array (Default: `[1, 1, 1]`).
- `position`: `[x, y, z]` world space coordinates.

### Performance Adjustments
To optimize for lower-end devices, the component automatically scales the pixel ratio:
```typescript
const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
this.renderer.setPixelRatio(pixelRatio);
```
Shadow maps are dynamically disabled on mobile devices detected via `userAgent` to maintain 60 FPS.

## Localized Content (i18n)

Translation assets are managed via `@ngx-translate`.
- **Location**: `src/assets/i18n/*.json`
- **Addition**: Create a new locale file (e.g., `fr.json`) and register the locale code in the `AppModule` translate configuration.

## API Integration & DTOs

If adding new product attributes:
1. **Backend**: Update the `Product` entity and the corresponding `CreateProductDto` in `backend/src/products/`.
2. **Frontend**: Update the `Product` interface in `src/shared/models/product.model.ts`.
3. The Angular `ProductService` will automatically map the new fields during the next HTTP request.

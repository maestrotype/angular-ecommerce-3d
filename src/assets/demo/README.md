# Demo assets (bundled with the template)

These files ship with the marketplace template so buyers can run a working storefront **without supplying their own images or 3D models**.

## Product thumbnails (`products/`)

| File | License |
|------|---------|
| `*.svg` | MIT — created for this project, free to modify and redistribute |

Use paths like `assets/demo/products/headphones.svg` in seed data or admin product images.

## 3D models (`models/`)

| File | Source | License |
|------|--------|---------|
| `duck.glb` | [Khronos — Duck](https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/Duck) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `avocado.glb` | Khronos — Avocado | CC0 1.0 |
| `water-bottle.glb` | Khronos — WaterBottle | CC0 1.0 |

**`duck.glb` is committed** (~120 KB) so 3D works immediately after clone.

**Larger models** (`avocado.glb`, `water-bottle.glb`) are downloaded on demand — keeps the git repo lean:

```bash
npm run demo:models
```

Reference in product `model3dUrl` as `assets/demo/models/duck.glb` (served by Angular).

Replace with your own `.glb` assets in production. See `docs/CUSTOMIZATION.md` for upload via Admin → Products.

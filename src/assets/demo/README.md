# Demo assets (bundled with the template)

These files ship with the marketplace template so buyers can run a working storefront **without supplying their own images or 3D models**.

## Product thumbnails (`products/`)

| File | License |
|------|---------|
| `*.svg` | MIT — created for this project, free to modify and redistribute |

Use paths like `assets/demo/products/bag.svg` in seed data or admin product images.

## 3D models

Fashion demo GLB assets live under `assets/models/`:

| Path | Use |
|------|-----|
| `assets/demo/models/bag-demo.glb` | Bags category (~2MB, optimized) |
| `assets/demo/models/shoes-demo.glb` | Shoes category (~3MB, optimized) |

Regenerate from source meshes:

```bash
npm run demo:optimize-models
```

Optional Khronos CC0 samples (`avocado.glb`, `water-bottle.glb`) can be fetched with:

```bash
npm run demo:models
```

Replace with your own `.glb` assets in production. See `docs/CUSTOMIZATION.md` for upload via Admin → Products.

# Demo assets (bundled with the template)

These files ship with the marketplace template so buyers can run a working storefront **without supplying their own images or 3D models**.

## Product thumbnails (`products/`)

| File | License |
|------|---------|
| `*.svg` | MIT — created for this project, free to modify and redistribute |

Use paths like `assets/demo/products/bag.svg` in seed data or admin product images.

## 3D models

Full-quality fashion GLB assets ship under `assets/models/`:

| Path | Use |
|------|-----|
| `assets/models/bag/bag3.glb` | Bags category (~39 MB, photogrammetry source) |
| `assets/models/shoes/shoes1.glb` | Shoes category (~25 MB, photogrammetry source) |

Optional lightweight copies for slow hosting (`assets/demo/models/*-demo.glb`, ~2 MB) can be regenerated with:

```bash
npm run demo:optimize-models
```

The storefront resolves legacy DB paths such as `bag-catalog.glb` / `bag-demo.glb` to the HQ assets automatically.

Optional Khronos CC0 samples (`avocado.glb`, `water-bottle.glb`) can be fetched with:

```bash
npm run demo:models
```

Replace with your own `.glb` assets in production. See `docs/CUSTOMIZATION.md` for upload via Admin → Products.

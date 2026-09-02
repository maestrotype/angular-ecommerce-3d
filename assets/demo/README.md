# Demo assets (bundled with the template)

These files ship with the marketplace template so buyers can run a working storefront **without supplying their own images or 3D models**.

## Product thumbnails (`products/`)

| File | License |
|------|---------|
| `*.png`, `*.svg` | MIT — created for this project, free to modify and redistribute |

Use paths like `assets/demo/products/sneaker.png` in seed data or admin product images.

## 3D models (`models/`)

| Path | Source | License |
|------|--------|---------|
| `shoes-catalog.glb` | [Khronos Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — © Shopify |
| `bag-catalog.glb` | Lossless copy of `assets/models/bag/bag3.glb` | Same as your bag source asset |

Regenerate demo catalog GLBs:

```bash
npm run demo:build-models
cd backend && npm run seed   # migrates DB URLs from legacy *-demo.glb paths
```

Optional Khronos CC0 samples (`avocado.glb`, `water-bottle.glb`) can be fetched with:

```bash
npm run demo:models
```

Replace with your own `.glb` assets in production. See `docs/CUSTOMIZATION.md` for upload via Admin → Products.

**Service worker note:** if a 3D preview still looks wrong after updating models, hard-refresh (`Cmd+Shift+R`) or unregister the app service worker — `.glb` files under `/assets/` are cached.

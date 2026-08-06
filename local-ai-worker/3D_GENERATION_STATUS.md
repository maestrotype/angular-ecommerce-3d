# 3D Generation — API-first (2026-08-06)

Local 3D pipeline removed. Admin UI only shows working cloud providers.

## Can you generate 3D for free?

**Yes — via cloud API free tiers**, not locally on this Mac.

| Provider | Free? | How |
|----------|-------|-----|
| **Tripo3D** (recommended) | Yes | ~300 credits/mo after signup — API key in Integrations |
| **Meshy** | Yes | ~100 credits/mo (~5 image→3D) — API key in Integrations |
| **Tencent Hunyuan3D** | Limited | 200 credits on Cloud signup |
| Local Unique3D / InstantMesh / HunyuanV2 | No | Removed — broken or too heavy on Apple Silicon |

## Admin providers (current)

Shown: `tripo3d`, `meshy`, `hunyuan3d`, `luma`, `custom`  
Hidden/deprecated: `unique3d`, `hunyuan_v2` (fallback to Tripo3D if still in DB)

## Quick start (Tripo3D)

1. https://www.tripo3d.ai/ → create account → copy API key  
2. Admin → Integrations → Active provider = Tripo3D → paste key → Save  
3. Products → edit → upload product photo → Generate 3D  

Image URL must be publicly reachable by Tripo (Cloudinary URL works; localhost does not).

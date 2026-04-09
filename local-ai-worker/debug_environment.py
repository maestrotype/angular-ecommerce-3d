import sys
import os

print(f"Python version: {sys.version}")
print(f"Working directory: {os.getcwd()}")

try:
    import torch
    print(f"✅ torch version: {torch.__version__}")
    print(f"✅ MPS available: {torch.backends.mps.is_available()}")
except ImportError:
    print("❌ torch NOT FOUND")

try:
    import diffusers
    print(f"✅ diffusers version: {diffusers.__version__}")
except ImportError:
    print("❌ diffusers NOT FOUND")

try:
    import accelerate
    print("✅ accelerate FOUND")
except ImportError:
    print("❌ accelerate NOT FOUND")

try:
    import trimesh
    print(f"✅ trimesh version: {trimesh.__version__}")
except ImportError:
    print("❌ trimesh NOT FOUND")

try:
    import omegaconf
    print("✅ omegaconf FOUND")
except ImportError:
    print("❌ omegaconf NOT FOUND")

try:
    import pytorch_lightning
    print("✅ pytorch_lightning FOUND")
except ImportError:
    print("❌ pytorch_lightning NOT FOUND")

try:
    import rembg
    print("✅ rembg FOUND")
    import onnxruntime
    print("✅ onnxruntime FOUND")
except ImportError as e:
    print(f"❌ rembg/onnxruntime error: {e}")

try:
    import einops
    print("✅ einops FOUND")
except ImportError:
    print("❌ einops NOT FOUND")

# Check if InstantMesh internal modules are reachable
sys.path.append(os.path.join(os.getcwd(), "InstantMesh"))
try:
    from src.utils.train_util import instantiate_from_config
    print("✅ InstantMesh internal modules FOUND")
except ImportError as e:
    print(f"❌ InstantMesh internal modules NOT FOUND: {e}")

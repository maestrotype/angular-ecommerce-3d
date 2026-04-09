import os
import sys

# --- CONFIGURATION ---
# We store high-quality weights in the Documents folder
DEFAULT_WEIGHTS_DIR = "/Users/andriidanichkin/Documents/InstantMesh-Weights"
# ---------------------

def download_weights(target_dir):
    print(f"🚀 Preparing to download InstantMesh weights to: {target_dir}")
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
        print(f"📂 Created directory: {target_dir}")

    # Set HuggingFace cache home to the target directory
    os.environ["HF_HOME"] = target_dir
    os.environ["HUGGINGFACE_HUB_CACHE"] = target_dir
    
    print("\n📥 Downloading weights (InstantMesh ~10GB)...")
    
    try:
        from huggingface_hub import snapshot_download
        
        # Check for HF_TOKEN (optional for InstantMesh but good to have)
        token = os.environ.get("HF_TOKEN")
        
        # 1. InstantMesh weights (Public, no terms needed)
        print("📦 Fetching TencentARC/InstantMesh...")
        snapshot_download(
            repo_id="TencentARC/InstantMesh", 
            local_dir=os.path.join(target_dir, "InstantMesh"),
            local_dir_use_symlinks=False,
            token=token
        )
        
        print("\n✅ All weights downloaded successfully!")
        print(f"💡 Models are saved in: {target_dir}")
        print("💡 Next step: Install the InstantMesh code and point main.py to it.")

    except ImportError:
        print("❌ Error: huggingface_hub not found. Please run ./setup_mac.sh again.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error during download: {e}")

if __name__ == "__main__":
    download_weights(DEFAULT_WEIGHTS_DIR)

# Local AI 3D Generation Setup (Mac / Apple Silicon)

This guide explains how to set up the high-performance **InstantMesh** (NeRF variant) local worker on your Mac (tested on M4 Max). This allows for free, private 3D generation directly in your admin panel.

## Prerequisites

- **macOS** with Apple Silicon (M1/M2/M3/M4 Max recommended).
- **Python 3.10+** (3.11/3.12 recommended).
- **Git**.

## Installation

1.  **Clone the Worker**:
    Navigate to the project root and enter the worker folder:
    ```bash
    cd local-ai-worker
    ```

2.  **Run Automated Setup**:
    The provided script creates a virtual environment and installs all necessary Mac-optimized dependencies (including MPS support and 3D processing libraries):
    ```bash
    chmod +x setup_mac.sh
    ./setup_mac.sh
    ```

3.  **Cloning the Core Model**:
    Ensure you have cloned the official InstantMesh repository inside the `local-ai-worker` folder:
    ```bash
    git clone https://github.com/TencentARC/InstantMesh.git
    ```

4.  **Download Model Weights**:
    Run the interactive downloader. It will save the heavy model weights (~10GB) to `~/Documents/InstantMesh-Weights` to keep your project folder small.
    ```bash
    python download_weights.py
    ```

## Usage

1.  **Activate Environment**:
    ```bash
    source venv/bin/activate
    ```

2.  **Start the Worker**:
    ```bash
    python main.py
    ```
    The server will start at `http://localhost:8000`.

3.  **Configure Admin Panel**:
    - Go to **Admin -> Integrations -> AI Providers**.
    - Set **Active Provider** to `Custom Provider / Local Server`.
    - Set the **Custom URL** to `http://localhost:8000/generate`.

## Technical Notes (Optimization)

- **Model Variant**: We use `instant-nerf-large.yaml` for stable Mac compatibility. It uses Marching Cubes for mesh extraction, which is highly efficient on CPU/MPS and does not require NVIDIA-specific libraries (like `nvdiffrast`).
- **Conversion**: The worker automatically converts the raw `.obj` output to `.glb` using the `trimesh` library for seamless previewing in the browser.
- **Hardware Acceleration**: The worker uses **Apple Silicon (MPS)** for the diffusion stage, ensuring significantly faster generation than CPU-only modes.

## Troubleshooting

- **Import Errors**: If you encounter `ModuleNotFoundError`, ensure you've run `./setup_mac.sh` after any major updates to install new dependencies.
- **Performance**: High resolutions (e.g. over 256) will significantly increase generation time. The default is set to 256 for a good balance of quality and speed.

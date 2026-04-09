# Local AI 3D Generation Setup Guide (InstantMesh)

This guide explains how to enable high-quality local 3D model generation using **InstantMesh** on your own hardware.

## Prerequisites
- **Hardware**: MacBook M1/M2/M3/M4 (Max/Ultra recommended).
- **Software**: Python 3.10+, Git.

## 1. Directory Structure
To keep the project lightweight, we separate the **Code** from the **Heavy Model Weights**:
- `local-ai-worker/`: Contains the FastAPI server and scripts (Lightweight).
- `~/Documents/InstantMesh-Weights/`: Contains the model weights (~10GB, External).

## 2. Installation (macOS)
1. Open terminal in the `local-ai-worker` directory.
2. Run the setup script:
   ```bash
   ./setup_mac.sh
   ```
3. Download the AI model weights:
   ```bash
   python download_weights.py
   ```
   *This will save the models to your Documents/InstantMesh-Weights folder.*

## 3. Running the Worker
1. Activate environment: `source venv/bin/activate`
2. Start server: `python main.py`
3. The worker will be available at `http://localhost:8000`.

## 4. Integration with Admin Panel
1. Login to **Admin Panel -> Integrations**.
2. Select **"Custom Provider / Local Server"** as the Active Provider.
3. Enter the Webhook URL: `http://localhost:8000/generate`.
4. Save Settings.

## 5. Usage
- Go to any Product.
- Upload an image.
- Click **"Generate with AI"**.
- Your local machine will start processing (InstantMesh).

---

## Deletion / Cleanup
To remove all AI-related data:
1. Delete the `local-ai-worker` folder in the project.
2. Delete the `~/Documents/InstantMesh-Weights` folder to free up ~10GB of disk space.

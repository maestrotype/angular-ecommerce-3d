import os
import asyncio
import subprocess
import shutil
import time
import requests
import trimesh
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Local 3D AI Worker (InstantMesh Optimized)")

# Ensure output directory exists
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Mount static files to serve generated models
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# In-memory store for task states (should use Redis/DB for production)
tasks: Dict[str, dict] = {}

class GenerateRequest(BaseModel):
    image_url: str
    action: str = "generate"

async def run_instantmesh_generation(task_id: str, image_url: str):
    """
    Main pipeline for InstantMesh inference on Apple Silicon (MPS).
    1. Downloads the source image.
    2. Runs the MPS-optimized InstantMesh inference script.
    3. Converts the resulting OBJ to GLB for web frontend support.
    """
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["progress"] = 10
        
        # Step 1: Download the source image
        input_image_path = os.path.join("InstantMesh/examples", f"input_{task_id}.png")
        print(f"Downloading image from {image_url} to {input_image_path}")
        response = requests.get(image_url, stream=True)
        if response.status_code == 200:
            with open(input_image_path, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
        else:
            raise Exception(f"Failed to download image: HTTP {response.status_code}")

        tasks[task_id]["progress"] = 30

        # Step 2: Run InstantMesh Inference (using run_mps.py)
        # We use a lower resolution and no texture map for speed during development
        # Command: python run_mps.py configs/instant-mesh-large.yaml input.png --output_path outputs/
        print(f"Starting InstantMesh inference for task {task_id}")
        
        # Switch to instant-nerf-large for Mac compatibility (uses Marching Cubes instead of Flexicubes)
        # Relative to InstantMesh folder:
        # - script: run_mps.py
        # - config: configs/instant-nerf-large.yaml
        # - input: examples/input_{task_id}.png
        cmd = [
            "python", "run_mps.py",
            "configs/instant-nerf-large.yaml",
            f"examples/input_{task_id}.png",
            "--output_path", "outputs",
            "--mesh_resolution", "256" # lowered from 512 to stay under 10MB limit
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd="InstantMesh",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = stderr.decode()
            print(f"InstantMesh Error: {error_msg}")
            raise Exception(f"Inference failed with exit code {process.returncode}")

        tasks[task_id]["progress"] = 80

        # Step 3: Convert OBJ to GLB
        # Path is relative to project root
        obj_path = f"InstantMesh/outputs/instant-nerf-large/meshes/input_{task_id}.obj"
        glb_path = os.path.join(OUTPUT_DIR, f"{task_id}.glb")
        
        if os.path.exists(obj_path):
            try:
                mesh = trimesh.load(obj_path)
                
                # Fix orientation: rotate 90 degrees around X axis to make it horizontal
                # InstantNeRF output often needs this for standard Y-up viewers
                rotation = trimesh.transformations.rotation_matrix(np.pi/2, [1, 0, 0])
                mesh.apply_transform(rotation)
                
                mesh.export(glb_path)
                print(f"Successfully converted and rotated {obj_path} to {glb_path}")
            except Exception as e:
                raise Exception(f"Conversion failed: {str(e)}")
        else:
            raise Exception(f"Expected output mesh not found at {obj_path}")

        # Finalize Task
        tasks[task_id]["status"] = "success"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["model_url"] = f"http://localhost:8000/outputs/{task_id}.glb"
        print(f"Task {task_id} completed successfully!")

    except Exception as e:
        print(f"Error in task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        # Cleanup temp files (optional)
        if os.path.exists(input_image_path):
            os.remove(input_image_path)

@app.post("/generate")
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    # Generate a unique task_id since NestJS doesn't send one
    task_id = f"task_{int(time.time())}_{os.urandom(2).hex()}"
    tasks[task_id] = {"status": "queued", "progress": 0}
    
    # Start the actual generation in the background
    background_tasks.add_task(run_instantmesh_generation, task_id, request.image_url)
    
    return {"task_id": task_id, "status": "queued"}

@app.get("/generate/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

# Alias for polling consistency
@app.get("/task/{task_id}")
async def get_task_alias(task_id: str):
    return await get_status(task_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

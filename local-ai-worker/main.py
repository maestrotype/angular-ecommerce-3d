import os
import asyncio
import subprocess
import shutil
import time
import requests
import trimesh
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uav_tracker
import vlm_analyzer
from typing import Dict, Optional

app = FastAPI(title="Local 3D AI Worker (InstantMesh Optimized)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            "--mesh_resolution", "512"
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

async def run_uav_mapping(
    task_id: str,
    video_path: str,
    crop_osd: bool,
    geo_bounds: Optional[dict] = None,
    reference_image_path: Optional[str] = None,
    prompt_text: Optional[str] = None
):
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["progress"] = 5
        
        # 1. Run AI Semantic Analysis in parallel (via LM Studio)
        print(f"Task {task_id}: Triggering VLM Analysis via LM Studio")
        # We run this in a thread because it makes a blocking HTTP request
        text_analysis = await asyncio.to_thread(
            vlm_analyzer.analyze_flight,
            video_path,
            reference_image_path,
            prompt_text
        )
        
        tasks[task_id]["progress"] = 30

        # 2. Extract relative trajectory (Optical Flow)
        print(f"Task {task_id}: Starting optical flow extraction on {video_path}")
        trajectory = await asyncio.to_thread(
            uav_tracker.extract_trajectory,
            video_path, crop_osd, 1500, geo_bounds
        )
        
        tasks[task_id]["progress"] = 80
        
        # Save output to JSON
        output_json = os.path.join(OUTPUT_DIR, f"{task_id}_trajectory.json")
        with open(output_json, 'w') as f:
            json.dump({
                "trajectory": trajectory, 
                "geo_calibrated": geo_bounds is not None,
                "text_analysis": text_analysis
            }, f)
            
        tasks[task_id]["status"] = "success"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["text_analysis"] = text_analysis
        tasks[task_id]["model_url"] = f"http://localhost:8000/outputs/{task_id}_trajectory.json"
        
    except Exception as e:
        print(f"Error in UAV task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        # Cleanup temp files
        if os.path.exists(video_path):
            os.remove(video_path)
        if reference_image_path and os.path.exists(reference_image_path):
            os.remove(reference_image_path)

@app.post("/uav-map")
def process_uav_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    crop_osd: bool = Form(True),
    bounds_north: float = Form(None),
    bounds_south: float = Form(None),
    bounds_east: float = Form(None),
    bounds_west: float = Form(None),
    reference_image: Optional[UploadFile] = File(None),
    prompt_text: Optional[str] = Form(None)
):
    task_id = f"task_{int(time.time())}_{os.urandom(2).hex()}"
    tasks[task_id] = {"status": "queued", "progress": 0}
    
    # Parse optional GPS bounds
    geo_bounds = None
    if all(v is not None for v in [bounds_north, bounds_south, bounds_east, bounds_west]):
        geo_bounds = {
            "north": bounds_north,
            "south": bounds_south,
            "east": bounds_east,
            "west": bounds_west
        }
        print(f"Task {task_id}: GPS bounds provided: {geo_bounds}")
    else:
        print(f"Task {task_id}: No GPS bounds, trajectory will be in pixel space.")
    
    # Save video (synchronous, runs in threadpool since def not async)
    temp_video_path = os.path.join("outputs", f"temp_{task_id}.mp4")
    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
        
    # Save optional reference image
    temp_img_path = None
    if reference_image:
        temp_img_path = os.path.join("outputs", f"temp_{task_id}_{reference_image.filename}")
        with open(temp_img_path, "wb") as buffer:
            shutil.copyfileobj(reference_image.file, buffer)
        
    # Launch background task
    background_tasks.add_task(run_uav_mapping, task_id, temp_video_path, crop_osd, geo_bounds, temp_img_path, prompt_text)
    
    return {"task_id": task_id, "status": "queued"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

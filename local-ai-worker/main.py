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
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Local 3D AI Worker (Multi-Model HQ)")

# Add CORS middleware to allow WebGL viewer to fetch GLB files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all, or specify http://localhost:4200
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
    model: str = "instantmesh" # instantmesh, unique3d, hunyuan_v2
    hq: bool = False

async def run_instantmesh_generation(task_id: str, image_url: str, hq: bool = False):
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
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(image_url, stream=True, headers=headers)
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
        resolution = "512" if hq else "256"
        cmd = [
            "python", "run_mps.py",
            "configs/instant-nerf-large.yaml",
            f"examples/input_{task_id}.png",
            "--output_path", "outputs",
            "--mesh_resolution", resolution
        ]
        
        if hq:
            cmd.append("--export_texmap")
        
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
                # trimesh load will automatically find materials/textures if they exist in the same folder
                mesh = trimesh.load(obj_path, process=False)
                
                # Check if it's a scene (often happens when multiple parts/materials exist)
                if isinstance(mesh, trimesh.Scene):
                    # Rotate all geometry in the scene
                    # Normal orientation fix: rotate -90 degrees around X axis
                    rotation = trimesh.transformations.rotation_matrix(-np.pi/2, [1, 0, 0])
                    mesh.apply_transform(rotation)
                    # Use export with GLB format
                    glb_data = mesh.export(file_type='glb')
                    with open(glb_path, 'wb') as f:
                        f.write(glb_data)
                else:
                    # Fix orientation: rotate -90 degrees around X axis
                    rotation = trimesh.transformations.rotation_matrix(-np.pi/2, [1, 0, 0])
                    mesh.apply_transform(rotation)
                    
                    # Fix chirality (mirror X) as InstantMesh/Zero123 often has inverted X
                    chirality = trimesh.transformations.scale_matrix(-1, [1, 0, 0])
                    mesh.apply_transform(chirality)
                    
                    mesh.export(glb_path, 'glb')
                print(f"Successfully converted and rotated {obj_path} to {glb_path}")
            except Exception as e:
                raise Exception(f"Conversion failed: {str(e)}")
        else:
            raise Exception(f"Expected output mesh not found at {obj_path}")

        # Finalize Task
        tasks[task_id]["status"] = "success"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["model_url"] = f"http://localhost:8000/outputs/{task_id}.glb"
        tasks[task_id]["local_path"] = os.path.abspath(glb_path)
        print(f"Task {task_id} completed successfully!")

    except Exception as e:
        print(f"Error in task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        # Cleanup temp files (optional)
        if os.path.exists(input_image_path):
            os.remove(input_image_path)

async def run_unique3d_generation(task_id: str, image_url: str, hq: bool = False):
    """
    Pipeline for Unique3D inference on Apple Silicon (MPS).
    Calls unique3d_inference.py CLI script inside the Unique3D/ repo.
    """
    input_image_path = None
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["progress"] = 10

        # Step 1: Check repo and weights
        if not os.path.exists("Unique3D"):
            raise Exception("Unique3D repository missing. Clone it to local-ai-worker/Unique3D")
        if not os.path.exists("Unique3D/ckpt"):
            raise Exception("Unique3D model weights not found. Run: python -c \"from huggingface_hub import snapshot_download; snapshot_download('Wuvin/Unique3D', repo_type='space', local_dir='Unique3D')\"")

        # Step 2: Download source image into Unique3D/input/
        input_dir = os.path.join("Unique3D", "input")
        os.makedirs(input_dir, exist_ok=True)
        input_image_path = os.path.join(input_dir, f"input_{task_id}.png")
        print(f"Downloading image from {image_url} to {input_image_path}")
        response = requests.get(image_url, stream=True)
        if response.status_code != 200:
            raise Exception(f"Failed to download image: HTTP {response.status_code}")
        with open(input_image_path, 'wb') as f:
            shutil.copyfileobj(response.raw, f)

        tasks[task_id]["progress"] = 30

        # Step 3: Run Unique3D via our CLI wrapper
        # unique3d_inference.py outputs a GLB at: Unique3D/u3d_outputs/input_{task_id}.glb
        u3d_output_dir = os.path.join("Unique3D", "u3d_outputs")
        os.makedirs(u3d_output_dir, exist_ok=True)

        # Absolute paths so the script can be run from any cwd
        abs_input = os.path.abspath(input_image_path)
        abs_output = os.path.abspath(u3d_output_dir)

        cmd = [
            "python", "unique3d_inference.py",
            "--image", abs_input,
            "--output", abs_output,
            "--seed", "42",
        ]
        if not hq:
            cmd.append("--no-refine")

        print(f"Starting Unique3D inference for task {task_id}")
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd="Unique3D",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={**os.environ, "PYTORCH_ENABLE_MPS_FALLBACK": "1"}
        )
        stdout, stderr = await process.communicate()

        stdout_text = stdout.decode(errors="replace")
        stderr_text = stderr.decode(errors="replace")
        print(f"[Unique3D stdout]\n{stdout_text}")
        if stderr_text:
            print(f"[Unique3D stderr]\n{stderr_text}")

        if process.returncode != 0:
            raise Exception(f"Unique3D inference failed (exit {process.returncode}):\n{stderr_text}")

        tasks[task_id]["progress"] = 80

        # Step 4: Collect the GLB output
        stem = f"input_{task_id}"
        model_glb_path = os.path.join(u3d_output_dir, f"{stem}.glb")
        glb_path = os.path.join(OUTPUT_DIR, f"{task_id}.glb")

        if not os.path.exists(model_glb_path):
            raise Exception(f"Unique3D output not found at {model_glb_path}")
        shutil.copy(model_glb_path, glb_path)
        print(f"Successfully copied {model_glb_path} -> {glb_path}")

        tasks[task_id]["status"] = "success"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["model_url"] = f"http://localhost:8000/outputs/{task_id}.glb"
        tasks[task_id]["local_path"] = os.path.abspath(glb_path)

    except Exception as e:
        print(f"Error in Unique3D task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        if input_image_path and os.path.exists(input_image_path):
            os.remove(input_image_path)


async def run_hunyuanv2_generation(task_id: str, image_url: str, hq: bool = False):
    """
    Pipeline for Tencent Hunyuan3D v2 inference on Apple Silicon (MPS).
    Calls hunyuan3d_inference.py CLI script inside the Hunyuan3D-V2/ repo.
    """
    input_image_path = None
    try:
        tasks[task_id]["status"] = "running"
        tasks[task_id]["progress"] = 10

        # Step 1: Check repo exists
        if not os.path.exists("Hunyuan3D-V2"):
            raise Exception("Hunyuan3D-V2 repository missing. Clone it to local-ai-worker/Hunyuan3D-V2")

        # Step 2: Download source image into Hunyuan3D-V2/input/
        input_dir = os.path.join("Hunyuan3D-V2", "input")
        os.makedirs(input_dir, exist_ok=True)
        input_image_path = os.path.join(input_dir, f"input_{task_id}.png")
        print(f"Downloading image from {image_url} to {input_image_path}")
        response = requests.get(image_url, stream=True)
        if response.status_code != 200:
            raise Exception(f"Failed to download image: HTTP {response.status_code}")
        with open(input_image_path, 'wb') as f:
            shutil.copyfileobj(response.raw, f)

        tasks[task_id]["progress"] = 30

        # Step 3: Run Hunyuan3D-V2 via our CLI wrapper
        # hunyuan3d_inference.py downloads weights via HuggingFace Hub on first run,
        # then outputs a GLB at: Hunyuan3D-V2/hy3d_outputs/input_{task_id}.glb
        hy3d_output_dir = os.path.join("Hunyuan3D-V2", "hy3d_outputs")
        os.makedirs(hy3d_output_dir, exist_ok=True)

        abs_input = os.path.abspath(input_image_path)
        abs_output = os.path.abspath(hy3d_output_dir)

        # Use 'mini' for speed; 'full' for hq mode
        model_variant = "full" if hq else "mini"
        steps = 40 if hq else 15
        resolution = 512 if hq else 256

        cmd = [
            "python", "hunyuan3d_inference.py",
            "--image", abs_input,
            "--output", abs_output,
            "--model", model_variant,
            "--steps", str(steps),
            "--resolution", str(resolution),
            "--seed", "1234",
        ]

        print(f"Starting Hunyuan3D-V2 inference for task {task_id} (model={model_variant})")
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd="Hunyuan3D-V2",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={**os.environ, "PYTORCH_ENABLE_MPS_FALLBACK": "1"}
        )
        stdout, stderr = await process.communicate()

        stdout_text = stdout.decode(errors="replace")
        stderr_text = stderr.decode(errors="replace")
        print(f"[Hunyuan3D stdout]\n{stdout_text}")
        if stderr_text:
            print(f"[Hunyuan3D stderr]\n{stderr_text}")

        if process.returncode != 0:
            raise Exception(f"Hunyuan3D-V2 inference failed (exit {process.returncode}):\n{stderr_text}")

        tasks[task_id]["progress"] = 80

        # Step 4: Collect the GLB output
        stem = f"input_{task_id}"
        model_glb_path = os.path.join(hy3d_output_dir, f"{stem}.glb")
        glb_path = os.path.join(OUTPUT_DIR, f"{task_id}.glb")

        if not os.path.exists(model_glb_path):
            raise Exception(f"Hunyuan3D-V2 output not found at {model_glb_path}")
        shutil.copy(model_glb_path, glb_path)
        print(f"Successfully copied {model_glb_path} -> {glb_path}")

        tasks[task_id]["status"] = "success"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["model_url"] = f"http://localhost:8000/outputs/{task_id}.glb"
        tasks[task_id]["local_path"] = os.path.abspath(glb_path)

    except Exception as e:
        print(f"Error in Hunyuan3D-V2 task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
    finally:
        if input_image_path and os.path.exists(input_image_path):
            os.remove(input_image_path)


@app.post("/generate")
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    task_id = f"task_{int(time.time())}_{os.urandom(2).hex()}"
    tasks[task_id] = {"status": "queued", "progress": 0, "model": request.model}
    
    if request.model == "unique3d":
        background_tasks.add_task(run_unique3d_generation, task_id, request.image_url, request.hq)
    elif request.model == "hunyuan_v2":
        background_tasks.add_task(run_hunyuanv2_generation, task_id, request.image_url, request.hq)
    else:
        background_tasks.add_task(run_instantmesh_generation, task_id, request.image_url, request.hq)
    
    return {"task_id": task_id, "status": "queued"}

@app.post("/generate/unique3d")
async def generate_unique3d(request: GenerateRequest, background_tasks: BackgroundTasks):
    request.model = "unique3d"
    return await generate(request, background_tasks)

@app.post("/generate/hunyuan3d-v2")
async def generate_hunyuan_v2(request: GenerateRequest, background_tasks: BackgroundTasks):
    request.model = "hunyuan_v2"
    return await generate(request, background_tasks)

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

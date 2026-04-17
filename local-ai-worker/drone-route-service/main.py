import os
import ssl
import multiprocessing as mp

# Фиксы для стабильности на macOS (M1/M2/M3/M4)
ssl._create_default_https_context = ssl._create_unverified_context
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1" # Ограничиваем потоки во избежание конфликтов OMP

try:
    # Метод 'spawn' критически важен для macOS во избежание SIGSEGV при использовании torch + colmap
    if mp.get_start_method(allow_none=True) != 'spawn':
        mp.set_start_method('spawn', force=True)
except (RuntimeError, Exception):
    pass

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import uuid
import json
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any

# Настройка логирования в файл для отладки
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("outputs/worker.log"),
        logging.StreamHandler()
    ]
)

from utils.colmap_runner import ColmapRunner
from utils.video2bev_pipeline import Video2BEVPipeline
from utils.satellite_matcher import SatelliteMatcher
from multiprocessing import Process, Manager
import shutil

app = FastAPI(title="Drone SOTA Route Service")

# CORS для NestJS и Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные объекты (будут инициализированы в main)
tasks = None
active_processes: Dict[str, Process] = {}
sat_matcher_global: Optional[SatelliteMatcher] = None

def get_tasks():
    global tasks
    if tasks is None:
        return {} 
    return tasks

def validate_video_quality(video_path: str) -> Dict[str, Any]:
    """
    Быстрая диагностика качества видео перед запуском тяжелого SfM.
    Извлекает 5 кадров и проверяет количество стабильных признаков.
    """
    import cv2
    import numpy as np
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames < 10:
        return {"valid": False, "error": "Video too short"}
        
    orb = cv2.ORB_create(nfeatures=1000)
    features_counts = []
    
    # Проверяем 5 равномерно распределенных кадров
    for i in range(5):
        frame_idx = int(total_frames * (i / 5))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret: continue
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        kpts = orb.detect(gray, None)
        features_counts.append(len(kpts))
        
    cap.release()
    
    avg_features = np.mean(features_counts) if features_counts else 0
    logging.info(f"Video diagnostic: avg features = {avg_features}")
    
    if avg_features < 150:
        return {
            "valid": False, 
            "error": "Video is too noisy or blurry (avg features < 150). SfM will likely fail.",
            "avg_features": avg_features
        }
        
    return {"valid": True, "avg_features": avg_features}

@app.post("/geolocate-image")
async def geolocate_image(
    image: UploadFile = File(...),
    bounds: str = Form("{}")
):
    """
    Находит GPS координаты скриншота на спутниковой карте.
    """
    logging.info(f"📍 [Python] Received geolocate request. Bounds: {bounds}")
    task_id = str(uuid.uuid4())
    work_dir = Path(f"outputs/geolocate_{task_id}")
    work_dir.mkdir(parents=True, exist_ok=True)
    
    img_path = work_dir / image.filename
    try:
        content = await image.read()
        with open(img_path, "wb") as f:
            f.write(content)
        logging.info(f"Saved request image to {img_path} ({len(content)} bytes)")
    except Exception as e:
        logging.error(f"Failed to save request image: {e}")
        return {"status": "failed", "error": f"IO Error: {str(e)}"}
        
    try:
        poly = json.loads(bounds)
        
        # Используем глобальный матчер, чтобы не грузить веса каждый раз
        global sat_matcher_global
        if sat_matcher_global is None:
            logging.info("Initializing global SatelliteMatcher (first run)...")
            sat_matcher_global = SatelliteMatcher()
        
        # Запускаем иерархический поиск (Scan Pass -> Focus Pass)
        result = sat_matcher_global.hierarchical_geolocate(str(img_path), poly, str(work_dir))
        
        if result["status"] == "failed":
            return {"status": "failed", "error": result["error"]}
            
        logging.info(f"Geolocation success: {result['lat']}, {result['lng']} (Conf: {result['confidence']})")
        
        return {
            "status": "success",
            "lat": result["lat"],
            "lng": result["lng"],
            "confidence": result["confidence"],
            "task_id": task_id
        }
    except Exception as e:
        logging.exception(f"Critical error in geolocate_image: {str(e)}")
        if work_dir.exists():
            try: shutil.rmtree(work_dir)
            except: pass
        return {"status": "failed", "error": f"Internal Error: {str(e)}"}
        return {"status": "failed", "error": f"Internal Error: {str(e)}"}

@app.post("/process-drone-video")
async def process_drone_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    images: List[UploadFile] = File([]),
    polygon: str = Form("{}"),
    hints: str = Form("")
):
    print(f"🚀 [Python] Received mapping request for video: {video.filename}")
    logging.info(f"Received mapping request for video: {video.filename}")
    task_id = str(uuid.uuid4())
    
    # Инициализируем задачу в общем словаре
    tasks[task_id] = {"status": "pending", "progress": 0, "current_action": "Waiting for worker..."}
    
    # Создаем рабочую директорию
    work_dir = Path(f"outputs/task_{task_id}")
    work_dir.mkdir(parents=True, exist_ok=True)
    
    video_path = work_dir / video.filename
    with open(video_path, "wb") as f:
        f.write(await video.read())
        
    # Запускаем тяжелую обработку в отдельном процессе
    p = Process(target=run_pipeline_sync, args=(task_id, str(video_path), polygon, hints, tasks))
    p.start()
    active_processes[task_id] = p
    
    return {"task_id": task_id, "status": "accepted"}

@app.get("/task-result/{task_id}")
async def get_task_result(task_id: str):
    task = tasks.get(task_id)
    if not task or "result" not in task:
        return JSONResponse(status_code=404, content={"message": "Result not found"})
    return task["result"]

@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    # Если процесс завершился, убираем его из активных
    if task_id in active_processes and not active_processes[task_id].is_alive():
        del active_processes[task_id]
        
    return tasks.get(task_id, {"status": "not_found"})

@app.post("/stop/{task_id}")
async def stop_task(task_id: str):
    if task_id in active_processes:
        p = active_processes[task_id]
        if p.is_alive():
            print(f"🛑 [Python] Terminating task {task_id}")
            p.terminate()
            p.join()
            
            # Очистка
            task_info = tasks.get(task_id, {})
            tasks[task_id] = {
                "status": "failed", 
                "progress": task_info.get("progress", 0),
                "error": "Cancelled by user",
                "current_action": "🛑 Operation stopped"
            }
            
            # Попытка очистить директорию
            work_dir = Path(f"outputs/task_{task_id}")
            if work_dir.exists():
                try:
                    shutil.rmtree(work_dir)
                    print(f"🧹 Cleaned up workspace for cancelled task {task_id}")
                except Exception as e:
                    print(f"⚠️ Cleanup error for task {task_id}: {e}")

        del active_processes[task_id]
        return {"status": "stopped"}
    
    return {"status": "not_running"}

def run_pipeline_sync(task_id: str, video_path: str, polygon_json: str, hints: str, shared_tasks: Any):
    # Обертка для запуска в отдельном процессе
    import asyncio
    try:
        # Для простоты делаем синхронную версию
        # (в отдельном процессе нам не важен event loop приложения)
        def update_task_progress(progress: int, action: str):
            task_info = shared_tasks.get(task_id, {})
            task_info.update({"progress": progress, "current_action": action})
            shared_tasks[task_id] = task_info

        update_task_progress(5, "Analyzing video quality...")
        diagnostic = validate_video_quality(video_path)
        if not diagnostic["valid"]:
            logging.warning(f"Rejecting video: {diagnostic['error']}")
            task_data = shared_tasks[task_id]
            task_data.update({
                "status": "failed", 
                "progress": 100,
                "error": diagnostic["error"],
                "text_analysis": f"Диагностика: {diagnostic['error']}. Пожалуйста, используйте видео более высокого качества."
            })
            shared_tasks[task_id] = task_data
            return

        # 1. SfM (COLMAP)
        update_task_progress(10, "Extracting keyframes from video...")
        
        runner = ColmapRunner(os.path.join(work_dir, "colmap"))
        
        # Используем глобальный матчер
        global sat_matcher_global
        if sat_matcher_global is None:
            sat_matcher_global = SatelliteMatcher()
        
        try:
            # Парсим hints, если это JSON, иначе считаем пустым конфигом
            hints_config = {}
            if hints and hints.strip().startswith('{'):
                try:
                    hints_config = json.loads(hints)
                except:
                    pass
            
            # Используем настройку Crop OSD или по умолчанию True
            crop_osd = hints_config.get('crop_osd', True)
            runner.extract_frames(video_path, crop_osd=crop_osd)
            
            update_task_progress(25, "Analyzing visual features (SfM)...")
            
            model_path = runner.run_reconstruction()
            
            update_task_progress(60, "Generating diagnostic report...")
            # Собираем диагностику для ИИ отчета
            summary = runner.get_reconstruction_summary(model_path)
            
            # Вложенный блок для извлечения поз и обработки ошибок/фоллбеков
            try:
                relative_poses = runner.get_relative_poses(model_path)
                
                # Попытка реальной привязки к спутнику
                update_task_progress(75, "LightGlue: High-fidelity Satellite Matching...")
                
                poly = json.loads(polygon_json)
                sat_map_path = os.path.join(work_dir, "satellite_ref.jpg")
                sat_matcher_global.download_satellite_base(poly, sat_map_path)
                
                update_task_progress(85, "Optimizing trajectory in WGS84...")
                # Пытаемся привязать траекторию
                trajectory = sat_matcher_global.align_trajectory(
                    relative_poses, poly, str(runner.images_path), sat_map_path
                )
                
                analysis_text = f"Анализ завершен. Качество реконструкции: {summary['quality_score']}%."
                if summary['difficulties']:
                    analysis_text += " Замечены сложности: " + "; ".join(summary['difficulties'])
                
                if trajectory:
                    analysis_text += " Траектория успешно привязана к спутниковой карте с высокой точностью."
                else:
                    logging.warning("Satellite alignment failed, using bounds fallback.")
                    analysis_text += " Внимание: Прямая привязка к ориентирам не удалась (мало совпадений). Использована аппроксимация по границам зоны."
                    # Фоллбек на интерполяцию
                    clat = (poly['north'] + poly['south']) / 2
                    clng = (poly['east'] + poly['west']) / 2
                    trajectory = []
                    for p in relative_poses:
                        lat = clat + (p['y'] * 0.0001)
                        lng = clng + (p['x'] * 0.0001)
                        trajectory.append([lat, lng])

                logging.info(f"Posing successful ({len(relative_poses)} points), cleaning up workspace for task {task_id}")
                runner.cleanup()
            except Exception as sfm_err:
                logging.error(f"SfM/Posing failed completely. Error: {sfm_err}")
                analysis_text = "Критическая ошибка: Не удалось построить маршрут. Видео слишком зашумлено или не содержит стабильных ориентиров."
                trajectory = []
        except Exception as e:
            logging.error(f"Core SfM error: {str(e)}")
            raise e
        # 2. BEV
        task_data = shared_tasks[task_id]
        task_data.update({"progress": 65, "current_action": "Generating Top-Down view (BEV)..."})
        shared_tasks[task_id] = task_data
        
        bev_gen = Video2BEVPipeline()
        
        # Формат, который ожидает фронтенд
        result_data = {
            "trajectory": trajectory,
            "geo_calibrated": True,
            "text_analysis": analysis_text
        }
        
        task_data = shared_tasks[task_id]
        task_data.update({
            "status": "success", 
            "progress": 100, 
            "current_action": "Task complete!", 
            "result": result_data,
            "model_url": f"http://localhost:8001/task-result/{task_id}"
        })
        shared_tasks[task_id] = task_data
        
    except Exception as e:
        logging.error(f"Pipeline error: {str(e)}")
        task_data = shared_tasks[task_id]
        task_data.update({"status": "failed", "error": str(e)})
        shared_tasks[task_id] = task_data

if __name__ == "__main__":
    # На macOS это ОБЯЗАТЕЛЬНО для работы multiprocessing
    import multiprocessing
    multiprocessing.freeze_support()
    
    # Инициализируем общую память в главном процессе
    m = Manager()
    tasks = m.dict()
    
    print("🪄 Drone Route Service started with shared memory support")
    uvicorn.run(app, host="0.0.0.0", port=8001)

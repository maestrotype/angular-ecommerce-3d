import os
import subprocess
import shutil
import cv2
import logging
import pycolmap
from pathlib import Path

class ColmapRunner:
    """
    Автоматизация COLMAP для получения относительных поз камеры из видео БПЛА.
    Automates COLMAP to get relative camera poses from UAV video.
    """
    def __init__(self, workspace_path: str):
        this_dir = Path(workspace_path)
        this_dir.mkdir(parents=True, exist_ok=True)
        self.workspace = this_dir
        self.images_path = this_dir / "images"
        self.database_path = this_dir / "database.db"
        self.sparse_path = this_dir / "sparse"
        
        self.images_path.mkdir(exist_ok=True)
        self.sparse_path.mkdir(exist_ok=True)

    def extract_frames(self, video_path: str, fps: float = 5.0, max_total_frames: int = 300, crop_osd: bool = False):
        """
        Извлечение кадров из видео для SfM.
        crop_osd: если True, обрезает 20% по краям, где обычно телеметрия.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Failed to open video: {video_path}")
            
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        video_frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        interval = max(1, int(video_frame_count / max_total_frames))
        
        count = 0
        saved_count = 0
        while True:
            ret, frame = cap.read()
            if not ret: break
            if count % interval == 0:
                # Обрезка OSD телеметрии (улучшает поиск фич)
                if crop_osd:
                    h, w = frame.shape[:2]
                    frame = frame[int(h*0.15):int(h*0.85), int(w*0.15):int(w*0.85)]
                
                frame_name = f"frame_{saved_count:05d}.jpg"
                cv2.imwrite(str(self.images_path / frame_name), frame)
                saved_count += 1
            count += 1
            if saved_count >= max_total_frames: break
                
        cap.release()
        logging.info(f"Saved {saved_count} frames (OSD crop: {crop_osd})")
        return saved_count

    def run_reconstruction(self):
        """
        Запуск полного пайплайна COLMAP: Feature extraction -> Matching -> Reconstruction.
        Runs full COLMAP pipeline.
        """
        logging.info("Starting COLMAP reconstruction...")
        
        # 1. Feature extraction
        # Используем OPENCV или SIFT в зависимости от доступности
        pycolmap.extract_features(self.database_path, self.images_path)
        
        # 2. Sequential matching (лучше всего подходит для видео)
        pycolmap.match_sequential(self.database_path)
        
        # 3. Mapper (оптимизация под сложные "плоские" ландшафты - поля/леса)
        options = pycolmap.IncrementalPipelineOptions()
        options.min_model_size = 3 
        
        # СТРАТЕГИЯ "ПУЛЕНЕПРОБИВАЕМОСТЬ"
        # 1. Фиксируем фокус (у дронов он не меняется), это стабилизирует расчет
        # В v4.0 это настраивается через несколько флагов:
        options.ba_refine_focal_length = False
        options.ba_refine_extra_params = False
        options.mapper.abs_pose_refine_focal_length = False
        options.mapper.abs_pose_refine_extra_params = False
        
        # 2. Еще сильнее расслабляем допуски для полей
        options.mapper.abs_pose_max_error = 20.0
        options.mapper.init_max_error = 20.0
        options.mapper.filter_max_reproj_error = 15.0
        
        # Увеличиваем параллакс и стабильность
        options.ba_global_frames_ratio = 5.0 # Глобальный пересчет РЕДКО
        options.ba_global_points_ratio = 5.0
        
        options.mapper.init_min_num_inliers = 30 
        options.mapper.abs_pose_min_num_inliers = 15
        
        options.ba_local_max_num_iterations = 20
        options.ba_global_max_num_iterations = 30
        
        maps = pycolmap.incremental_mapping(
            self.database_path, 
            self.images_path, 
            self.sparse_path,
            options=options
        )
        
        if not maps:
            raise Exception("SfM failed: Could not reconstruct any sparse model.")
        
        # Возвращаем путь к лучшей реконструкции (обычно 0)
        return self.sparse_path / "0"

    def get_reconstruction_summary(self, model_path: Path) -> Dict:
        """Анализ качества реконструкции для AI-отчета."""
        try:
            model = pycolmap.Reconstruction(model_path)
            num_reg_images = model.num_reg_images()
            num_points3D = model.num_points3D()
            mean_reproj_error = model.compute_mean_reprojection_error()
            
            summary = {
                "registered_images": num_reg_images,
                "points_3d": num_points3D,
                "mean_reproj_error": round(mean_reproj_error, 3),
                "quality_score": round(max(0, 100 - mean_reproj_error * 20), 1),
                "status": "success" if num_reg_images > 10 else "partial"
            }
            
            # Логика анализа сложностей
            difficulties = []
            if mean_reproj_error > 6.0:
                difficulties.append("Высокая погрешность (возможно размытие или искажения линзы)")
            if num_points3D / num_reg_images < 50:
                difficulties.append("Мало уникальных признаков (поле/лес без четких ориентиров)")
            
            summary["difficulties"] = difficulties
            return summary
        except Exception as e:
            return {"status": "error", "message": str(e), "difficulties": ["Критический сбой COLMAP"]}

    def get_relative_poses(self, model_path: Path):
        """Экспорт относительных траекторий (X, Y, Z) из COLMAP модели."""
        model = pycolmap.Reconstruction(model_path)
        poses = []
        # Сортируем по имени файла (кадры 1, 2, 3...)
        images = sorted(model.images.values(), key=lambda x: x.name)
        
        for img in images:
            # Получаем центр камеры в мировых координатах модели
            tvec = img.projection_center()
            poses.append({
                "name": img.name,
                "x": float(tvec[0]),
                "y": float(tvec[1]),
                "z": float(tvec[2]),
                # В pycolmap 4.0 cam_from_world - это метод, а не атрибут
                "q": (img.cam_from_world().rotation.quat if callable(img.cam_from_world) else 
                     (img.cam_from_world.rotation.quat if hasattr(img, 'cam_from_world') else img.qvec)).tolist()
            })
        return poses

    def cleanup(self):
        """Удаление временных файлов после обработки."""
        try:
            shutil.rmtree(self.workspace)
        except Exception as e:
            logging.error(f"Cleanup error: {e}")

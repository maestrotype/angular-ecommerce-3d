import cv2
import numpy as np
import requests
import logging
import os
import io
from pathlib import Path
from typing import Dict, List, Tuple, Any
import torch
import mercantile
from PIL import Image
from lightglue import LightGlue, SuperPoint, DISK, ALIKED
from lightglue.utils import load_image, rbd

class SatelliteMatcher:
    """
    Advanced Satellite-to-Drone Matching Engine.
    Matches drone video frames to satellite base map using LightGlue (SOTA).
    """
    def __init__(self, device: str = "cpu"):
        # Форсируем CPU для стабильности в мультипроцессинге на macOS
        self.device = torch.device("cpu")
            
        # Загружаем SOTA матчер ( SuperPoint + LightGlue )
        # Уменьшаем кол-во точек до 1024 для скорости на CPU
        self.extractor = SuperPoint(max_num_keypoints=1024).eval().to(self.device)
        self.matcher = LightGlue(features='superpoint').eval().to(self.device)
        logging.info(f"SatelliteMatcher initialized on {self.device} (Safe Mode)")

    def download_satellite_base(self, bounds: Dict, output_path: str, zoom: int = 17) -> str:
        """
        Скачивает и сшивает спутниковые плитки ESRI для всей области.
        Args:
            bounds: {'north', 'south', 'east', 'west'}
            output_path: путь для сохранения итогового изображения
        """
        logging.info(f"Stitching satellite imagery for bounds: {bounds} at zoom {zoom}")
        
        # Получаем список тайлов
        tiles = list(mercantile.tiles(bounds['west'], bounds['south'], bounds['east'], bounds['north'], zoom))
        
        if not tiles:
            return None
            
        # Определяем границы сетки тайлов
        min_x = min(t.x for t in tiles)
        max_x = max(t.x for t in tiles)
        min_y = min(t.y for t in tiles)
        max_y = max(t.y for t in tiles)
        
        grid_w = (max_x - min_x + 1) * 256
        grid_h = (max_y - min_y + 1) * 256
        
        # Создаем большое полотно
        full_image = Image.new('RGB', (grid_w, grid_h))
        
        # ESRI World Imagery URL
        base_url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile"
        
        for t in tiles:
            tile_url = f"{base_url}/{t.z}/{t.y}/{t.x}"
            try:
                response = requests.get(tile_url, timeout=10)
                if response.status_code == 200:
                    tile_img = Image.open(io.BytesIO(response.content))
                    px = (t.x - min_x) * 256
                    py = (t.y - min_y) * 256
                    full_image.paste(tile_img, (px, py))
            except Exception as e:
                logging.error(f"Failed to fetch tile {t}: {e}")
                
        full_image.save(output_path)
        
        # Сохраняем метаданные для обратной конвертации в GPS
        # Левый верхний угол (min_x, min_y) и правый нижний
        ul = mercantile.ul(min_x, min_y, zoom)
        lr = mercantile.ul(max_x + 1, max_y + 1, zoom)
        
        meta = {
            "top": ul.lat,
            "left": ul.lng,
            "bottom": lr.lat,
            "right": lr.lng,
            "zoom": zoom,
            "width": grid_w,
            "height": grid_h
        }
        
        import json
        with open(output_path + ".json", "w") as f:
            json.dump(meta, f)
            
        return output_path

    def match_frame_to_sat(self, drone_frame_path: str, satellite_map_path: str) -> Tuple[float, float, float]:
        """
        Находит экранные координаты кадра дрона на спутниковой карте.
        Returns: (x_px, y_px, confidence)
        """
        image0 = load_image(drone_frame_path).to(self.device)
        image1 = load_image(satellite_map_path).to(self.device)
        
        with torch.no_grad():
            feats0 = self.extractor.extract(image0)
            feats1 = self.extractor.extract(image1)
            matches01 = self.matcher({'image0': feats0, 'image1': feats1})
            
        feats0, feats1, matches01 = [rbd(x) for x in [feats0, feats1, matches01]]
        matches = matches01['matches']
        
        if len(matches) < 8:
            return None
            
        kpts0, kpts1 = feats0['keypoints'], feats1['keypoints']
        mkpts0 = kpts0[matches[..., 0]].cpu().numpy()
        mkpts1 = kpts1[matches[..., 1]].cpu().numpy()
        
        H, inliers = cv2.findHomography(mkpts0, mkpts1, cv2.RANSAC, 10.0)
        if H is None or np.sum(inliers) < 6:
            return None
            
        # Центр кадра (drone view center)
        h, w = image0.shape[1:]
        center = np.array([[w/2, h/2]], dtype='float32').reshape(-1, 1, 2)
        dst_center = cv2.perspectiveTransform(center, H)
        
        confidence = float(np.sum(inliers) / len(matches))
        return float(dst_center[0,0,0]), float(dst_center[0,0,1]), confidence

    def align_trajectory(self, relative_poses: List, map_bounds: Dict, colmap_images_dir: str, satellite_path: str) -> List:
        """
        Связывает относительные позы COLMAP с реальными GPS координатами через Satellite Matching.
        """
        import json
        with open(satellite_path + ".json", "r") as f:
            meta = json.load(f)
            
        # 1. Берем 5 опорных кадров (начало, четверть, середина, три четверти, конец)
        indices = np.linspace(0, len(relative_poses) - 1, 5, dtype=int)
        
        sfm_coords = []
        gps_coords = []
        
        for idx in indices:
            pose = relative_poses[idx]
            frame_name = pose['name']
            frame_path = os.path.join(colmap_images_dir, frame_name)
            
            match = self.match_frame_to_sat(frame_path, satellite_path)
            if match:
                px_x, px_y, conf = match
                # Конвертируем пиксели карты в GPS
                lat = meta['top'] - (px_y / meta['height']) * (meta['top'] - meta['bottom'])
                lng = meta['left'] + (px_x / meta['width']) * (meta['right'] - meta['left'])
                
                sfm_coords.append([pose['x'], pose['y']])
                gps_coords.append([lat, lng])
                logging.info(f"Anchor match for {frame_name}: {lat:.6f}, {lng:.6f} (conf: {conf:.2f})")

        if len(sfm_coords) < 2:
            logging.warning("Not enough satellite anchor points. Falling back to simple bounds alignment.")
            return None # Фоллбек на линейную растяжку
            
        # 2. Вычисляем аффинное преобразование между SfM (x,y) и GPS (lat,lng)
        sfm_pts = np.array(sfm_coords, dtype=np.float32)
        gps_pts = np.array(gps_coords, dtype=np.float32)
        
        # EstimateAffine2D находит Scale, Rotation, Translation
        M, inliers = cv2.estimateAffine2D(sfm_pts, gps_pts)
        
        if M is None:
            return None
            
        # 3. Применяем трансформацию ко всей траектории
        final_trajectory = []
        for p in relative_poses:
            pt = np.array([[p['x'], p['y']]], dtype=np.float32).reshape(-1, 1, 2)
            transformed = cv2.transform(pt, M)
            final_trajectory.append([float(transformed[0,0,0]), float(transformed[0,0,1])])
            
        return final_trajectory

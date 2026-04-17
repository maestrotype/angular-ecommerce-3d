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
import json
import shutil
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

    def download_satellite_base(self, bounds: Dict, output_path: str, target_zoom: int = 17) -> str:
        """
        Скачивает и сшивает спутниковые плитки ESRI для всей области.
        Args:
            bounds: {'north', 'south', 'east', 'west'}
            output_path: путь для сохранения итогового изображения
        """
        import concurrent.futures
        
        # 1. Рассчитываем оптимальный зум. Минимум 15 для сохранения ориентиров.
        zoom = target_zoom
        tiles = list(mercantile.tiles(bounds['west'], bounds['south'], bounds['east'], bounds['north'], zoom))
        
        while len(tiles) > 144 and zoom > 15:
            zoom -= 1
            tiles = list(mercantile.tiles(bounds['west'], bounds['south'], bounds['east'], bounds['north'], zoom))
            
        if len(tiles) > 144:
            logging.error(f"Area too large: {len(tiles)} tiles even at zoom 15")
            return "ERROR_TOO_LARGE"

        logging.info(f"📍 Area processing: {len(tiles)} tiles at Zoom {zoom}")
        
        if not tiles:
            logging.error("No tiles found for given bounds")
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
        base_url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile"
        
        # 2. Многопоточная загрузка тайлов
        def fetch_tile(t):
            tile_url = f"{base_url}/{t.z}/{t.y}/{t.x}"
            try:
                response = requests.get(tile_url, timeout=15)
                if response.status_code == 200:
                    return t, Image.open(io.BytesIO(response.content))
            except Exception as e:
                logging.error(f"Error fetching tile {t}: {e}")
            return t, None

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_tile = {executor.submit(fetch_tile, t): t for t in tiles}
            for future in concurrent.futures.as_completed(future_to_tile):
                t, tile_img = future.result()
                if tile_img:
                    px = (t.x - min_x) * 256
                    py = (t.y - min_y) * 256
                    full_image.paste(tile_img, (px, py))

        full_image.save(output_path, quality=85)
        
        # 3. Сохраняем метаданные для обратной конвертации в GPS
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

    def _preprocess_image(self, img_tensor):
        """Улучшает контрастность изображения (CLAHE) перед извлечением признаков."""
        # Convert tensor (C, H, W) to numpy (H, W)
        try:
            img_np = (img_tensor[0].cpu().numpy() * 255).astype(np.uint8)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            img_enhanced = clahe.apply(img_np)
            return torch.from_numpy(img_enhanced.astype(np.float32) / 255.0).unsqueeze(0).to(self.device)
        except Exception as e:
            logging.error(f"Preprocessing failed: {e}")
            return img_tensor

    def match_frame_to_sat(self, drone_frame_path: str, satellite_map_path: str, is_scan_pass: bool = False) -> Tuple[float, float, float]:
        """
        Находит экранные координаты кадра дрона на спутниковой карте.
        """
        from lightglue.utils import load_image
        
        try:
            image0_raw = load_image(drone_frame_path).to(self.device)
            image1_raw = load_image(satellite_map_path).to(self.device)
        except Exception as e:
            logging.error(f"Failed to load images for matching: {e}")
            return None
        
        # Улучшение контрастности
        image0 = self._preprocess_image(image0_raw)
        image1 = self._preprocess_image(image1_raw)
        
        best_match = None
        max_inliers = 0
        
        # Для сканирования (Scan Pass) теперь тоже используем все углы, 
        # так как дрон может лететь куда угодно, и это критично для успеха.
        angles = [0, 90, 180, 270]
        
        for angle in angles:
            # Поворачиваем изображение дрона
            if angle == 0:
                img_rot = image0
            elif angle == 90:
                img_rot = torch.rot90(image0, 1, [1, 2])
            elif angle == 180:
                img_rot = torch.rot90(image0, 2, [1, 2])
            elif angle == 270:
                img_rot = torch.rot90(image0, 3, [1, 2])
                
            with torch.no_grad():
                feats0 = self.extractor.extract(img_rot)
                feats1 = self.extractor.extract(image1)
                matches01 = self.matcher({'image0': feats0, 'image1': feats1})
                
            feats0, feats1, matches01 = [rbd(x) for x in [feats0, feats1, matches01]]
            matches = matches01['matches']
            
            # Для пролета достаточно 4-5 точек, чтобы зацепиться за ориентир.
            min_matches = 4 if is_scan_pass else 8
            if len(matches) < min_matches:
                continue
                
            kpts0, kpts1 = feats0['keypoints'], feats1['keypoints']
            mkpts0 = kpts0[matches[..., 0]].cpu().numpy()
            mkpts1 = kpts1[matches[..., 1]].cpu().numpy()
            
            H, inliers = cv2.findHomography(mkpts0, mkpts1, cv2.RANSAC, 5.0)
            if H is None:
                continue
                
            num_inliers = np.sum(inliers)
            # ПОВЫШЕННЫЙ ПОРОГ: минимум 12 инлайеров и 12% уверенности для кандидатов
            min_inliers = 8 if is_scan_pass else 15
            min_conf = 0.08 if is_scan_pass else 0.15
            
            confidence = float(num_inliers / len(matches))
            
            if num_inliers >= min_inliers and confidence >= min_conf:
                if num_inliers > max_inliers:
                    max_inliers = num_inliers
                    
                    # Центр кадра
                    h, w = img_rot.shape[1:]
                    center = np.array([[w/2, h/2]], dtype='float32').reshape(-1, 1, 2)
                    dst_center = cv2.perspectiveTransform(center, H)
                    
                    best_match = (float(dst_center[0,0,0]), float(dst_center[0,0,1]), confidence)
                
                # Если нашли очень уверенное совпадение (>25 инлайеров), дальше не вращаем
                if num_inliers > 25:
                    break
                
        return best_match

    def hierarchical_geolocate(self, img_path: str, bounds: Dict, work_dir: str) -> Dict:
        """
        Двухэтапный поиск: Scan Pass (Zoom 15) -> Focus Pass (Zoom 17)
        """
        logging.info("🚀 Starting Hierarchical Deep Search...")
        
        # STAGE 1: SCAN PASS (Адаптивный зум 16 или 15)
        scan_map_path = os.path.join(work_dir, "scan_map.jpg")
        
        # Пробуем Zoom 16 для лучшей детализации, если область позволяет
        scan_res = self.download_satellite_base(bounds, scan_map_path, target_zoom=16)
        if scan_res == "ERROR_TOO_LARGE":
            # Если 16 слишком много, откатываемся на 15
            scan_res = self.download_satellite_base(bounds, scan_map_path, target_zoom=15)
        
        if scan_res == "ERROR_TOO_LARGE":
            return {"status": "failed", "error": "Search area is absolutely massive (>500km2). Try a smaller zone."}
        if not scan_res:
            return {"status": "failed", "error": "Could not download scan map."}
            
        match1 = self.match_frame_to_sat(img_path, scan_map_path, is_scan_pass=True)
        
        if not match1:
            logging.warning("Scan Pass failed to find candidate region.")
            return {"status": "failed", "error": "No highly-confident matches found during initial scan. The search area might be too uniform or landmarks are too small."}
            
        px_x, px_y, conf1 = match1
        
        # Конвертируем пиксели скана в примерный GPS
        with open(scan_map_path + ".json", "r") as f:
            meta1 = json.load(f)
        
        est_lat = meta1['top'] - (px_y / meta1['height']) * (meta1['top'] - meta1['bottom'])
        est_lng = meta1['left'] + (px_x / meta1['width']) * (meta1['right'] - meta1['left'])
        
        # ПРОВЕРКА ГРАНИЦ: если точка улетела за пределы выделенной зоны - это ложное срабатывание
        buffer = 0.01 # 1км буфер на всякий случай
        if not (bounds['south'] - buffer <= est_lat <= bounds['north'] + buffer and 
                bounds['west'] - buffer <= est_lng <= bounds['east'] + buffer):
            logging.error(f"❌ Scan Pass result {est_lat}, {est_lng} is OUTSIDE bounds {bounds}")
            return {"status": "failed", "error": "AI identified a match but it was outside your selected area (False Positive). Try a smaller or more distinct area."}

        logging.info(f"✅ Scan Pass identified candidate region at {est_lat}, {est_lng} (conf: {conf1:.2f})")
        
        # STAGE 2: FOCUS PASS (Zoom 17 - максимальная точность в найденном квадрате 1x1 км)
        focus_bounds = {
            "north": est_lat + 0.005,
            "south": est_lat - 0.005,
            "east": est_lng + 0.005,
            "west": est_lng - 0.005
        }
        
        focus_map_path = os.path.join(work_dir, "focus_map.jpg")
        # Тут мы форсируем детализированный зум
        self.download_satellite_base(focus_bounds, focus_map_path, target_zoom=17)
        
        match2 = self.match_frame_to_sat(img_path, focus_map_path, is_scan_pass=False)
        
        if not match2:
            logging.warning("Focus Pass failed. Returning Stage 1 results as fallback.")
            return {"status": "success", "lat": est_lat, "lng": est_lng, "confidence": conf1 * 0.7}
            
        px2_x, px2_y, conf2 = match2
        with open(focus_map_path + ".json", "r") as f:
            meta2 = json.load(f)
            
        final_lat = meta2['top'] - (px2_y / meta2['height']) * (meta2['top'] - meta2['bottom'])
        final_lng = meta2['left'] + (px2_x / meta2['width']) * (meta2['right'] - meta2['left'])
        
        logging.info(f"🎯 Focus Pass confirmed location: {final_lat}, {final_lng} (conf: {conf2:.2f})")
        
        return {
            "status": "success",
            "lat": final_lat,
            "lng": final_lng,
            "confidence": conf2
        }

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

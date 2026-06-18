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
        
        # DISK — лучше работает на текстурах без чётких углов (поля, трава)
        self.extractor_disk = DISK(max_num_keypoints=1024).eval().to(self.device)
        self.matcher_disk = LightGlue(features='disk').eval().to(self.device)
        
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

    def _rectify_oblique(self, image_path: str) -> str:
        """
        Определяет линию горизонта и выравнивает перспективу наклонного снимка
        для получения ортогонального вида (pseudo-nadir).
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                logging.warning(f"Could not load image {image_path} for perspective correction.")
                return image_path
            
            h, w = img.shape[:2]
            
            # Проверяем верхние 40% кадра на наличие линии горизонта
            top_part = img[0:int(h * 0.4), :]
            gray = cv2.cvtColor(top_part, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Ищем достаточно длинные горизонтальные линии
            lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=w * 0.3, maxLineGap=20)
            
            is_oblique = False
            if lines is not None:
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180.0 / np.pi)
                    if angle < 15 or angle > 165:
                        is_oblique = True
                        break
            
            if is_oblique:
                logging.info("Detected oblique angle screenshot. Applying perspective rectification...")
                # Обрезаем верхние 35% изображения (небо + горизонт)
                crop_y = int(h * 0.35)
                cropped = img[crop_y:h, :]
                ch, cw = cropped.shape[:2]
                
                # Трапециевидное преобразование к прямоугольнику
                src_pts = np.float32([[cw * 0.15, 0], [cw * 0.85, 0], [cw, ch], [0, ch]])
                dst_pts = np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]])
                
                M = cv2.getPerspectiveTransform(src_pts, dst_pts)
                rectified = cv2.warpPerspective(cropped, M, (cw, ch))
                
                # Сохраняем во временный файл в подкаталог temp
                temp_dir = os.path.join(os.path.dirname(image_path), "temp")
                os.makedirs(temp_dir, exist_ok=True)
                rectified_path = os.path.join(temp_dir, f"rectified_{os.path.basename(image_path)}")
                cv2.imwrite(rectified_path, rectified)
                return rectified_path
            
            return image_path
        except Exception as e:
            logging.error(f"Oblique rectification failed: {e}")
            return image_path

    def _clean_drone_image(self, image_path: str) -> str:
        """
        Маскирует OSD (телеметрию) и убирает полупрозрачные водяные знаки
        методом морфологического top-hat и inpainting.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                logging.warning(f"Could not load image {image_path} for watermark removal.")
                return image_path
                
            h, w = img.shape[:2]
            
            # 1. Маскируем OSD зоны черным
            img[0:int(h * 0.12), :] = 0  # верх
            img[int(h * 0.9):h, :] = 0   # низ
            img[:, 0:int(w * 0.05)] = 0  # лево
            img[:, int(w * 0.95):w] = 0  # право
            
            # 2. Убираем водяные знаки
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l_channel, a, b = cv2.split(lab)
            
            # Ищем высокочастотные контрастные элементы (текст водяного знака)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 40))
            tophat = cv2.morphologyEx(l_channel, cv2.MORPH_TOPHAT, kernel)
            
            # Бинаризуем маску
            _, mask = cv2.threshold(tophat, 15, 255, cv2.THRESH_BINARY)
            
            # Исключаем OSD зоны из инпейнтинга
            mask[0:int(h * 0.12), :] = 0
            mask[int(h * 0.9):h, :] = 0
            mask[:, 0:int(w * 0.05)] = 0
            mask[:, int(w * 0.95):w] = 0
            
            # Закрашиваем водяной знак
            cleaned = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
            
            # Сохраняем результат
            temp_dir = os.path.join(os.path.dirname(image_path), "temp")
            os.makedirs(temp_dir, exist_ok=True)
            cleaned_path = os.path.join(temp_dir, f"cleaned_{os.path.basename(image_path)}")
            cv2.imwrite(cleaned_path, cleaned)
            return cleaned_path
        except Exception as e:
            logging.error(f"Watermark and OSD removal failed: {e}")
            return image_path

    def _preprocess_image(self, img_tensor):
        """CLAHE + Unsharp Mask для усиления краёв на однообразных сценах."""
        try:
            img_np = (img_tensor[0].cpu().numpy() * 255).astype(np.uint8)
            # CLAHE с более высоким clipLimit для сельской местности
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            img_c = clahe.apply(img_np)
            # Unsharp mask — подчёркивает края (заборы, дороги, крыши)
            blurred = cv2.GaussianBlur(img_c, (0, 0), 2.5)
            img_sharp = cv2.addWeighted(img_c, 1.4, blurred, -0.4, 0)
            img_sharp = np.clip(img_sharp, 0, 255).astype(np.uint8)
            return torch.from_numpy(img_sharp.astype(np.float32) / 255.0).unsqueeze(0).to(self.device)
        except Exception as e:
            logging.error(f"Preprocessing failed: {e}")
            return img_tensor

    def match_frame_to_sat(self, drone_frame_path: str, satellite_map_path: str, is_scan_pass: bool = False) -> Tuple[float, float, float]:
        """
        Sliding-window: разбивает спутниковую карту на патчи с overlap 50%
        и ищет лучшее совпадение в каждом патче.
        Намного эффективнее чем матч по всей карте целиком.
        """
        from lightglue.utils import load_image
        import torchvision.transforms.functional as TF
        import PIL.Image as PILImage

        try:
            img_drone_raw = load_image(drone_frame_path).to(self.device)
            img_drone = self._preprocess_image(img_drone_raw)
        except Exception as e:
            logging.error(f"Failed to load drone frame for matching: {e}")
            return None

        try:
            sat_pil = PILImage.open(satellite_map_path).convert("RGB")
            sat_w, sat_h = sat_pil.size
        except Exception as e:
            logging.error(f"Failed to load satellite map for matching: {e}")
            return None

        # Размер патча зависит от разрешения карты
        patch_size = min(512, sat_w, sat_h)
        step = max(1, patch_size // 2)  # 50% overlap

        best_match = None
        max_score = 0
        angles = [0, 90, 180, 270]

        # Предварительно извлекаем фичи дрона для всех углов (один раз)
        drone_feats_by_angle = {}
        for angle in angles:
            if angle == 0:
                img_rot = img_drone
            elif angle == 90:
                img_rot = torch.rot90(img_drone, 1, [1, 2])
            elif angle == 180:
                img_rot = torch.rot90(img_drone, 2, [1, 2])
            else:
                img_rot = torch.rot90(img_drone, 3, [1, 2])
            with torch.no_grad():
                drone_feats_by_angle[angle] = self.extractor.extract(img_rot)

        y_coords = list(range(0, max(1, sat_h - patch_size), step))
        if not y_coords or y_coords[-1] + patch_size < sat_h:
            y_coords.append(max(0, sat_h - patch_size))
            
        x_coords = list(range(0, max(1, sat_w - patch_size), step))
        if not x_coords or x_coords[-1] + patch_size < sat_w:
            x_coords.append(max(0, sat_w - patch_size))

        for py in y_coords:
            for px in x_coords:
                # Вырезаем патч из спутниковой карты
                patch = sat_pil.crop((px, py,
                                       min(px + patch_size, sat_w),
                                       min(py + patch_size, sat_h)))

                # Конвертируем патч в grayscale тензор для LightGlue
                patch_gray = patch.convert("L")
                patch_tensor = TF.to_tensor(patch_gray).to(self.device)
                patch_proc = self._preprocess_image(patch_tensor)

                with torch.no_grad():
                    feats_patch = self.extractor.extract(patch_proc)

                # ОПТИМИЗАЦИЯ: если на патче мало ключевых точек (менее 15), пропускаем
                if feats_patch['keypoints'].shape[1] < 15:
                    continue

                for angle in angles:
                    feats_drone = drone_feats_by_angle[angle]
                    with torch.no_grad():
                        matches01 = self.matcher({'image0': feats_drone, 'image1': feats_patch})

                    f0, f1, m01 = [rbd(x) for x in [feats_drone, feats_patch, matches01]]
                    matches = m01['matches']

                    min_m = 4 if is_scan_pass else 5
                    if len(matches) < min_m:
                        continue

                    kpts0, kpts1 = f0['keypoints'], f1['keypoints']
                    mkpts0 = kpts0[matches[..., 0]].cpu().numpy()
                    mkpts1 = kpts1[matches[..., 1]].cpu().numpy()

                    if len(mkpts0) < 4:
                        continue

                    H, inliers = cv2.findHomography(mkpts0, mkpts1, cv2.RANSAC, 5.0)
                    if H is None:
                        continue

                    num_inliers = int(np.sum(inliers))
                    conf = float(num_inliers / max(len(matches), 1))

                    min_inl = 4 if is_scan_pass else 8
                    min_cf  = 0.04 if is_scan_pass else 0.10

                    if num_inliers >= min_inl and conf >= min_cf:
                        h_d, w_d = img_drone.shape[1:]
                        center = np.array([[w_d/2, h_d/2]], dtype='float32').reshape(-1,1,2)
                        dst = cv2.perspectiveTransform(center, H)
                        pt_x = float(dst[0,0,0])
                        pt_y = float(dst[0,0,1])
                        
                        # Проверяем, что спроецированный центр лежит внутри патча (с небольшим запасом)
                        if -50 <= pt_x <= patch_size + 50 and -50 <= pt_y <= patch_size + 50:
                            score = num_inliers * conf
                            if score > max_score:
                                max_score = score
                                abs_x = pt_x + px
                                abs_y = pt_y + py
                                best_match = (abs_x, abs_y, conf)
                                
                            # ОПТИМИЗАЦИЯ: Если нашли очень уверенное совпадение (>25 инлайеров и >25% уверенности),
                            # прерываем поиск досрочно.
                            if num_inliers >= 25 and conf >= 0.25:
                                logging.info(f"🎯 High-confidence match found early with {num_inliers} inliers ({int(conf*100)}% conf). Stopping search.")
                                return best_match

        return best_match

    def _compute_footprint(self, img_path: str, center_lat: float, center_lng: float, zoom: int) -> List:
        """
        Вычисляет 4 угловые GPS-координаты кадра дрона на основе размера изображения
        и GSD (Ground Sample Distance) при заданном зуме.
        Возвращает список [[lat,lng], [lat,lng], [lat,lng], [lat,lng]] (по часовой стрелке).
        """
        try:
            img = cv2.imread(img_path)
            if img is None:
                return []
            h_px, w_px = img.shape[:2]
            
            # GSD в метрах на пиксель для спутниковых тайлов 256px при данном зуме
            # GSD = (circumference_at_lat * tile_size_m) / (256 * 2^zoom)
            earth_circumference = 40075016.686
            lat_rad = center_lat * np.pi / 180
            gsd_m = (earth_circumference * np.cos(lat_rad)) / (256 * (2 ** zoom))
            
            # Реальные размеры кадра в метрах
            w_m = w_px * gsd_m
            h_m = h_px * gsd_m
            
            # Конвертируем в градусы (приближение на малых расстояниях)
            delta_lat = (h_m / 2) / 111320.0
            delta_lng = (w_m / 2) / (111320.0 * np.cos(lat_rad))
            
            corners = [
                [center_lat + delta_lat, center_lng - delta_lng],  # СЗ
                [center_lat + delta_lat, center_lng + delta_lng],  # СВ
                [center_lat - delta_lat, center_lng + delta_lng],  # ЮВ
                [center_lat - delta_lat, center_lng - delta_lng],  # ЮЗ
            ]
            return corners
        except Exception as e:
            logging.error(f"Footprint computation failed: {e}")
            return []

    def hierarchical_geolocate(self, img_path: str, bounds: Dict, work_dir: str) -> Dict:
        """
        Двухэтапный поиск: Scan Pass (Zoom 17/16/15) -> Focus Pass (Zoom 17)
        """
        logging.info("🚀 Starting Hierarchical Deep Search...")
        
        rectified_path = img_path
        cleaned_path = img_path
        try:
            # Предобработка снимка дрона (деоблик + очистка)
            rectified_path = self._rectify_oblique(img_path)
            cleaned_path = self._clean_drone_image(rectified_path)
            
            # STAGE 1: SCAN PASS (Адаптивный зум от 17 до 15)
            scan_map_path = os.path.join(work_dir, "scan_map.jpg")
            
            # Пробуем Zoom 17 для лучшей детализации, если область позволяет, авто-откат до 15
            scan_res = self.download_satellite_base(bounds, scan_map_path, target_zoom=17)
            
            if scan_res == "ERROR_TOO_LARGE":
                return {"status": "failed", "error": "Search area is absolutely massive (>500km2). Try a smaller zone."}
            if not scan_res:
                return {"status": "failed", "error": "Could not download scan map."}
                
            match1 = self.match_frame_to_sat(cleaned_path, scan_map_path, is_scan_pass=True)
            if not match1:
                logging.warning("SuperPoint failed in Scan Pass — retrying with DISK extractor...")
                _orig_ext, _orig_mat = self.extractor, self.matcher
                self.extractor, self.matcher = self.extractor_disk, self.matcher_disk
                match1 = self.match_frame_to_sat(cleaned_path, scan_map_path, is_scan_pass=True)
                self.extractor, self.matcher = _orig_ext, _orig_mat
                
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
            self.download_satellite_base(focus_bounds, focus_map_path, target_zoom=17)
            
            match2 = self.match_frame_to_sat(cleaned_path, focus_map_path, is_scan_pass=False)
            if not match2:
                logging.warning("SuperPoint failed in Focus Pass — retrying with DISK extractor...")
                _orig_ext, _orig_mat = self.extractor, self.matcher
                self.extractor, self.matcher = self.extractor_disk, self.matcher_disk
                match2 = self.match_frame_to_sat(cleaned_path, focus_map_path, is_scan_pass=False)
                self.extractor, self.matcher = _orig_ext, _orig_mat
                
            if not match2:
                logging.warning("Focus Pass failed. Returning Stage 1 results as fallback.")
                with open(scan_map_path + ".json", "r") as f:
                    meta_fb = json.load(f)
                footprint_fb = self._compute_footprint(img_path, est_lat, est_lng, meta_fb.get('zoom', 16))
                return {"status": "success", "lat": est_lat, "lng": est_lng, "confidence": conf1 * 0.7,
                        "footprint_corners": footprint_fb, "zoom": meta_fb.get('zoom', 16)}
                
            px2_x, px2_y, conf2 = match2
            with open(focus_map_path + ".json", "r") as f:
                meta2 = json.load(f)
                
            final_lat = meta2['top'] - (px2_y / meta2['height']) * (meta2['top'] - meta2['bottom'])
            final_lng = meta2['left'] + (px2_x / meta2['width']) * (meta2['right'] - meta2['left'])
            
            logging.info(f"🎯 Focus Pass confirmed location: {final_lat}, {final_lng} (conf: {conf2:.2f})")
            
            footprint = self._compute_footprint(cleaned_path, final_lat, final_lng, meta2.get('zoom', 17))
            
            return {
                "status": "success",
                "lat": final_lat,
                "lng": final_lng,
                "confidence": conf2,
                "footprint_corners": footprint,
                "zoom": meta2.get('zoom', 17)
            }
        finally:
            # Очистка временных файлов
            if rectified_path != img_path and os.path.exists(rectified_path):
                try: os.remove(rectified_path)
                except: pass
            if cleaned_path != img_path and cleaned_path != rectified_path and os.path.exists(cleaned_path):
                try: os.remove(cleaned_path)
                except: pass

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
            
            rect_frame = frame_path
            clean_frame = frame_path
            try:
                rect_frame = self._rectify_oblique(frame_path)
                clean_frame = self._clean_drone_image(rect_frame)
                match = self.match_frame_to_sat(clean_frame, satellite_path)
                if not match:
                    logging.warning(f"SuperPoint failed on frame {frame_name} — retrying with DISK...")
                    _orig_ext, _orig_mat = self.extractor, self.matcher
                    self.extractor, self.matcher = self.extractor_disk, self.matcher_disk
                    match = self.match_frame_to_sat(clean_frame, satellite_path)
                    self.extractor, self.matcher = _orig_ext, _orig_mat
            except Exception as e:
                logging.error(f"Error matching frame {frame_name}: {e}")
                match = None
            finally:
                if rect_frame != frame_path and os.path.exists(rect_frame):
                    try: os.remove(rect_frame)
                    except: pass
                if clean_frame != frame_path and clean_frame != rect_frame and os.path.exists(clean_frame):
                    try: os.remove(clean_frame)
                    except: pass
                    
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

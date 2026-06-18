import torch
import cv2
import numpy as np
import kornia.feature as kf
from torchvision import transforms
from PIL import Image

class FineMatcher:
    def __init__(self, device=None):
        if device is None:
            if torch.backends.mps.is_available():
                self.device = torch.device("mps")
            elif torch.cuda.is_available():
                self.device = torch.device("cuda")
            else:
                self.device = torch.device("cpu")
        else:
            self.device = torch.device(device)
            
        print(f"🎯 FineMatcher initialized on {self.device}")
        
        # Load LoFTR (outdoor weights are best for UAV/Satellite imagery)
        print("🔍 Loading LoFTR model...")
        self.matcher = kf.LoFTR(pretrained='outdoor').to(self.device)
        self.matcher.eval()
        
        # LoFTR expects grayscale images normalized to [0, 1]
        self.transform = transforms.Compose([
            transforms.Grayscale(),
            transforms.ToTensor()
        ])

    def load_image(self, img_path_or_pil, max_size=800):
        """Loads and resizes an image for LoFTR."""
        if isinstance(img_path_or_pil, str):
            img = Image.open(img_path_or_pil)
        else:
            img = img_path_or_pil

        # Resize keeping aspect ratio to avoid OOM but maintain detail
        w, h = img.size
        if max(w, h) > max_size:
            scale = max_size / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            
        # LoFTR requires dimensions to be multiples of 8
        w, h = img.size
        w = w - (w % 8)
        h = h - (h % 8)
        img = img.resize((w, h), Image.LANCZOS)
        
        tensor = self.transform(img).unsqueeze(0).to(self.device)
        return tensor, img.size

    def match(self, screen_img, tile_img):
        """Finds correspondences between screenshot and satellite tile using LoFTR."""
        tensor0, size0 = self.load_image(screen_img)
        tensor1, size1 = self.load_image(tile_img)
        
        input_dict = {"image0": tensor0, "image1": tensor1}
        
        with torch.no_grad():
            correspondences = self.matcher(input_dict)
            
        # Get matching keypoints
        mkpts0 = correspondences['keypoints0'].cpu().numpy()
        mkpts1 = correspondences['keypoints1'].cpu().numpy()
        confidence = correspondences['confidence'].cpu().numpy()
        
        return mkpts0, mkpts1, confidence, size0, size1

    def calculate_gps(self, mkpts_screen, mkpts_tile, screen_size, tile_bounds):
        """
        Calculates the GPS coordinates of the center of the screenshot based on
        homography mapping to the satellite tile.
        
        tile_bounds: dict with 'north', 'south', 'east', 'west'
        """
        if len(mkpts_screen) < 10:
            return None, "Not enough matches to compute homography."
            
        # Find Homography using RANSAC
        H, inliers = cv2.findHomography(mkpts_screen, mkpts_tile, cv2.USAC_MAGSAC, 3.0)
        
        if H is None:
            return None, "Homography computation failed."
            
        inliers_count = inliers.sum()
        if inliers_count < 10:
            return None, "Too few inliers after RANSAC."
            
        # Center of the screenshot
        w, h = screen_size
        center_pt = np.array([[[w / 2.0, h / 2.0]]], dtype=np.float32)
        
        # Transform center point to tile pixel coordinates
        center_tile_pt = cv2.perspectiveTransform(center_pt, H)[0][0]
        x_tile, y_tile = center_tile_pt[0], center_tile_pt[1]
        
        # Interpolate GPS
        # Tile coordinates: x is longitude (west to east), y is latitude (north to south)
        # Note: In images, y=0 is top (North). y=max is bottom (South)
        
        # Assuming tile image is roughly square/rectangular covering the bounds
        # We need the tile size. Since we don't pass it, let's assume the points mkpts_tile
        # are in the scale of the original tile image size.
        # Wait, the matcher uses resized images (multiples of 8).
        # We need to map the transformed point back to the original tile dimensions to get GPS.
        pass

    def calculate_gps_exact(self, mkpts_screen, mkpts_tile, screen_size, tile_size, tile_bounds):
        if len(mkpts_screen) < 10:
            return None, "Not enough matches to compute homography."
            
        H, inliers = cv2.findHomography(mkpts_screen, mkpts_tile, cv2.USAC_MAGSAC, 5.0)
        
        if H is None:
            return None, "Homography computation failed."
            
        inliers_count = inliers.sum()
        if inliers_count < 10:
            return None, "Too few inliers after RANSAC."
            
        w, h = screen_size
        tile_w, tile_h = tile_size
        
        center_pt = np.array([[[w / 2.0, h / 2.0]]], dtype=np.float32)
        center_tile_pt = cv2.perspectiveTransform(center_pt, H)[0][0]
        x_tile, y_tile = center_tile_pt[0], center_tile_pt[1]
        
        # Ensure point is inside the tile (or slightly outside is fine if perspective is correct)
        # Map pixel (x, y) to GPS (lng, lat)
        # x_tile ranges from 0 to tile_w -> maps to west to east
        # y_tile ranges from 0 to tile_h -> maps to north to south
        
        lon_range = tile_bounds['east'] - tile_bounds['west']
        lat_range = tile_bounds['north'] - tile_bounds['south'] # positive value
        
        lon = tile_bounds['west'] + (x_tile / tile_w) * lon_range
        # y=0 is North, y=tile_h is South
        lat = tile_bounds['north'] - (y_tile / tile_h) * lat_range 
        
        return {
            'lat': float(lat),
            'lng': float(lon),
            'inliers': int(inliers_count),
            'confidence': float(inliers_count / len(mkpts_screen))
        }, None

import os
import torch
import torchvision.transforms as T
from PIL import Image
import requests
import io
import mercantile
import concurrent.futures
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, QueryResponse
import numpy as np

class GlobalRetrieval:
    def __init__(self, db_path="./qdrant_storage", collection_name="satellite_tiles", device=None):
        if device is None:
            # Use MPS on Apple Silicon, fallback to CUDA then CPU
            if torch.backends.mps.is_available():
                self.device = torch.device("mps")
            elif torch.cuda.is_available():
                self.device = torch.device("cuda")
            else:
                self.device = torch.device("cpu")
        else:
            self.device = torch.device(device)
            
        print(f"🔥 GlobalRetrieval initialized on {self.device}")

        # Initialize Qdrant Client (Local storage)
        os.makedirs(db_path, exist_ok=True)
        self.qdrant = QdrantClient(path=db_path)
        self.collection_name = collection_name
        
        # Load DINOv2 (ViT-Small is fast and sufficient for retrieval)
        print("🧠 Loading DINOv2 model...")
        self.model = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14')
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # DINOv2 embedding size for vits14 is 384
        self.vector_size = 384 

        # Ensure collection exists
        self._ensure_collection()
        
        # Image transforms matching DINOv2 expectations
        self.transform = T.Compose([
            T.Resize((224, 224)),
            T.ToTensor(),
            T.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ])

    def _ensure_collection(self):
        """Creates the Qdrant collection if it doesn't exist."""
        collections = self.qdrant.get_collections().collections
        if not any(c.name == self.collection_name for c in collections):
            print(f"📦 Creating Qdrant collection: {self.collection_name}")
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.vector_size, distance=Distance.COSINE),
            )

    def extract_feature(self, image: Image.Image) -> np.ndarray:
        """Extracts DINOv2 global feature vector from an image."""
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            # DINOv2 returns a tensor of shape [1, 384]
            features = self.model(img_tensor)
        return features[0].cpu().numpy()

    def index_tile(self, tile_id: int, image_path: str, metadata: dict):
        """Indexes a single satellite tile into Qdrant."""
        try:
            image = Image.open(image_path).convert('RGB')
            vector = self.extract_feature(image)
            
            # Add path to metadata for easy retrieval
            payload = metadata.copy()
            payload["image_path"] = image_path
            
            self.qdrant.upsert(
                collection_name=self.collection_name,
                points=[
                    PointStruct(
                        id=tile_id,
                        vector=vector.tolist(),
                        payload=payload
                    )
                ]
            )
        except Exception as e:
            print(f"⚠️ Failed to index tile {image_path}: {e}")

    def clear_collection(self):
        """Removes all indexed tiles."""
        self.qdrant.delete_collection(self.collection_name)
        self._ensure_collection()

    def search(self, query_image: Image.Image, top_k: int = 5):
        """Searches for the most similar tiles given a query image."""
        query_vector = self.extract_feature(query_image)
        
        # qdrant-client >= 1.7.0 uses query_points instead of search
        result = self.qdrant.query_points(
            collection_name=self.collection_name,
            query=query_vector.tolist(),
            limit=top_k
        )
        # query_points returns a QueryResponse object; .points is the list
        return result.points

    def download_and_index_area(self, bounds: dict, work_dir: str, zoom: int = 16):
        """Downloads satellite tiles for a given area and indexes them into Qdrant."""
        print(f"🌍 Downloading satellite tiles for bounds: {bounds} at zoom {zoom}")
        tiles = list(mercantile.tiles(bounds['west'], bounds['south'], bounds['east'], bounds['north'], zoom))
        
        if len(tiles) > 500:
            print("⚠️ Area too large. Capping to 500 tiles.")
            tiles = tiles[:500]
            
        base_url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile"
        
        tiles_dir = os.path.join(work_dir, "tiles")
        os.makedirs(tiles_dir, exist_ok=True)
        
        def fetch_and_index(t):
            tile_url = f"{base_url}/{t.z}/{t.y}/{t.x}"
            tile_path = os.path.join(tiles_dir, f"tile_{t.z}_{t.x}_{t.y}.jpg")
            
            try:
                # Calculate bounds of this specific tile for GPS mapping
                tile_bounds = mercantile.bounds(t)
                metadata = {
                    "zoom": t.z, "x": t.x, "y": t.y,
                    "north": tile_bounds.north,
                    "south": tile_bounds.south,
                    "east": tile_bounds.east,
                    "west": tile_bounds.west
                }
                
                # Check if we already downloaded it
                if not os.path.exists(tile_path):
                    resp = requests.get(tile_url, timeout=10)
                    if resp.status_code == 200:
                        img = Image.open(io.BytesIO(resp.content)).convert('RGB')
                        img.save(tile_path)
                    else:
                        return False
                
                # Index into Qdrant
                # Use a unique hash or combination for ID
                tile_id = hash(f"{t.z}_{t.x}_{t.y}") % (2**63 - 1)
                self.index_tile(tile_id, tile_path, metadata)
                return True
                
            except Exception as e:
                print(f"Error fetching tile {t}: {e}")
                return False

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            list(executor.map(fetch_and_index, tiles))
            
        print(f"✅ Indexed {len(tiles)} tiles into Qdrant.")


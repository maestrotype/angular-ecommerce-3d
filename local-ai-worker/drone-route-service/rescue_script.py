
import pycolmap
import os
import json

task_id = "9fa94bcb-7de3-46a2-adc0-2137dde3b175"
sparse_path = f"outputs/task_{task_id}/colmap/sparse/0"

def rescue():
    if not os.path.exists(sparse_path):
        print(f"Error: Path {sparse_path} not found")
        return

    print(f"Loading reconstruction from {sparse_path}...")
    reconstruction = pycolmap.Reconstruction(sparse_path)
    
    poses = []
    # Сортируем изображения по имени, чтобы восстановить порядок видео
    sorted_image_ids = sorted(reconstruction.images.keys(), 
                             key=lambda x: reconstruction.images[x].name)
                             
    for image_id in sorted_image_ids:
        img = reconstruction.images[image_id]
        tvec = img.projection_center()
        
        # Получаем кватернион (учитывая версию API)
        if callable(img.cam_from_world):
            pose = img.cam_from_world()
        else:
            pose = img.cam_from_world
            
        poses.append({
            "name": img.name,
            "x": float(tvec[0]),
            "y": float(tvec[1]),
            "z": float(tvec[2]),
            "q": pose.rotation.quat.tolist()
        })
    
    print(f"Successfully extracted {len(poses)} poses!")
    
    # Сохраняем результат в файл, чтобы потом подтянуть в бэкенд
    with open(f"outputs/task_{task_id}/rescued_poses.json", "w") as f:
        json.dump(poses, f)
    
    return poses

if __name__ == "__main__":
    rescue()

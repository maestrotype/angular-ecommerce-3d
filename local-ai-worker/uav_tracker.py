import cv2
import numpy as np

def smooth_trajectory(trajectory, window=5):
    """Apply a simple moving average to smooth the trajectory."""
    if len(trajectory) < window:
        return trajectory
    arr = np.array(trajectory)
    smoothed = []
    for i in range(len(arr)):
        start = max(0, i - window // 2)
        end = min(len(arr), i + window // 2 + 1)
        smoothed.append(arr[start:end].mean(axis=0).tolist())
    return smoothed


def extract_trajectory(
    video_path: str,
    crop_osd: bool = True,
    max_frames: int = 600,
    geo_bounds: dict = None
):
    """
    Extracts a relative X,Y trajectory from a drone video.
    Uses estimateAffinePartial2D for robust, rotation-invariant motion estimation.

    Args:
        video_path: Path to the video file.
        crop_osd: If True, crops the edges of the video to ignore drone UI elements.
        max_frames: Max number of frames to process.

    Returns:
        List of [x, y] coordinates representing the relative trajectory.
        
    Raises:
        Exception with a descriptive message if tracking fails.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Could not open video file: {video_path}")

    ret, old_frame = cap.read()
    if not ret:
        raise Exception("Could not read the first frame. The video may be corrupt.")

    h, w = old_frame.shape[:2]

    # OSD crop mask: Ignore the outer 20% margin where drone UI overlays live
    if crop_osd:
        mx, my = int(w * 0.2), int(h * 0.2)
        crop_box = (mx, my, w - mx, h - my)
    else:
        crop_box = (0, 0, w, h)

    def crop(frame):
        x1, y1, x2, y2 = crop_box
        return frame[y1:y2, x1:x2]

    old_gray = cv2.cvtColor(crop(old_frame), cv2.COLOR_BGR2GRAY)

    # ShiTomasi feature detection parameters
    feature_params = dict(
        maxCorners=300,
        qualityLevel=0.005,
        minDistance=15,
        blockSize=7
    )
    # Lucas-Kanade optical flow parameters
    lk_params = dict(
        winSize=(25, 25),
        maxLevel=3,
        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 20, 0.01)
    )

    p0 = cv2.goodFeaturesToTrack(old_gray, mask=None, **feature_params)
    if p0 is None:
        raise Exception(
            "LOW_CONFIDENCE: No trackable features found in the first frame. "
            "The video might be too blurry or featureless. Try a video taken closer to terrain "
            "(near a city, village, or clearly textured ground)."
        )

    trajectory = [[0.0, 0.0]]
    current_x, current_y = 0.0, 0.0

    total_frames = 0
    failed_frames = 0
    skip_frames = 2  # Process every 3rd frame to handle long videos efficiently

    while cap.isOpened() and total_frames < max_frames * (skip_frames + 1):
        # Skip intermediate frames
        for _ in range(skip_frames):
            ok, _ = cap.read()
            total_frames += 1
            if not ok:
                break

        ok, frame = cap.read()
        total_frames += 1
        if not ok:
            break

        frame_gray = cv2.cvtColor(crop(frame), cv2.COLOR_BGR2GRAY)

        # Track features from previous frame to current
        p1, st, _ = cv2.calcOpticalFlowPyrLK(old_gray, frame_gray, p0, None, **lk_params)

        if p1 is not None and st is not None:
            good_new = p1[st == 1]
            good_old = p0[st == 1]

            if len(good_new) >= 8:
                # Use estimateAffinePartial2D for robust camera motion estimation.
                # This handles translation, rotation and scale — much more accurate than naive median.
                transform, inliers = cv2.estimateAffinePartial2D(
                    good_old, good_new,
                    method=cv2.RANSAC,
                    ransacReprojThreshold=3.0
                )

                if transform is not None:
                    # Extract translation components (dx, dy in pixel space)
                    # Camera moving right == features moving left, so negate for world space.
                    dx = -transform[0, 2]
                    dy = -transform[1, 2]

                    current_x += dx
                    current_y += dy
                    trajectory.append([float(current_x), float(current_y)])
                else:
                    failed_frames += 1
            else:
                failed_frames += 1

            old_gray = frame_gray.copy()
            p0 = good_new.reshape(-1, 1, 2)

            # Replenish features when we're running low
            if len(p0) < 80:
                new_pts = cv2.goodFeaturesToTrack(old_gray, mask=None, **feature_params)
                if new_pts is not None:
                    p0 = np.concatenate((p0, new_pts), axis=0)[:300]
        else:
            failed_frames += 1

    cap.release()

    processed_frames = len(trajectory)

    # Quality check: reject if too little data or too many failed frames
    if processed_frames < 10:
        raise Exception(
            "LOW_CONFIDENCE: The algorithm processed too few frames to build a trajectory. "
            "The video might be too short or has massive scene changes. "
            "Please provide a longer video with a stable, downward-facing view of the terrain."
        )

    failure_rate = failed_frames / max(processed_frames, 1)
    if failure_rate > 0.5:
        raise Exception(
            "LOW_CONFIDENCE: More than 50% of frames failed to track ground features. "
            f"Failure rate: {failure_rate:.0%}. "
            "The terrain may be too homogeneous (open water, bare fields, heavy cloud cover). "
            "Try providing a video over a more textured area (near a village, road intersection, "
            "or forested region) and consider providing multiple higher-resolution reference maps."
        )

    # Apply smoothing to remove jitter/vibration noise
    smoothed = smooth_trajectory(trajectory, window=7)
    
    if geo_bounds is not None:
        # Convert accumulated pixel offsets to real GPS coordinates.
        # The trajectory is in relative pixel-space (dx, dy from optical flow).
        # We center the path in the selected bounding box and scale it
        # proportionally to fit within 70% of the smallest dimension.
        # This preserves the real SHAPE of the flight path.
        arr = np.array(smoothed)
        
        # Total accumulated range in pixel-space
        pixel_span_x = max(arr[:, 0].max() - arr[:, 0].min(), 1.0)
        pixel_span_y = max(arr[:, 1].max() - arr[:, 1].min(), 1.0)
        max_pixel_span = max(pixel_span_x, pixel_span_y)
        
        lat_span = geo_bounds["north"] - geo_bounds["south"]
        lng_span = geo_bounds["east"]  - geo_bounds["west"]
        
        # Scale uniformly so the largest axis = 70% of the selected area.
        # This preserves the aspect ratio of the actual flight.
        max_geo_span = max(lat_span, lng_span) * 0.7
        scale = max_geo_span / max_pixel_span  # degrees per pixel
        
        # Center of selected area is treated as the midpoint of the trajectory
        center_lat = (geo_bounds["north"] + geo_bounds["south"]) / 2
        center_lng = (geo_bounds["east"]  + geo_bounds["west"]) / 2
        
        # Shift trajectory so that its centroid aligns with the area center
        cx = arr[:, 0].mean()
        cy = arr[:, 1].mean()
        
        gps_trajectory = []
        for point in arr:
            # OpenCV: x-right = east, y-down = south
            lat = center_lat - ((point[1] - cy) * scale)
            lng = center_lng + ((point[0] - cx) * scale)
            gps_trajectory.append([lat, lng])
        
        return gps_trajectory
    
    return smoothed


if __name__ == "__main__":
    print("UAV Optical Flow Tracker — ready.")

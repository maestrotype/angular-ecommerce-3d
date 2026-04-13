import cv2
import base64
import requests
import json
import logging
from typing import Optional, List, Dict, Any

LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

def extract_keyframes(video_path: str, interval_sec: int = 4):
    """
    Extracts one frame every `interval_sec` seconds from the video.
    Returns a list of base64 encoded jpeg images.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Could not open video to extract keyframes.")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 30  # fallback

    frame_interval = int(fps * interval_sec)
    
    keyframes_b64 = []
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            # Resize frame to avoid massive payloads
            # Qwen-VL is smart enough to understand resized frames
            h, w = frame.shape[:2]
            scale = 512.0 / max(h, w) # Resize max dim to 512
            if scale < 1.0:
                frame = cv2.resize(frame, (int(w * scale), int(h * scale)))
                
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            b64_str = base64.b64encode(buffer).decode('utf-8')
            keyframes_b64.append(f"data:image/jpeg;base64,{b64_str}")
            
        frame_count += 1
        
        # Prevent memory overload by limiting to max 20 keyframes
        if len(keyframes_b64) >= 20: 
            break

    cap.release()
    return keyframes_b64

def get_base64_image(image_path: str):
    """Encodes a single image file to base64 data URI."""
    with open(image_path, "rb") as image_file:
        b64_str = base64.b64encode(image_file.read()).decode('utf-8')
        return f"data:image/jpeg;base64,{b64_str}"

def analyze_flight(video_path: str, reference_image_path: Optional[str] = None, user_prompt: Optional[str] = None) -> str:
    """
    Sends keyframes and optional reference image to LM Studio for analysis.
    Returns the generated markdown report.
    """
    try:
        keyframes = extract_keyframes(video_path)
    except Exception as e:
        return f"Failed to extract video frames for AI analysis: {str(e)}"

    if not keyframes:
        return "No frames could be extracted from the video."

    content_array: List[Dict[str, Any]] = []
    
    # 1. Add Text Instruction
    base_instruction = (
        "You are an expert aerial reconnaissance analyst. I will provide you with a sequence "
        "of frames extracted from a drone flight video (in chronological order)."
    )
    
    if reference_image_path:
        base_instruction += " I am also providing a 'REFERENCE IMAGE' of a specific target location. "
        
    if user_prompt:
        base_instruction += f"\n\nUSER HINTS/INSTRUCTIONS: \"{user_prompt}\"\n\n"
        
    base_instruction += (
        "Please provide a concise text report of the flight. "
        "Point out any problem areas (e.g., camera pointing over the horizon, blurry shots, flying over featureless terrain). "
    )
    
    if reference_image_path:
        base_instruction += (
            "CRITICAL: Look carefully for the target from the REFERENCE IMAGE in the video frames. "
            "Tell me if we flew past it, and roughly at what point in the sequence."
        )

    base_instruction += "\n\nYou must provide a detailed, multi-paragraph answer. If the user asks a specific question in the hints, prioritize answering it completely."
        
    content_array.append({
        "type": "text", 
        "text": base_instruction
    })
    
    # 2. Add Reference Image (if provided)
    if reference_image_path:
        try:
            ref_b64 = get_base64_image(reference_image_path)
            content_array.append({"type": "text", "text": "=== REFERENCE IMAGE ==="})
            content_array.append({
                "type": "image_url",
                "image_url": {"url": ref_b64}
            })
        except Exception as e:
            logging.error(f"Error loading reference image: {e}")

    # 3. Add Video Frames
    content_array.append({"type": "text", "text": f"=== VIDEO SEQUENCE START ({len(keyframes)} frames) ==="})
    for frame_b64 in keyframes:
        content_array.append({
            "type": "image_url",
            "image_url": {"url": frame_b64}
        })
    content_array.append({"type": "text", "text": "=== VIDEO SEQUENCE END ==="})

    # Prepare OpenAI-compatible payload for LM Studio
    payload = {
        "model": "qwen-vl-local", 
        "temperature": 0.2, 
        "max_tokens": 2048, # Prevent truncation of long answers
        "messages": [
            {
                "role": "user",
                "content": content_array
            }
        ]
    }

    try:
        response = requests.post(
            LM_STUDIO_URL, 
            json=payload, 
            headers={"Content-Type": "application/json"},
            timeout=120 # Give the local VLM time to process multiple images
        )
        
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            return f"AI Analysis failed. Make sure LM Studio Local Server is running! (Error: HTTP {response.status_code})"
    except requests.exceptions.ConnectionError:
        return (
            "LM Studio server is not reachable. "
            "Please ensure LM Studio is open, the Qwen3-VL 30B model is loaded, "
            "and the Local Server is started on port 1234."
        )
    except Exception as e:
        return f"An unexpected error occurred during AI analysis: {str(e)}"

if __name__ == "__main__":
    pass

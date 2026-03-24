import numpy as np
import base64
import io
import cv2
from PIL import Image
from deepface import DeepFace

def get_face_encoding_from_base64(base64_str):
    try:
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]
        
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_bgr is None:
            print("Could not decode image")
            return None

        if img_bgr.shape[1] > 800:
            scale = 800 / img_bgr.shape[1]
            img_bgr = cv2.resize(img_bgr, (800, int(img_bgr.shape[0] * scale)))

        embedding = DeepFace.represent(img_bgr, model_name="Facenet", enforce_detection=True)
        return np.array(embedding[0]["embedding"])
    except Exception as e:
        print(f"Error: {e}")
        return None

def compare_faces(known_encoding, face_to_check_encoding, tolerance=0.5):
    known_arr = np.fromstring(known_encoding, sep=",")
    distance = np.linalg.norm(known_arr - face_to_check_encoding)
    print(f"Distance: {distance}")
    return distance < 10
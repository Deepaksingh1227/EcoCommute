from fastapi import FastAPI
from pydantic import BaseModel
import os
import joblib
import numpy as np
import traceback

MODEL_PATH = os.getenv('ML_MODEL_PATH', 'model/model.bin')

# If model missing, train a quick one (this keeps the container self-contained for demos)
if not os.path.exists(MODEL_PATH):
    print("ML model not found. Training a model (this may take ~10-30s)...")
    try:
        from model.train import train_and_save
        train_and_save(MODEL_PATH)
    except Exception as e:
        print("Failed to train model automatically:", e)
        traceback.print_exc()

# load model
MODEL = None
try:
    MODEL = joblib.load(MODEL_PATH)
    print("Loaded ML model from", MODEL_PATH)
except Exception as e:
    print("Failed to load model:", e)
    MODEL = None

app = FastAPI(title="EcoCommute ML Service")

class PredictRequest(BaseModel):
    features: dict

@app.post("/predict")
def predict(req: PredictRequest):
    """
    Expects JSON: { "features": { "distance_km": float, "hour_of_day": int, "mode": "driving-car" } }
    The model expects a feature vector [distance_km, hour_of_day, mode_code]
    mode mapping: driving-car -> 0, cycling-regular -> 1, foot-walking -> 2
    Returns: {"predicted_duration_min": <float>}
    """
    try:
        f = req.features
        distance = float(f.get('distance_km', 1.0))
        hour = int(f.get('hour_of_day', 12))
        # derive mode_code
        mode = f.get('mode', f.get('mode_code', 0))
        if isinstance(mode, str):
            mode_map = {'driving-car': 0, 'cycling-regular': 1, 'foot-walking': 2}
            mode_code = mode_map.get(mode, 0)
        else:
            mode_code = int(mode)

        x = np.array([[distance, hour, mode_code]])
        if MODEL is None:
            # fallback heuristic: duration = (distance / speed) * 60 with mode speeds
            speed = 35.0
            if mode_code == 1: speed = 14.0
            if mode_code == 2: speed = 5.0
            pred = (distance / speed) * 60
            return {"predicted_duration_min": float(pred)}
        pred = MODEL.predict(x)
        return {"predicted_duration_min": float(pred[0])}
    except Exception as e:
        # return a heuristic fallback and status 200 to keep backend resilient
        try:
            mode_code = 0
            if isinstance(req.features.get('mode'), str):
                if 'cycle' in req.features.get('mode'):
                    mode_code = 1
                if 'foot' in req.features.get('mode'):
                    mode_code = 2
            distance = float(req.features.get('distance_km', 1.0))
            speed = 35.0 if mode_code == 0 else (14.0 if mode_code == 1 else 5.0)
            pred = (distance / speed) * 60
            return {"predicted_duration_min": float(pred)}
        except:
            return {"predicted_duration_min": 1.0}

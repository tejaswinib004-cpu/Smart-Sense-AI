import joblib
from pathlib import Path
from typing import Dict

MODELS_PATH = Path(__file__).resolve().parent.parent / "models"
STRESS_MODEL_PATH = MODELS_PATH / "stress_model.pkl"
RF_MODEL_PATH = MODELS_PATH / "stress_model_rf.pkl"
SCALER_PATH = MODELS_PATH / "scaler.pkl"
LABEL_ENCODER_PATH = MODELS_PATH / "label_encoder.pkl"

FEATURE_NAMES = [
    "anxiety_level",
    "self_esteem",
    "mental_health_history",
    "depression",
    "sleep_quality",
    "study_load",
    "future_career_concerns",
    "social_support",
    "peer_pressure",
    "bullying",
]

LABEL_MAP = {0: "Low", 1: "Moderate", 2: "High"}


def load_serialized(path: Path):
    return joblib.load(path) if path.exists() else None


def load_models():
    svc_model = load_serialized(STRESS_MODEL_PATH)
    rf_model = load_serialized(RF_MODEL_PATH)
    scaler = load_serialized(SCALER_PATH)
    label_encoder = load_serialized(LABEL_ENCODER_PATH)
    return svc_model, rf_model, scaler, label_encoder


def predict_stress(features_dict: Dict[str, float]):
    svc_model, rf_model, scaler, label_encoder = load_models()

    if svc_model is None or scaler is None:
        return {"error": "Models or scaler not found. Train the model first."}

    feature_values = [features_dict.get(f, 0) for f in FEATURE_NAMES]
    scaled_values = scaler.transform([feature_values])

    svc_pred = int(svc_model.predict(scaled_values)[0])
    svc_probs = svc_model.predict_proba(scaled_values)[0].tolist()

    rf_pred = None
    if rf_model is not None:
        rf_pred = int(rf_model.predict(scaled_values)[0])

    label = LABEL_MAP.get(svc_pred, "Unknown")
    confidence = max(min(svc_probs[svc_pred], 0.98), 0.0)
    score = float((svc_pred + 1) / 3)

    return {
        "level": svc_pred,
        "label": label,
        "confidence": confidence,
        "score": score,
        "probs": svc_probs,
        "model_used": "SVC",
        "rf_prediction": rf_pred,
    }

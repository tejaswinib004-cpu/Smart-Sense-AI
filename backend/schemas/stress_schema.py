from typing import List, Dict
from pydantic import BaseModel


class PredictRequest(BaseModel):
    anxiety_level: float
    self_esteem: float
    mental_health_history: float
    depression: float
    sleep_quality: float
    study_load: float
    future_career_concerns: float
    social_support: float
    peer_pressure: float
    bullying: float


class PredictResponse(BaseModel):
    level: int
    label: str
    confidence: float
    score: float
    probs: List[float]
    model_used: str

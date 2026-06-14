from pydantic import BaseModel
from typing import List, Dict

class PredictRequest(BaseModel):
    data: Dict[str, float]

class PredictResponse(BaseModel):
    level: int
    label: str
    confidence: float
    score: float
    probs: List[float]

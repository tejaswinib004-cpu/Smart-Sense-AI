from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class HistoryEntry(BaseModel):
    id: Optional[str] = None
    user_email: str
    date: datetime
    stress_level: str
    confidence: float
    score: float
    features_used: dict

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    total: int
    entries: List[HistoryEntry]

from backend.database import get_history
from typing import List
import json


def get_user_history(user_email: str, limit: int = 50) -> List[dict]:
    records = get_history(user_email, limit)
    result = []
    for record in records:
        entry = {
            "id": record["id"],
            "date": record["created_at"],
            "stress_level": record["stress_level"],
            "confidence": record["confidence"],
            "score": record["score"],
            "features": json.loads(record["features_used"]),
        }
        result.append(entry)
    return result


def get_stress_statistics(user_email: str):
    records = get_history(user_email)
    if not records:
        return {"total": 0, "low": 0, "moderate": 0, "high": 0, "avg_score": 0}

    low = sum(1 for r in records if r["stress_level"] == "Low")
    moderate = sum(1 for r in records if r["stress_level"] == "Moderate")
    high = sum(1 for r in records if r["stress_level"] == "High")
    avg_score = sum(r["score"] for r in records) / len(records) if records else 0

    return {"total": len(records), "low": low, "moderate": moderate, "high": high, "avg_score": round(avg_score, 3)}

from typing import Dict

FEATURE_WEIGHTS = {
    "anxiety_level": 2.1,
    "self_esteem": -0.8,
    "mental_health_history": 12,
    "depression": 1.9,
    "headache": 3,
    "blood_pressure": 8,
    "sleep_quality": -4,
    "breathing_problem": 2.5,
    "noise_level": 1.5,
    "living_conditions": -2,
    "safety": -1.8,
    "basic_needs": -2.2,
    "academic_performance": -2.5,
    "study_load": 3.2,
    "teacher_student_relationship": -1.2,
    "future_career_concerns": 2.8,
    "social_support": -4,
    "peer_pressure": 2,
    "extracurricular_activities": -0.8,
    "bullying": 3,
}

MAX_SCORE = (
    21 * 2.1 + 30 * 0.8 + 27 * 1.9 + 12 + 5 * 3 + 2 * 8 + 5 * 4 + 5 * 2.5
    + 5 * 1.5 + 5 * 2 + 5 * 1.8 + 5 * 2.2 + 5 * 2.5 + 5 * 3.2 + 5 * 1.2 + 5 * 2.8
    + 3 * 4 + 5 * 2 + 5 * 0.8 + 5 * 3
)


def predict_stress(values: Dict[str, float]) -> Dict:
    score = (
        values.get("anxiety_level", 0) * 2.1
        + (30 - values.get("self_esteem", 0)) * 0.8
        + values.get("depression", 0) * 1.9
        + values.get("mental_health_history", 0) * 12
        + values.get("headache", 0) * 3
        + (values.get("blood_pressure", 1) - 1) * 8
        + (5 - values.get("sleep_quality", 0)) * 4
        + values.get("breathing_problem", 0) * 2.5
        + values.get("noise_level", 0) * 1.5
        + (5 - values.get("living_conditions", 0)) * 2
        + (5 - values.get("safety", 0)) * 1.8
        + (5 - values.get("basic_needs", 0)) * 2.2
        + (5 - values.get("academic_performance", 0)) * 2.5
        + values.get("study_load", 0) * 3.2
        + (5 - values.get("teacher_student_relationship", 0)) * 1.2
        + values.get("future_career_concerns", 0) * 2.8
        + (3 - values.get("social_support", 0)) * 4
        + values.get("peer_pressure", 0) * 2
        + (5 - values.get("extracurricular_activities", 0)) * 0.8
        + values.get("bullying", 0) * 3
    )
    normalized = min(score / MAX_SCORE, 1)

    if normalized < 0.35:
        level = 0
        label = "Low"
        confidence = 0.65
    elif normalized < 0.65:
        level = 1
        label = "Moderate"
        confidence = 0.60
    else:
        level = 2
        label = "High"
        confidence = 0.70

    probs = [0.0, 0.0, 0.0]
    if level == 0:
        probs = [confidence, (1 - confidence) * 0.7, (1 - confidence) * 0.3]
    elif level == 1:
        probs = [(1 - confidence) * 0.5, confidence, (1 - confidence) * 0.5]
    else:
        probs = [(1 - confidence) * 0.2, (1 - confidence) * 0.7, confidence]

    return {
        "level": level,
        "label": label,
        "confidence": min(confidence, 0.98),
        "score": normalized,
        "probs": probs,
    }

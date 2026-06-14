import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from pathlib import Path
import json

DEFAULT_FEATURE_NAMES = [
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

FEATURE_NAMES = DEFAULT_FEATURE_NAMES.copy()
try:
    import json, os
    sel_path = Path(__file__).resolve().parent / "selected_features.json"
    if sel_path.exists():
        with open(sel_path, 'r') as f:
            data = json.load(f)
            if isinstance(data, dict) and 'features' in data:
                FEATURE_NAMES = data['features']
            elif isinstance(data, list):
                FEATURE_NAMES = data
except Exception:
    pass

TARGET = "stress_level"


def load_data(data_path: str):
    """Load StressLevelDataset.csv"""
    df = pd.read_csv(data_path)
    return df


def preprocess_data(df: pd.DataFrame):
    """
    Preprocess features:
    - Handle missing values
    - Remove outliers (IQR method)
    - Normalize/Scale features
    - Encode target variable
    """

    df = df.dropna(subset=FEATURE_NAMES + [TARGET])

    for feature in FEATURE_NAMES:
        Q1 = df[feature].quantile(0.25)
        Q3 = df[feature].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df[feature] >= lower_bound) & (df[feature] <= upper_bound)]

    X = df[FEATURE_NAMES].copy()
    y = df[TARGET].copy()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=FEATURE_NAMES)

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    return X_scaled, y_encoded, scaler, label_encoder, label_encoder.classes_


def save_feature_info(output_path: Path):
    """Save feature names and mappings to JSON"""
    feature_info = {
        "features": FEATURE_NAMES,
        "target": TARGET,
        "n_features": len(FEATURE_NAMES),
        "label_map": {"0": "Low", "1": "Moderate", "2": "High"},
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(feature_info, f, indent=2)

    print(f"Feature info saved to {output_path}")

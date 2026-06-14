import sys
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

DATA_PATH = ROOT / "data" / "StressLevelDataset.csv"
OUTPUT_DIR = ROOT / "assets" / "charts"
FRONTEND_DIR = ROOT / "frontend" / "public" / "assets" / "charts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = [
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

if __name__ == "__main__":
    df = pd.read_csv(DATA_PATH)
    print("Dataset shape:", df.shape)
    print(df[FEATURES + ["stress_level"]].head())

    plt.figure(figsize=(10, 6))
    sns.countplot(data=df, x="stress_level", palette="Set2")
    plt.title("Stress Level Distribution")
    out1 = OUTPUT_DIR / "stress_level_distribution.png"
    out1_front = FRONTEND_DIR / "stress_level_distribution.png"
    plt.savefig(out1, bbox_inches="tight")
    plt.savefig(out1_front, bbox_inches="tight")
    plt.close()

    corr = df[FEATURES + ["stress_level"]].copy()
    corr["stress_level"] = corr["stress_level"].map({"Low": 0, "Moderate": 1, "High": 2})
    correlation = corr.corr()
    plt.figure(figsize=(12, 10))
    sns.heatmap(correlation, annot=True, fmt=".2f", cmap="viridis")
    plt.title("Feature Correlation Matrix")
    out2 = OUTPUT_DIR / "feature_correlation_matrix.png"
    out2_front = FRONTEND_DIR / "feature_correlation_matrix.png"
    plt.savefig(out2, bbox_inches="tight")
    plt.savefig(out2_front, bbox_inches="tight")
    plt.close()

    for feature in FEATURES:
        plt.figure(figsize=(8, 4))
        sns.histplot(df[feature], bins=15, kde=True, color="#4F46E5")
        plt.title(f"Distribution of {feature}")
        outf = OUTPUT_DIR / f"distribution_{feature}.png"
        outf_front = FRONTEND_DIR / f"distribution_{feature}.png"
        plt.savefig(outf, bbox_inches="tight")
        plt.savefig(outf_front, bbox_inches="tight")
        plt.close()

    # save a small preview for the frontend
    preview = df.head(10).to_dict(orient='records')
    preview_path = ROOT / "frontend" / "public" / "data_preview.json"
    with open(preview_path, 'w') as f:
        import json
        json.dump(preview, f, indent=2)

    print(f"EDA charts saved in {OUTPUT_DIR} and copied to frontend public folder")

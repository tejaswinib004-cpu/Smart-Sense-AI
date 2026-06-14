import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from ml.preprocess import FEATURE_NAMES, load_data, preprocess_data
import json

DATA_PATH = ROOT / "data" / "StressLevelDataset.csv"
OUTPUT_DIR = ROOT / "assets" / "charts"
FRONTEND_DIR = ROOT / "frontend" / "public" / "assets" / "charts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_DIR.mkdir(parents=True, exist_ok=True)

if __name__ == "__main__":
    df = load_data(DATA_PATH)
    print("Raw data shape:", df.shape)
    print("Candidate features:", FEATURE_NAMES)

    df_clean = df.dropna(subset=FEATURE_NAMES + ["stress_level"]).copy()
    if df_clean["stress_level"].dtype.kind in "biuf":
        df_clean["stress_numeric"] = df_clean["stress_level"].astype(float)
    else:
        mapping = {"Low": 0, "Moderate": 1, "High": 2}
        df_clean["stress_numeric"] = df_clean["stress_level"].map(mapping)

    outlier_summary = {}
    for feature in FEATURE_NAMES:
        Q1 = df_clean[feature].quantile(0.25)
        Q3 = df_clean[feature].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outlier_count = int(((df_clean[feature] < lower_bound) | (df_clean[feature] > upper_bound)).sum())
        outlier_summary[feature] = outlier_count
        df_clean = df_clean[(df_clean[feature] >= lower_bound) & (df_clean[feature] <= upper_bound)]

    print("Data after outlier handling shape:", df_clean.shape)
    print("Outlier counts per feature:", outlier_summary)

    corr = df_clean[FEATURE_NAMES + ["stress_numeric"]].corr()
    target_corr = corr["stress_numeric"].drop("stress_numeric").abs().sort_values(ascending=False)
    print("Feature correlation with stress (abs):\n", target_corr.round(3))

    top_n = min(6, len(target_corr))
    selected = target_corr.head(top_n).index.tolist()
    print("Selected top features:", selected)

    sel_path = ROOT / "ml" / "selected_features.json"
    sel_path.parent.mkdir(parents=True, exist_ok=True)
    with open(sel_path, "w") as f:
        json.dump({"features": selected}, f, indent=2)
    print("Saved selected features to", sel_path)

    pipeline_info = {
        "outlier_handling": "IQR filtering per feature (remove rows outside 1.5*IQR)",
        "missing_values": "Drop rows with missing values in features/target",
        "scaling": "StandardScaler applied to numeric features",
        "feature_selection": selected,
        "feature_correlations": {k: float(v) for k, v in target_corr.head(top_n).round(3).to_dict().items()},
        "outlier_counts": outlier_summary,
    }
    frontend_info = ROOT / "frontend" / "public" / "pipeline_info.json"
    frontend_info.parent.mkdir(parents=True, exist_ok=True)
    with open(frontend_info, "w") as f:
        json.dump(pipeline_info, f, indent=2)
    print("Saved pipeline info to", frontend_info)

    preview = df_clean.head(10).to_dict(orient='records')
    preview_path = ROOT / "frontend" / "public" / "data_preview.json"
    with open(preview_path, "w") as f:
        json.dump(preview, f, indent=2)
    print("Saved data preview to", preview_path)

    plt.figure(figsize=(10, 6))
    sns.countplot(data=df_clean, x="stress_level", palette="Set2")
    plt.title("Stress Level Distribution")
    out1 = OUTPUT_DIR / "stress_level_distribution.png"
    out1_front = FRONTEND_DIR / "stress_level_distribution.png"
    plt.savefig(out1, bbox_inches="tight")
    plt.savefig(out1_front, bbox_inches="tight")
    plt.close()

    plt.figure(figsize=(12, 10))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="viridis")
    plt.title("Feature Correlation Matrix")
    out2 = OUTPUT_DIR / "feature_correlation_matrix.png"
    out2_front = FRONTEND_DIR / "feature_correlation_matrix.png"
    plt.savefig(out2, bbox_inches="tight")
    plt.savefig(out2_front, bbox_inches="tight")
    plt.close()

    for feature in FEATURE_NAMES:
        plt.figure(figsize=(8, 4))
        sns.histplot(df_clean[feature], bins=15, kde=True, color="#4F46E5")
        plt.title(f"Distribution of {feature}")
        outf = OUTPUT_DIR / f"distribution_{feature}.png"
        outf_front = FRONTEND_DIR / f"distribution_{feature}.png"
        plt.savefig(outf, bbox_inches="tight")
        plt.savefig(outf_front, bbox_inches="tight")
        plt.close()

    # Boxplot for all features side-by-side
    plt.figure(figsize=(14, 6))
    sns.boxplot(data=df_clean[FEATURE_NAMES], palette="Set3")
    plt.xticks(rotation=45)
    plt.title("Boxplots for all features")
    out_box = OUTPUT_DIR / "boxplots_all_features.png"
    out_box_front = FRONTEND_DIR / "boxplots_all_features.png"
    plt.savefig(out_box, bbox_inches="tight")
    plt.savefig(out_box_front, bbox_inches="tight")
    plt.close()

    # Pairplot (may be large) with KDE diagonals
    try:
        pairplot_fig = sns.pairplot(df_clean[FEATURE_NAMES + ["stress_level"]], corner=True, diag_kind='kde', plot_kws={'alpha':0.6, 's':20})
        pairplot_path = OUTPUT_DIR / "pairplot_features.png"
        pairplot_front = FRONTEND_DIR / "pairplot_features.png"
        pairplot_fig.savefig(pairplot_path)
        pairplot_fig.savefig(pairplot_front)
        plt.close()
    except Exception as e:
        print("Pairplot generation failed:", e)

    print(f"EDA charts saved in {OUTPUT_DIR} and copied to {FRONTEND_DIR}")

    X, y, scaler, label_encoder, classes = preprocess_data(df)
    print("Preprocessed feature shape:", X.shape)
    print("Feature means after scaling:\n", X.mean(axis=0).round(3))
    print("Feature standard deviations after scaling:\n", X.std(axis=0).round(3))
    print("Target classes:", classes)

    summary = X.describe().round(3)
    print(summary)

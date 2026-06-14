import joblib
from pathlib import Path
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.preprocess import load_data, preprocess_data, save_feature_info

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "StressLevelDataset.csv"
MODELS_PATH = ROOT / "models"


def train_models(data_path=None):
    if data_path is None:
        data_path = DATA_PATH

    if not data_path.exists():
        print(f"Error: {data_path} not found. Please download StressLevelDataset.csv from Kaggle.")
        return

    print("Loading data...")
    df = load_data(data_path)
    print(f"Data shape: {df.shape}")

    print("Preprocessing data...")
    X, y, scaler, label_encoder, classes = preprocess_data(df)
    print(f"Preprocessed data shape: {X.shape}")

    print("Splitting data (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Training set size: {X_train.shape[0]}, Test set size: {X_test.shape[0]}")

    print("\n" + "=" * 60)
    print("Training RandomForestClassifier...")
    print("=" * 60)
    rf_model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, max_depth=15, min_samples_split=5)
    rf_model.fit(X_train, y_train)

    rf_pred = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_pred)
    rf_prec = precision_score(y_test, rf_pred, average="weighted", zero_division=0)
    rf_rec = recall_score(y_test, rf_pred, average="weighted", zero_division=0)
    rf_f1 = f1_score(y_test, rf_pred, average="weighted", zero_division=0)

    print(f"RandomForest Accuracy: {rf_acc:.4f}")
    print(f"RandomForest Precision: {rf_prec:.4f}")
    print(f"RandomForest Recall: {rf_rec:.4f}")
    print(f"RandomForest F1-Score: {rf_f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, rf_pred, target_names=[str(c) for c in classes], zero_division=0))

    print("\n" + "=" * 60)
    print("Training Support Vector Classifier (SVC) - Final Model...")
    print("=" * 60)
    svc_model = SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42, probability=True)
    svc_model.fit(X_train, y_train)

    svc_pred = svc_model.predict(X_test)
    svc_acc = accuracy_score(y_test, svc_pred)
    svc_prec = precision_score(y_test, svc_pred, average="weighted", zero_division=0)
    svc_rec = recall_score(y_test, svc_pred, average="weighted", zero_division=0)
    svc_f1 = f1_score(y_test, svc_pred, average="weighted", zero_division=0)

    print(f"SVC Accuracy: {svc_acc:.4f}")
    print(f"SVC Precision: {svc_prec:.4f}")
    print(f"SVC Recall: {svc_rec:.4f}")
    print(f"SVC F1-Score: {svc_f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, svc_pred, target_names=[str(c) for c in classes], zero_division=0))

    print("\n" + "=" * 60)
    print("Model Comparison")
    print("=" * 60)
    print(f"RandomForest F1-Score: {rf_f1:.4f}")
    print(f"SVC F1-Score: {svc_f1:.4f}")
    print(f"Using {'SVC' if svc_f1 >= rf_f1 else 'RandomForest'} as final model (better F1-score)")

    MODELS_PATH.mkdir(parents=True, exist_ok=True)

    print("\nSaving models...")
    joblib.dump(rf_model, MODELS_PATH / "stress_model_rf.pkl")
    joblib.dump(svc_model, MODELS_PATH / "stress_model.pkl")
    joblib.dump(scaler, MODELS_PATH / "scaler.pkl")
    joblib.dump(label_encoder, MODELS_PATH / "label_encoder.pkl")

    save_feature_info(MODELS_PATH / "feature.json")

    print(f"Models saved to {MODELS_PATH}")


if __name__ == "__main__":
    train_models()

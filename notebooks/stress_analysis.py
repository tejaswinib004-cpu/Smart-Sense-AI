import sys
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
from ml.preprocess import load_data, preprocess_data

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

DATA_PATH = ROOT / "data" / "StressLevelDataset.csv"

if __name__ == "__main__":
    df = load_data(DATA_PATH)
    X, y, scaler, label_encoder, classes = preprocess_data(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)

    svc = SVC(kernel="rbf", C=1.0, gamma="scale", probability=True, random_state=42)
    svc.fit(X_train, y_train)
    svc_pred = svc.predict(X_test)

    for name, pred in [("RandomForest", rf_pred), ("SVC", svc_pred)]:
        print(f"\n{name} results:")
        print("Accuracy:", accuracy_score(y_test, pred))
        print("Precision:", precision_score(y_test, pred, average="weighted", zero_division=0))
        print("Recall:", recall_score(y_test, pred, average="weighted", zero_division=0))
        print("F1 Score:", f1_score(y_test, pred, average="weighted", zero_division=0))
        print(classification_report(y_test, pred, target_names=classes, zero_division=0))

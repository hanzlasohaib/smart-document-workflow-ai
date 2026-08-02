from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = BACKEND_ROOT / "ml" / "dataset.csv"
MODEL_PATH = BACKEND_ROOT / "document_classifier.pkl"

data = pd.read_csv(DATASET_PATH)

X = data["text"]
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline(
    [
        ("tfidf", TfidfVectorizer(stop_words="english")),
        ("clf", LogisticRegression(max_iter=1000)),
    ]
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

joblib.dump(model, MODEL_PATH)
print(f"\nModel saved as {MODEL_PATH}")

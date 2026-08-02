import logging
import os
from functools import lru_cache

import joblib

from app.core.config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _load_model():
    model_path = settings.MODEL_PATH
    if not os.path.isfile(model_path):
        raise FileNotFoundError(
            f"Classifier artifact not found at {model_path}. "
            "Set MODEL_PATH or place document_classifier.pkl under the backend root."
        )
    logger.info("Loading classifier from %s", model_path)
    return joblib.load(model_path)


def classify_text(text: str):
    model = _load_model()
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = max(probabilities)
    return prediction, float(confidence)

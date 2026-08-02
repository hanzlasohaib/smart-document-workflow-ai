from pathlib import Path

from pydantic_settings import BaseSettings

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_PATH = str(BACKEND_ROOT / "document_classifier.pkl")


class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str

    # File Upload
    UPLOAD_DIR: str

    # Pipeline (PAS-04)
    CONFIDENCE_THRESHOLD: float = 0.70
    MODEL_PATH: str = DEFAULT_MODEL_PATH

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

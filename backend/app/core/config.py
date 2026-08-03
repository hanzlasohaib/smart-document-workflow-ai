from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_PATH = str(BACKEND_ROOT / "document_classifier.pkl")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # JWT / sessions
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str

    # Local upload / storage
    UPLOAD_DIR: str = "./uploads"
    STORAGE_BACKEND: str = "local"  # local | supabase

    # Supabase Storage (required when STORAGE_BACKEND=supabase)
    SUPABASE_URL: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_STORAGE_BUCKET: str = "documents"

    # Pipeline (PAS-04)
    CONFIDENCE_THRESHOLD: float = 0.70
    MODEL_PATH: str = DEFAULT_MODEL_PATH

    # Optional admin seed defaults (script reads these)
    ADMIN_EMAIL: str | None = None
    ADMIN_PASSWORD: str | None = None
    ADMIN_NAME: str = "Administrator"


settings = Settings()

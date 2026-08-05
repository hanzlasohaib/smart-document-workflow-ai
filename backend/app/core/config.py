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

    # Browser FE origins (comma-separated). Empty = CORS disabled.
    CORS_ORIGINS: str = "http://localhost:3000"

    # Observability (PAS-06 / P3)
    LOG_FORMAT: str = "json"  # json | text
    SENTRY_DSN: str | None = None
    SENTRY_ENVIRONMENT: str = "local"

    # Auth rate limit (per client IP, sliding window). 0 disables.
    AUTH_RATE_LIMIT_REQUESTS: int = 20
    AUTH_RATE_LIMIT_WINDOW_SECONDS: int = 60

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    def storage_config_ready(self) -> bool:
        backend = (self.STORAGE_BACKEND or "local").lower()
        if backend == "local":
            return bool(self.UPLOAD_DIR)
        if backend == "supabase":
            return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_ROLE_KEY)
        return False


settings = Settings()

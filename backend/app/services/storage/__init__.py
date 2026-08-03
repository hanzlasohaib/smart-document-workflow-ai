from functools import lru_cache

from app.core.config import settings
from app.services.storage.local import LocalStorageAdapter


@lru_cache(maxsize=1)
def get_storage():
    backend = (settings.STORAGE_BACKEND or "local").lower()
    if backend == "local":
        return LocalStorageAdapter(settings.UPLOAD_DIR)
    if backend == "supabase":
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "STORAGE_BACKEND=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
            )
        from app.services.storage.supabase import SupabaseStorageAdapter

        return SupabaseStorageAdapter(
            url=settings.SUPABASE_URL,
            service_role_key=settings.SUPABASE_SERVICE_ROLE_KEY,
            bucket=settings.SUPABASE_STORAGE_BUCKET,
        )
    raise RuntimeError(f"Unsupported STORAGE_BACKEND: {backend}")

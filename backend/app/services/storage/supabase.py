import tempfile
from pathlib import Path
from urllib.parse import quote

import httpx

from app.services.storage.mime import resolve_content_type


class SupabaseStorageAdapter:
    """Supabase Storage via REST (service role)."""

    def __init__(self, url: str, service_role_key: str, bucket: str):
        self.base_url = url.rstrip("/")
        self.service_role_key = service_role_key
        self.bucket = bucket
        self._tmp_dir = Path(tempfile.gettempdir()) / "sdw_supabase_cache"
        self._tmp_dir.mkdir(parents=True, exist_ok=True)

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.service_role_key}",
            "apikey": self.service_role_key,
        }

    def _object_url(self, storage_key: str) -> str:
        # Encode each path segment; keep "/" for nested keys.
        encoded = quote(storage_key, safe="/")
        return f"{self.base_url}/storage/v1/object/{self.bucket}/{encoded}"

    def save(
        self,
        data: bytes,
        stored_filename: str,
        content_type: str | None = None,
    ) -> str:
        storage_key = stored_filename
        mime = resolve_content_type(stored_filename, content_type)
        response = httpx.put(
            self._object_url(storage_key),
            content=data,
            headers={
                **self._headers(),
                "Content-Type": mime,
                "x-upsert": "true",
            },
            timeout=60.0,
        )
        if response.is_error:
            detail = response.text.strip() or response.reason_phrase
            raise RuntimeError(
                f"Supabase storage upload failed ({response.status_code}): {detail}"
            )
        return storage_key

    def resolve_local_path(self, storage_key: str) -> str:
        local_path = self._tmp_dir / Path(storage_key).name
        if local_path.is_file():
            return str(local_path)

        response = httpx.get(
            self._object_url(storage_key),
            headers=self._headers(),
            timeout=60.0,
        )
        if response.is_error:
            detail = response.text.strip() or response.reason_phrase
            raise RuntimeError(
                f"Supabase storage download failed ({response.status_code}): {detail}"
            )
        local_path.write_bytes(response.content)
        return str(local_path)

    def delete(self, storage_key: str) -> None:
        response = httpx.delete(
            self._object_url(storage_key),
            headers=self._headers(),
            timeout=30.0,
        )
        if response.status_code not in (200, 404):
            detail = response.text.strip() or response.reason_phrase
            raise RuntimeError(
                f"Supabase storage delete failed ({response.status_code}): {detail}"
            )
        cached = self._tmp_dir / Path(storage_key).name
        if cached.is_file():
            cached.unlink()

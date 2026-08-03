import tempfile
from pathlib import Path

import httpx


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
        return f"{self.base_url}/storage/v1/object/{self.bucket}/{storage_key}"

    def save(self, data: bytes, stored_filename: str) -> str:
        storage_key = stored_filename
        response = httpx.put(
            self._object_url(storage_key),
            content=data,
            headers={
                **self._headers(),
                "Content-Type": "application/octet-stream",
                "x-upsert": "true",
            },
            timeout=60.0,
        )
        response.raise_for_status()
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
        response.raise_for_status()
        local_path.write_bytes(response.content)
        return str(local_path)

    def delete(self, storage_key: str) -> None:
        response = httpx.delete(
            self._object_url(storage_key),
            headers=self._headers(),
            timeout=30.0,
        )
        if response.status_code not in (200, 404):
            response.raise_for_status()
        cached = self._tmp_dir / Path(storage_key).name
        if cached.is_file():
            cached.unlink()

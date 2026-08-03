import os
from pathlib import Path


class LocalStorageAdapter:
    def __init__(self, upload_dir: str):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save(self, data: bytes, stored_filename: str) -> str:
        path = self.upload_dir / stored_filename
        path.write_bytes(data)
        return str(path)

    def resolve_local_path(self, storage_key: str) -> str:
        path = Path(storage_key)
        if not path.is_file():
            raise FileNotFoundError(f"Local object not found: {storage_key}")
        return str(path)

    def delete(self, storage_key: str) -> None:
        path = Path(storage_key)
        if path.is_file():
            os.remove(path)

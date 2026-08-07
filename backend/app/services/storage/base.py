from typing import Protocol


class StorageAdapter(Protocol):
    """Object storage boundary for document binaries (PAS-02)."""

    def save(
        self,
        data: bytes,
        stored_filename: str,
        content_type: str | None = None,
    ) -> str:
        """Persist bytes; return storage key stored on Document.file_path."""

    def resolve_local_path(self, storage_key: str) -> str:
        """Return a filesystem path suitable for OCR tools."""

    def delete(self, storage_key: str) -> None:
        """Best-effort delete of the object."""

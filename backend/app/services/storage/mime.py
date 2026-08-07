"""MIME helpers for storage uploads (Supabase buckets often restrict types)."""

from __future__ import annotations

from pathlib import Path

_EXT_TO_MIME = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def resolve_content_type(
    filename: str | None,
    content_type: str | None = None,
) -> str:
    """Prefer the client Content-Type when usable; else infer from extension."""
    if content_type and content_type != "application/octet-stream":
        return content_type
    suffix = Path(filename or "").suffix.lower()
    return _EXT_TO_MIME.get(suffix, "application/pdf")

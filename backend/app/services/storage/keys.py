"""Safe object keys for storage backends (Supabase rejects spaces / many special chars)."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

_SAFE_EXT = re.compile(r"\.[A-Za-z0-9]{1,16}$")


def build_stored_filename(original_filename: str | None) -> str:
    """Return `{uuid}{ext}` with an ASCII-safe extension only.

    Original display names stay on Document.original_filename; the object key
    must be S3/Supabase-safe (no spaces or non-ASCII).
    """
    suffix = Path(original_filename or "").suffix.lower()
    if not suffix or not _SAFE_EXT.fullmatch(suffix):
        suffix = ".bin"
    return f"{uuid.uuid4()}{suffix}"

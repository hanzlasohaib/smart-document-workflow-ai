import re
from pathlib import Path
from unittest.mock import MagicMock

from app.services.jobs import enqueue_document_processing
from app.services.storage.keys import build_stored_filename
from app.services.storage.local import LocalStorageAdapter
from app.services.storage.mime import resolve_content_type
from app.services.storage.supabase import SupabaseStorageAdapter


def test_local_storage_save_and_resolve(tmp_path: Path):
    adapter = LocalStorageAdapter(str(tmp_path))
    key = adapter.save(b"hello", "doc.bin")
    assert Path(key).is_file()
    assert adapter.resolve_local_path(key) == key
    adapter.delete(key)
    assert not Path(key).exists()


def test_build_stored_filename_strips_spaces_and_keeps_ext():
    key = build_stored_filename("Rhombix Technologies Completion Certificate.pdf")
    assert " " not in key
    assert key.endswith(".pdf")
    assert re.fullmatch(
        r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf",
        key,
    )


def test_build_stored_filename_fallback_ext():
    key = build_stored_filename("weird name")
    assert key.endswith(".bin")


def test_supabase_object_url_encodes_segments():
    adapter = SupabaseStorageAdapter(
        "https://example.supabase.co",
        "service-key",
        "documents",
    )
    url = adapter._object_url("folder/my file.pdf")
    assert url.endswith("/documents/folder/my%20file.pdf")


def test_resolve_content_type_prefers_client_and_infers_pdf():
    assert resolve_content_type("x.pdf", "application/pdf") == "application/pdf"
    assert resolve_content_type("x.pdf", "application/octet-stream") == "application/pdf"
    assert resolve_content_type("scan.png", None) == "image/png"


def test_enqueue_uses_background_tasks():
    tasks = MagicMock()
    enqueue_document_processing(42, tasks)
    tasks.add_task.assert_called_once()
    args = tasks.add_task.call_args[0]
    assert args[1] == 42

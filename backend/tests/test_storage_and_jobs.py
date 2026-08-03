from pathlib import Path
from unittest.mock import MagicMock

from app.services.jobs import enqueue_document_processing
from app.services.storage.local import LocalStorageAdapter


def test_local_storage_save_and_resolve(tmp_path: Path):
    adapter = LocalStorageAdapter(str(tmp_path))
    key = adapter.save(b"hello", "doc.bin")
    assert Path(key).is_file()
    assert adapter.resolve_local_path(key) == key
    adapter.delete(key)
    assert not Path(key).exists()


def test_enqueue_uses_background_tasks():
    tasks = MagicMock()
    enqueue_document_processing(42, tasks)
    tasks.add_task.assert_called_once()
    args = tasks.add_task.call_args[0]
    assert args[1] == 42

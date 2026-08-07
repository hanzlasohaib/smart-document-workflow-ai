"""Document delete (owner/admin) + storage cleanup."""

from pathlib import Path
from unittest.mock import MagicMock

from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.notification import Notification
from app.services.storage import get_storage
from tests.conftest import API_PREFIX, auth_header


def test_owner_can_delete_document(client, user, owned_document, db, tmp_path, monkeypatch):
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path))
    get_storage.cache_clear()

    storage = get_storage()
    key = storage.save(b"pdf-bytes", "keep.pdf")
    owned_document.file_path = key
    db.commit()

    response = client.delete(
        f"{API_PREFIX}/documents/{owned_document.id}",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    assert db.query(Document).filter(Document.id == owned_document.id).first() is None
    assert (
        db.query(ExtractedField)
        .filter(ExtractedField.document_id == owned_document.id)
        .count()
        == 0
    )
    assert not Path(key).exists()
    get_storage.cache_clear()


def test_other_user_cannot_delete_document(client, other_user, owned_document):
    response = client.delete(
        f"{API_PREFIX}/documents/{owned_document.id}",
        headers=auth_header(other_user),
    )
    assert response.status_code == 403


def test_admin_can_delete_any_document(client, admin, owned_document, db, monkeypatch):
    mock_storage = MagicMock()
    monkeypatch.setattr("app.routes.documents.get_storage", lambda: mock_storage)

    response = client.delete(
        f"{API_PREFIX}/documents/{owned_document.id}",
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    assert db.query(Document).filter(Document.id == owned_document.id).first() is None
    mock_storage.delete.assert_called_once()


def test_delete_clears_notification_document_id(client, user, owned_document, db, monkeypatch):
    monkeypatch.setattr("app.routes.documents.get_storage", lambda: MagicMock())
    n = Notification(
        user_id=user.id,
        document_id=owned_document.id,
        title="Needs review",
        message="Check it",
        is_read=False,
    )
    db.add(n)
    db.commit()
    nid = n.id

    response = client.delete(
        f"{API_PREFIX}/documents/{owned_document.id}",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    db.expire_all()
    leftover = db.query(Notification).filter(Notification.id == nid).first()
    assert leftover is not None
    assert leftover.document_id is None

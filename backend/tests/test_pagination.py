"""List endpoint pagination (P3)."""

from app.models.document import Document
from app.models.notification import Notification
from tests.conftest import API_PREFIX, auth_header


def _seed_docs(db, user, count: int) -> None:
    for i in range(count):
        db.add(
            Document(
                user_id=user.id,
                original_filename=f"doc-{i}.pdf",
                stored_filename=f"stored-{i}.pdf",
                file_path=f"/tmp/stored-{i}.pdf",
                status="uploaded",
                approval_status="pending",
            )
        )
    db.commit()


def test_my_documents_paginated(client, user, db):
    _seed_docs(db, user, 5)
    response = client.get(
        f"{API_PREFIX}/documents/my",
        params={"page": 1, "page_size": 2},
        headers=auth_header(user),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 5
    assert body["page"] == 1
    assert body["page_size"] == 2
    assert body["pages"] == 3
    assert len(body["items"]) == 2


def test_pending_documents_paginated(client, admin, user, db):
    _seed_docs(db, user, 3)
    response = client.get(
        f"{API_PREFIX}/documents/pending",
        params={"page": 1, "page_size": 2},
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert len(body["items"]) == 2


def test_notifications_paginated(client, user, db):
    for i in range(4):
        db.add(
            Notification(
                user_id=user.id,
                title=f"n-{i}",
                message="msg",
                is_read=False,
            )
        )
    db.commit()

    response = client.get(
        f"{API_PREFIX}/notifications/",
        params={"page": 2, "page_size": 2},
        headers=auth_header(user),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 4
    assert body["page"] == 2
    assert len(body["items"]) == 2


def test_get_document_by_id(client, user, owned_document):
    response = client.get(
        f"{API_PREFIX}/documents/{owned_document.id}",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    assert response.json()["id"] == owned_document.id

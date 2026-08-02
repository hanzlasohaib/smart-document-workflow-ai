"""PAS-03 capability matrix cells for review and approval."""

from tests.conftest import auth_header


def test_review_requires_auth(client, owned_document):
    response = client.get(f"/review/document/{owned_document.id}")
    assert response.status_code == 401


def test_owner_can_read_review_fields(client, user, owned_document):
    response = client.get(
        f"/review/document/{owned_document.id}",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_other_user_cannot_read_review_fields(client, other_user, owned_document):
    response = client.get(
        f"/review/document/{owned_document.id}",
        headers=auth_header(other_user),
    )
    assert response.status_code == 403


def test_admin_can_read_any_review_fields(client, admin, owned_document):
    response = client.get(
        f"/review/document/{owned_document.id}",
        headers=auth_header(admin),
    )
    assert response.status_code == 200


def test_user_cannot_approve(client, user, owned_document):
    response = client.post(
        f"/documents/{owned_document.id}/approve",
        headers=auth_header(user),
    )
    assert response.status_code == 403


def test_user_cannot_reject(client, user, owned_document):
    response = client.post(
        f"/documents/{owned_document.id}/reject",
        headers=auth_header(user),
    )
    assert response.status_code == 403


def test_admin_can_approve(client, admin, owned_document, db):
    response = client.post(
        f"/documents/{owned_document.id}/approve",
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    db.refresh(owned_document)
    assert owned_document.approval_status == "approved"


def test_user_cannot_list_pending(client, user):
    response = client.get("/documents/pending", headers=auth_header(user))
    assert response.status_code == 403


def test_admin_can_list_pending(client, admin, owned_document):
    response = client.get("/documents/pending", headers=auth_header(admin))
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_user_cannot_list_all_documents(client, user):
    response = client.get("/documents/", headers=auth_header(user))
    assert response.status_code == 403


def test_owner_can_verify_own_field(client, user, owned_document, db):
    field_id = owned_document.extracted_fields[0].id
    response = client.put(
        f"/review/field/{field_id}?value=Updated+Name",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    db.refresh(owned_document.extracted_fields[0])
    assert owned_document.extracted_fields[0].is_verified is True


def test_other_user_cannot_verify_field(client, other_user, owned_document):
    field_id = owned_document.extracted_fields[0].id
    response = client.put(
        f"/review/field/{field_id}?value=Hacked",
        headers=auth_header(other_user),
    )
    assert response.status_code == 403

"""Approve can complete needs_review → processed and trigger Resend."""

from unittest.mock import MagicMock, patch

from app.models.extracted_field import ExtractedField
from tests.conftest import API_PREFIX, auth_header


def _verify_all_fields(client, db, document, headers):
    fields = (
        db.query(ExtractedField)
        .filter(ExtractedField.document_id == document.id)
        .all()
    )
    for field in fields:
        response = client.put(
            f"{API_PREFIX}/review/field/{field.id}?value={field.field_value}",
            headers=headers,
        )
        assert response.status_code == 200


def test_approve_without_verified_fields_keeps_needs_review(
    client, admin, owned_document, db
):
    response = client.post(
        f"{API_PREFIX}/documents/{owned_document.id}/approve",
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    db.refresh(owned_document)
    assert owned_document.approval_status == "approved"
    assert owned_document.status == "needs_review"


def test_approve_after_verify_transitions_needs_review_to_processed(
    client, user, admin, owned_document, db
):
    _verify_all_fields(client, db, owned_document, auth_header(user))

    with patch(
        "app.routes.documents.maybe_notify_document_processed",
        MagicMock(),
    ) as notify:
        response = client.post(
            f"{API_PREFIX}/documents/{owned_document.id}/approve",
            headers=auth_header(admin),
        )
        assert response.status_code == 200
        notify.assert_called_once()
        assert notify.call_args.args[0].id == owned_document.id

    db.refresh(owned_document)
    assert owned_document.approval_status == "approved"
    assert owned_document.status == "processed"


def test_approve_processed_triggers_resend_with_owner_email(
    client, user, admin, owned_document, db, monkeypatch
):
    _verify_all_fields(client, db, owned_document, auth_header(user))

    monkeypatch.setattr(
        "app.services.email_service.settings.RESEND_API_KEY",
        "re_test_key",
    )
    monkeypatch.setattr(
        "app.services.email_service.settings.RESEND_FROM_EMAIL",
        "Smart Docs <noreply@example.com>",
    )
    send = MagicMock(return_value={"id": "email_approve_1"})
    monkeypatch.setattr("app.services.email_service.resend.Emails.send", send)

    response = client.post(
        f"{API_PREFIX}/documents/{owned_document.id}/approve",
        headers=auth_header(admin),
    )
    assert response.status_code == 200

    db.refresh(owned_document)
    assert owned_document.status == "processed"
    send.assert_called_once()
    params = send.call_args.args[0]
    assert params["to"] == [user.email]
    assert "resume.pdf" in params["subject"]
    assert "processed" in params["html"]

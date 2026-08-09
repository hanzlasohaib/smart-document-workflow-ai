"""Resend transactional email — client mocked; delivery failures must not raise."""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.models.document import Document
from app.services import email_service
from app.services.document_pipeline_service import process_document_pipeline


@pytest.fixture()
def resend_settings(monkeypatch):
    monkeypatch.setattr(email_service.settings, "RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr(
        email_service.settings,
        "RESEND_FROM_EMAIL",
        "Smart Docs <noreply@example.com>",
    )


def test_send_email_skips_when_not_configured(monkeypatch):
    monkeypatch.setattr(email_service.settings, "RESEND_API_KEY", None)
    monkeypatch.setattr(email_service.settings, "RESEND_FROM_EMAIL", None)
    send = MagicMock()
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    assert email_service.send_email(to="a@example.com", subject="s", html="<p>x</p>") is False
    send.assert_not_called()


def test_send_email_success(resend_settings, monkeypatch):
    send = MagicMock(return_value={"id": "email_123"})
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    ok = email_service.send_email(
        to="owner@example.com",
        subject="Hello",
        html="<p>hi</p>",
        text="hi",
    )

    assert ok is True
    send.assert_called_once()
    params = send.call_args.args[0]
    assert params["to"] == ["owner@example.com"]
    assert params["from"] == "Smart Docs <noreply@example.com>"
    assert params["subject"] == "Hello"
    assert params["html"] == "<p>hi</p>"
    assert params["text"] == "hi"
    assert email_service.resend.api_key == "re_test_key"


def test_send_email_failure_returns_false_without_raising(resend_settings, monkeypatch):
    send = MagicMock(side_effect=RuntimeError("resend down"))
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    assert email_service.send_email(to="a@example.com", subject="s", html="<p>x</p>") is False


def test_send_document_processed_email_includes_name_and_status(resend_settings, monkeypatch):
    send = MagicMock(return_value={"id": "email_456"})
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    ok = email_service.send_document_processed_email(
        to_email="owner@example.com",
        document_name="invoice.pdf",
        status="processed",
    )

    assert ok is True
    params = send.call_args.args[0]
    assert "invoice.pdf" in params["subject"]
    assert "invoice.pdf" in params["html"]
    assert "processed" in params["html"]
    assert "invoice.pdf" in params["text"]
    assert "processed" in params["text"]


def test_maybe_notify_document_processed_sends_to_owner(resend_settings, monkeypatch):
    send = MagicMock(return_value={"id": "email_789"})
    monkeypatch.setattr(email_service.resend.Emails, "send", send)

    owner = SimpleNamespace(email="owner@example.com")
    document = SimpleNamespace(
        id=42,
        user=owner,
        original_filename="resume.pdf",
        status="processed",
    )

    email_service.maybe_notify_document_processed(document)

    send.assert_called_once()
    params = send.call_args.args[0]
    assert params["to"] == ["owner@example.com"]
    assert "resume.pdf" in params["subject"]


def test_maybe_notify_swallows_unexpected_errors(monkeypatch):
    monkeypatch.setattr(
        email_service,
        "send_document_processed_email",
        MagicMock(side_effect=RuntimeError("boom")),
    )
    owner = SimpleNamespace(email="owner@example.com")
    document = SimpleNamespace(
        id=1,
        user=owner,
        original_filename="a.pdf",
        status="processed",
    )

    email_service.maybe_notify_document_processed(document)


def test_pipeline_notifies_owner_on_processed(db, user, monkeypatch):
    doc = Document(
        user_id=user.id,
        original_filename="ok.pdf",
        stored_filename="stored.pdf",
        file_path="stored.pdf",
        status="uploaded",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    class _SessionFactory:
        def __call__(self):
            return db

        def close(self):
            pass

    # Pipeline owns SessionLocal(); reuse the test session and ignore close().
    monkeypatch.setattr(
        "app.services.document_pipeline_service.SessionLocal",
        lambda: db,
    )
    monkeypatch.setattr(db, "close", lambda: None)

    storage = MagicMock()
    storage.resolve_local_path.return_value = "/tmp/ok.pdf"
    monkeypatch.setattr(
        "app.services.document_pipeline_service.get_storage",
        lambda: storage,
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.run_ocr",
        lambda _path: "Sample resume text for classification.",
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.classify_text",
        lambda _text: ("Resume", 0.95),
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.extract_fields",
        lambda _label, _text: {"name": "Ada"},
    )

    notify = MagicMock()
    monkeypatch.setattr(
        "app.services.document_pipeline_service.maybe_notify_document_processed",
        notify,
    )

    process_document_pipeline(doc.id)

    db.refresh(doc)
    assert doc.status == "processed"
    notify.assert_called_once()
    assert notify.call_args.args[0].id == doc.id


def test_pipeline_skips_email_when_needs_review(db, user, monkeypatch):
    doc = Document(
        user_id=user.id,
        original_filename="low.pdf",
        stored_filename="stored-low.pdf",
        file_path="stored-low.pdf",
        status="uploaded",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    monkeypatch.setattr(
        "app.services.document_pipeline_service.SessionLocal",
        lambda: db,
    )
    monkeypatch.setattr(db, "close", lambda: None)

    storage = MagicMock()
    storage.resolve_local_path.return_value = "/tmp/low.pdf"
    monkeypatch.setattr(
        "app.services.document_pipeline_service.get_storage",
        lambda: storage,
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.run_ocr",
        lambda _path: "Unclear document text.",
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.classify_text",
        lambda _text: ("Unknown", 0.10),
    )
    monkeypatch.setattr(
        "app.services.document_pipeline_service.extract_fields",
        lambda _label, _text: {},
    )

    notify = MagicMock()
    monkeypatch.setattr(
        "app.services.document_pipeline_service.maybe_notify_document_processed",
        notify,
    )

    process_document_pipeline(doc.id)

    db.refresh(doc)
    assert doc.status == "needs_review"
    notify.assert_not_called()

"""Transactional email via Resend (optional; best-effort, never breaks callers)."""

from __future__ import annotations

import logging
from html import escape

import resend

from app.core.config import settings
from app.models.document import Document

logger = logging.getLogger(__name__)


def send_email(*, to: str, subject: str, html: str, text: str | None = None) -> bool:
    """
    Send a single transactional email through Resend.

    Returns True on success, False if skipped (not configured) or delivery fails.
    Never raises — callers must not depend on email for workflow correctness.
    """
    if not settings.resend_configured():
        logger.debug("Resend not configured; skipping email to %s", to)
        return False

    try:
        resend.api_key = settings.RESEND_API_KEY
        params: dict = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if text:
            params["text"] = text
        result = resend.Emails.send(params)
        email_id = result.get("id") if isinstance(result, dict) else getattr(result, "id", None)
        logger.info("Resend email sent to %s (id=%s)", to, email_id)
        return True
    except Exception as exc:
        logger.error("Resend email delivery failed to %s: %s", to, exc)
        return False


def send_document_processed_email(
    *,
    to_email: str,
    document_name: str,
    status: str = "processed",
) -> bool:
    """Notify the document owner that processing finished successfully."""
    safe_name = escape(document_name)
    safe_status = escape(status)
    subject = f"Document processed: {document_name}"
    text = (
        f"Your document '{document_name}' finished processing.\n"
        f"Status: {status}\n"
    )
    html = (
        f"<p>Your document <strong>{safe_name}</strong> finished processing.</p>"
        f"<p>Status: <strong>{safe_status}</strong></p>"
    )
    return send_email(to=to_email, subject=subject, html=html, text=text)


def send_admin_otp_email(*, to_email: str, code: str) -> bool:
    """Send an administrator login verification code. Never log the code."""
    subject = "Administrator login verification code"
    text = (
        "Your administrator login verification code for Smart Document Workflow is:\n\n"
        f"{code}\n\n"
        "This code expires shortly. If you did not attempt to sign in, ignore this email.\n"
    )
    html = (
        "<p>Your <strong>administrator login verification code</strong> "
        "for Smart Document Workflow is:</p>"
        f"<p style=\"font-size:24px;letter-spacing:4px;\"><strong>{escape(code)}</strong></p>"
        "<p>This code expires shortly. If you did not attempt to sign in, ignore this email.</p>"
    )
    # Intentionally do not include the OTP value in log messages.
    logger.info("Sending admin OTP email to %s", to_email)
    return send_email(to=to_email, subject=subject, html=html, text=text)


def maybe_notify_document_processed(document: Document) -> None:
    """
    Best-effort owner email when pipeline status is processed.
    Swallows all errors so the document pipeline is never interrupted.
    """
    try:
        owner = document.user
        if owner is None or not owner.email:
            logger.warning(
                "Skipping processing email for doc %s: owner email unavailable",
                document.id,
            )
            return
        send_document_processed_email(
            to_email=owner.email,
            document_name=document.original_filename or "document",
            status=document.status or "processed",
        )
    except Exception as exc:
        logger.error(
            "Unexpected error sending processing email for doc %s: %s",
            getattr(document, "id", None),
            exc,
        )

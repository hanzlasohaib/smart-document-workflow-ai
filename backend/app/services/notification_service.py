"""Status-accurate notification emission (PAS-04 ADR-04-006)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.notification import Notification

EVENT_COPY: dict[str, tuple[str, str]] = {
    "document.processed": (
        "Document processed",
        "Your document '{filename}' was processed successfully.",
    ),
    "document.needs_review": (
        "Document needs review",
        "Your document '{filename}' needs review before it can proceed.",
    ),
    "document.failed": (
        "Document processing failed",
        "Processing failed for your document '{filename}'.",
    ),
    "document.approved": (
        "Document approved",
        "Your document '{filename}' was approved.",
    ),
    "document.rejected": (
        "Document rejected",
        "Your document '{filename}' was rejected.",
    ),
    "workflow.started": (
        "Workflow started",
        "A workflow has started for your document '{filename}'.",
    ),
}


def emit_document_event(db: Session, document: Document, event: str) -> Notification | None:
    copy = EVENT_COPY.get(event)
    if not copy:
        return None

    title, message_template = copy
    notification = Notification(
        user_id=document.user_id,
        title=title,
        message=message_template.format(filename=document.original_filename),
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def event_for_status(status: str) -> str | None:
    mapping = {
        "processed": "document.processed",
        "needs_review": "document.needs_review",
        "failed": "document.failed",
    }
    return mapping.get(status)

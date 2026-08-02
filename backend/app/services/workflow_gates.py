"""Workflow eligibility gates (PAS-04 ADR-04-003)."""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.models.automation_log import AutomationLog
from app.models.document import Document
from app.services.automation_service import WORKFLOW_STARTED_ACTION, trigger_workflow

logger = logging.getLogger(__name__)

# Type-specific required fields that must exist and be verified before workflow.
REQUIRED_FIELDS_BY_TYPE: dict[str, set[str]] = {
    "Resume": {"name", "email"},
    "Invoice": {"amount", "invoice_number"},
    "Form": {"name"},
}


def required_fields_verified(document: Document) -> bool:
    required = REQUIRED_FIELDS_BY_TYPE.get(document.document_type or "", set())
    if not required:
        return False

    fields_by_name = {f.field_name: f for f in document.extracted_fields}
    for name in required:
        field = fields_by_name.get(name)
        if field is None or not field.is_verified:
            return False
    return True


def approval_gate_satisfied(document: Document) -> bool:
    return document.approval_status == "approved"


def gates_satisfied(document: Document) -> bool:
    return required_fields_verified(document) and approval_gate_satisfied(document)


def workflow_already_started(db: Session, document_id: int) -> bool:
    return (
        db.query(AutomationLog)
        .filter(
            AutomationLog.document_id == document_id,
            AutomationLog.action_type == WORKFLOW_STARTED_ACTION,
        )
        .first()
        is not None
    )


def maybe_run_workflow(db: Session, document: Document) -> bool:
    """
    Re-check gates after human verify/approve events.
    Returns True if workflow was triggered.
    """
    db.refresh(document)

    if workflow_already_started(db, document.id):
        logger.info("Workflow already started for doc %s; skipping", document.id)
        return False

    if not gates_satisfied(document):
        logger.info(
            "Gates not satisfied for doc %s (approval=%s, type=%s); skipping workflow",
            document.id,
            document.approval_status,
            document.document_type,
        )
        return False

    trigger_workflow(db, document)
    return True

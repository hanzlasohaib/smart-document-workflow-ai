"""Type-routed workflows with observable side effects (PAS-04)."""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.models.automation_log import AutomationLog
from app.models.document import Document
from app.services.notification_service import emit_document_event

logger = logging.getLogger(__name__)

WORKFLOW_STARTED_ACTION = "workflow.started"


def trigger_workflow(db: Session, document: Document) -> None:
    logger.info("Automation started for doc %s (%s)", document.id, document.document_type)

    if document.document_type == "Invoice":
        run_invoice_workflow(db, document)
    elif document.document_type == "Resume":
        run_hr_workflow(db, document)
    elif document.document_type == "Form":
        run_form_workflow(db, document)
    else:
        log = AutomationLog(
            document_id=document.id,
            action_type="workflow.skipped",
            status="no_lane",
        )
        db.add(log)
        db.commit()
        logger.warning("No workflow lane for type %s", document.document_type)
        return

    _record_workflow_started(db, document)


def _record_workflow_started(db: Session, document: Document) -> None:
    log = AutomationLog(
        document_id=document.id,
        action_type=WORKFLOW_STARTED_ACTION,
        status="success",
    )
    db.add(log)
    db.commit()
    emit_document_event(db, document, "workflow.started")


def run_invoice_workflow(db: Session, document: Document) -> None:
    logger.info("Invoice workflow for doc %s", document.id)
    db.add(
        AutomationLog(
            document_id=document.id,
            action_type="invoice workflow started",
            status="success",
        )
    )
    db.commit()


def run_hr_workflow(db: Session, document: Document) -> None:
    logger.info("HR workflow for doc %s", document.id)
    db.add(
        AutomationLog(
            document_id=document.id,
            action_type="resume workflow started",
            status="success",
        )
    )
    db.commit()


def run_form_workflow(db: Session, document: Document) -> None:
    logger.info("Form workflow for doc %s", document.id)
    db.add(
        AutomationLog(
            document_id=document.id,
            action_type="form workflow started",
            status="success",
        )
    )
    db.commit()

import logging

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.automation_log import AutomationLog
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.services.classification_service import classify_text
from app.services.extraction_service import extract_fields
from app.services.notification_service import emit_document_event, event_for_status
from app.services.ocr_service import run_ocr

logger = logging.getLogger(__name__)


def process_document_pipeline(document_id: int):
    db = SessionLocal()
    document = None

    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            logger.error("Document not found: %s", document_id)
            return

        logger.info("Pipeline started for doc %s", document.id)

        document.status = "processing"
        db.commit()

        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="processing.started",
                status="success",
            )
        )
        db.commit()

        # 1. OCR
        text = run_ocr(document.file_path)
        document.raw_text = text
        db.commit()

        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="ocr.completed",
                status="success",
            )
        )
        db.commit()

        # Empty / near-empty OCR → needs_review (PAS-04)
        if not text or not text.strip():
            document.status = "needs_review"
            document.document_type = None
            document.confidence_score = 0.0
            db.commit()
            emit_document_event(db, document, "document.needs_review")
            db.add(
                AutomationLog(
                    document_id=document.id,
                    action_type="confidence.decision",
                    status="needs_review_empty_ocr",
                )
            )
            db.commit()
            logger.warning("Empty OCR for doc %s; needs_review", document.id)
            return

        # 2. Classification
        label, confidence = classify_text(text)
        document.document_type = label
        document.confidence_score = confidence
        logger.info("Classified as %s (%s)", label, confidence)

        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="classified",
                status="success",
            )
        )
        db.commit()

        # 3. Extraction
        extracted_data = extract_fields(label, text)
        logger.info("Extracted data: %s", extracted_data)

        for field_name, field_value in extracted_data.items():
            db.add(
                ExtractedField(
                    document_id=document.id,
                    field_name=field_name,
                    field_value=field_value,
                )
            )
        db.commit()

        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="extracted",
                status=f"fields={len(extracted_data)}",
            )
        )
        db.commit()

        # 4. Confidence-based status (no workflow on first pass)
        threshold = settings.CONFIDENCE_THRESHOLD
        if confidence < threshold:
            document.status = "needs_review"
        else:
            document.status = "processed"
        db.commit()

        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="confidence.decision",
                status=document.status,
            )
        )
        db.commit()

        event = event_for_status(document.status)
        if event:
            emit_document_event(db, document, event)

        # Workflow is deferred until verify + approval gates (PAS-04).
        db.add(
            AutomationLog(
                document_id=document.id,
                action_type="workflow.skipped",
                status="awaiting_gates",
            )
        )
        db.commit()

        logger.info("Pipeline completed for doc %s (status=%s)", document.id, document.status)

    except Exception as exc:
        logger.error("Pipeline failed: %s", exc)
        db.rollback()

        if document:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "failed"
                db.commit()
                emit_document_event(db, document, "document.failed")
                db.add(
                    AutomationLog(
                        document_id=document.id,
                        action_type="pipeline.failed",
                        status="failed",
                    )
                )
                db.commit()

    finally:
        db.close()

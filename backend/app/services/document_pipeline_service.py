from app.services.ocr_service import run_ocr
from app.services.classification_service import classify_text
from app.services.extraction_service import extract_fields
from app.services.automation_service import trigger_workflow

from app.db.session import SessionLocal
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.notification import Notification
from app.models.automation_log import AutomationLog

import logging

logger = logging.getLogger(__name__)

def process_document_pipeline(document_id: int):
    db = SessionLocal()
    document = None

    try:
        document = db.query(Document).filter(Document.id == document_id).first()

        if not document:
            logger.error("Document not found")
            return

        logger.info(f"Pipeline started for doc {document.id}")

        document.status = "processing"
        db.commit()

        # 1. OCR
        text = run_ocr(document.file_path)
        document.raw_text = text

        # 2. Classification
        label, confidence = classify_text(text)
        document.document_type = label
        document.confidence_score = confidence

        logger.info(f"Classified as {label} ({confidence})")

        # 3. Extraction
        extracted_data = extract_fields(label, text)
        logger.info(f"Extracted data: {extracted_data}")

        # 4. SAVE TO DB
        for field_name, field_value in extracted_data.items():
            field = ExtractedField(
                document_id=document.id,
                field_name=field_name,
                field_value=field_value
            )
            db.add(field)

        db.commit()

        # 5. Confidence-based status
        if confidence < 0.7:
            document.status = "needs_review"
        else:
            document.status = "processed"

        db.commit()

        # 6. Create Notification
        notification = Notification(
            user_id=document.user_id,
            title="Document Processed",
            message=f"Your document '{document.original_filename}' has been processed and requires review."
        )
        db.add(notification)

        # 7. Automation Log
        log = AutomationLog(
            document_id=document.id,
            action_type=f"{label} processed",
            status="success"
        )
        db.add(log)

        db.commit()

        # 8. Only trigger workflow if verified data exists
        verified_fields = [
            f for f in document.extracted_fields if f.is_verified
        ]

        if not verified_fields:
            logger.warning("No verified data, skipping workflow")
            return

        # 9. Workflow
        trigger_workflow(document)

        logger.info(f"Pipeline completed for doc {document.id}")

    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")

        db.rollback()

        if document:
            document.status = "failed"
            db.commit()

    finally:
        db.close()
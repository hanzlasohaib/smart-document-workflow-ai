from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_owned_or_admin_document, get_owned_or_admin_field
from app.db.deps import get_db
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.services.workflow_gates import maybe_run_workflow

router = APIRouter(prefix="/review", tags=["Review"])


@router.get("/document/{doc_id}")
def get_extracted_fields(
    document: Document = Depends(get_owned_or_admin_document),
    db: Session = Depends(get_db),
):
    return (
        db.query(ExtractedField)
        .filter(ExtractedField.document_id == document.id)
        .all()
    )


@router.put("/field/{field_id}")
def verify_field(
    value: str,
    field: ExtractedField = Depends(get_owned_or_admin_field),
    db: Session = Depends(get_db),
):
    field.field_value = value
    field.is_verified = True
    db.commit()
    db.refresh(field)

    document = db.query(Document).filter(Document.id == field.document_id).first()
    if document:
        maybe_run_workflow(db, document)

    return {"message": "Field updated"}

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_owned_or_admin_document, get_owned_or_admin_field
from app.db.deps import get_db
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.services.workflow_gates import maybe_run_workflow

router = APIRouter(prefix="/review", tags=["Review"])


class FieldVerifyItem(BaseModel):
    id: int
    value: str = ""


class VerifyFieldsBody(BaseModel):
    fields: list[FieldVerifyItem] = Field(default_factory=list)


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


@router.put("/document/{doc_id}/fields")
def verify_document_fields(
    body: VerifyFieldsBody,
    document: Document = Depends(get_owned_or_admin_document),
    db: Session = Depends(get_db),
):
    """Verify (and optionally update) many fields in one request."""
    by_id = {item.id: item.value for item in body.fields}
    if not by_id:
        return {"message": "No fields to update", "updated": 0}

    rows = (
        db.query(ExtractedField)
        .filter(
            ExtractedField.document_id == document.id,
            ExtractedField.id.in_(by_id.keys()),
        )
        .all()
    )
    for field in rows:
        field.field_value = by_id[field.id]
        field.is_verified = True

    db.commit()
    maybe_run_workflow(db, document)
    return {"message": "Fields verified", "updated": len(rows)}


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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.extracted_field import ExtractedField


router = APIRouter(prefix="/review", tags=["Review"])


@router.get("/document/{doc_id}")
def get_extracted_fields(doc_id: int, db: Session = Depends(get_db)):
    fields = db.query(ExtractedField).filter(
        ExtractedField.document_id == doc_id
    ).all()
    return fields

@router.put("/field/{field_id}")
def verify_field(field_id: int, value: str, db: Session = Depends(get_db)):
    field = db.query(ExtractedField).filter(
        ExtractedField.id == field_id
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    field.field_value = value
    field.is_verified = True
    db.commit()

    return {"message": "Field updated"}
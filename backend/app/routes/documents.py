import os
import uuid
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.db.deps import get_db
from app.db.session import SessionLocal
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut
from app.core.security import get_current_user
from app.core.config import settings
from app.services.document_pipeline_service import process_document_pipeline

router = APIRouter(prefix="/documents", tags=["Documents"])


UPLOAD_DIR = settings.UPLOAD_DIR

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentOut)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # Create DB record
    new_document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_path=file_path,
        status="uploaded"
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    background_tasks.add_task(process_document_pipeline, new_document.id)

    return new_document

@router.get("/my", response_model=List[DocumentOut])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).all()

    return documents

@router.get("/", response_model=list[DocumentOut])
def get_all_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    documents = db.query(Document).all()
    return documents
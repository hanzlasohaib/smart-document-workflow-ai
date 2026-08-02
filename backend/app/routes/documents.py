import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut
from app.services.jobs import enqueue_document_processing
from app.services.notification_service import emit_document_event
from app.services.storage import get_storage
from app.services.workflow_gates import maybe_run_workflow

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentOut)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    storage = get_storage()
    storage_key = storage.save(file.file.read(), unique_filename)

    new_document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_path=storage_key,
        status="uploaded",
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    enqueue_document_processing(new_document.id, background_tasks)

    return new_document


@router.post("/{id}/approve")
def approve_document(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    document = db.query(Document).filter(Document.id == id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    document.approval_status = "approved"
    db.commit()
    db.refresh(document)

    emit_document_event(db, document, "document.approved")
    maybe_run_workflow(db, document)

    return {"message": "Document approved"}


@router.post("/{id}/reject")
def reject_document(
    id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    document = db.query(Document).filter(Document.id == id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    document.approval_status = "rejected"
    db.commit()
    db.refresh(document)

    emit_document_event(db, document, "document.rejected")

    return {"message": "Document rejected"}


@router.get("/pending", response_model=List[DocumentOut])
def get_pending_documents(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return (
        db.query(Document)
        .filter(Document.approval_status == "pending")
        .all()
    )


@router.get("/my", response_model=List[DocumentOut])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .all()
    )


@router.get("/", response_model=list[DocumentOut])
def get_all_documents(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Document).all()

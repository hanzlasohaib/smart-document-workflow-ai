import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_owned_or_admin_document, require_admin
from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut
from app.schemas.pagination import Paginated, paginate, to_paginated
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


@router.get("/pending", response_model=Paginated[DocumentOut])
def get_pending_documents(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(Document).filter(Document.approval_status == "pending")
    rows, total, pages = paginate(query, page=page, page_size=page_size)
    return to_paginated(rows, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/my", response_model=Paginated[DocumentOut])
def get_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.id.desc())
    )
    rows, total, pages = paginate(query, page=page, page_size=page_size)
    return to_paginated(rows, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/", response_model=Paginated[DocumentOut])
def get_all_documents(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = db.query(Document).order_by(Document.id.desc())
    rows, total, pages = paginate(query, page=page, page_size=page_size)
    return to_paginated(rows, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    document: Document = Depends(get_owned_or_admin_document),
):
    return document

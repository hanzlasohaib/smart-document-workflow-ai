from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    upload_date = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="uploaded", nullable=False)
    document_type = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)

    raw_text = Column(Text, nullable=True)

    approval_status = Column(String, default="pending")  # pending / approved / rejected

    user = relationship("User", back_populates="documents")


from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    field_name = Column(String, nullable=False)
    field_value = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)

    document = relationship("Document", backref="extracted_fields")

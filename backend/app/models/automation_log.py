from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    action_type = Column(String, nullable=False)
    action_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="success")

    document = relationship("Document", backref="automation_logs")

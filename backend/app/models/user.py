from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)  # renamed for consistency
    role = Column(String, default="user")  # "user" or "admin"
    is_active = Column(Boolean, default=True)

    documents = relationship("Document", back_populates="user", cascade="all, delete")
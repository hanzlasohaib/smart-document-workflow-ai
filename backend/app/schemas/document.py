from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    original_filename: str
    upload_date: datetime
    status: str
    document_type: Optional[str]
    confidence_score: Optional[float]
    raw_text: Optional[str]

    class Config:
        from_attributes = True  # Pydantic v2

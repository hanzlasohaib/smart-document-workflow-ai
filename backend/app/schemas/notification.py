from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    created_at: datetime | None = None
    is_read: bool
    document_id: int | None = None

    model_config = ConfigDict(from_attributes=True)

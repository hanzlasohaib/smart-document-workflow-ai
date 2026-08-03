from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    created_at: datetime | None = None
    is_read: bool

    model_config = ConfigDict(from_attributes=True)

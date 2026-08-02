"""Import all ORM models so Alembic and metadata see the full schema."""

from app.models.user import User
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.notification import Notification
from app.models.automation_log import AutomationLog

__all__ = [
    "User",
    "Document",
    "ExtractedField",
    "Notification",
    "AutomationLog",
]

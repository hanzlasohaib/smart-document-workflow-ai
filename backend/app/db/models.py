"""Import all ORM models so Alembic and metadata see the full schema."""

from app.models.admin_otp_challenge import AdminOtpChallenge
from app.models.automation_log import AutomationLog
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.notification import Notification
from app.models.refresh_token import RefreshToken
from app.models.user import User

__all__ = [
    "User",
    "Document",
    "ExtractedField",
    "Notification",
    "AutomationLog",
    "RefreshToken",
    "AdminOtpChallenge",
]

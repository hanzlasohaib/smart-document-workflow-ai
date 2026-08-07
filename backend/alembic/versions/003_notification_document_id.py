"""Add document_id to notifications for deep links.

Revision ID: 003_notification_document_id
Revises: 002_refresh_tokens
Create Date: 2026-08-07
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "003_notification_document_id"
down_revision: Union[str, Sequence[str], None] = "002_refresh_tokens"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "notifications",
        sa.Column("document_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_notifications_document_id",
        "notifications",
        "documents",
        ["document_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_notifications_document_id"),
        "notifications",
        ["document_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_document_id"), table_name="notifications")
    op.drop_constraint("fk_notifications_document_id", "notifications", type_="foreignkey")
    op.drop_column("notifications", "document_id")

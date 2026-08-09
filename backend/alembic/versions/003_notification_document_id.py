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
    # batch_alter_table is required for SQLite (CI); on Postgres it emits normal ALTERs.
    with op.batch_alter_table("notifications") as batch_op:
        batch_op.add_column(sa.Column("document_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_notifications_document_id",
            "documents",
            ["document_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_index(
            op.f("ix_notifications_document_id"),
            ["document_id"],
            unique=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("notifications") as batch_op:
        batch_op.drop_index(op.f("ix_notifications_document_id"))
        batch_op.drop_constraint(
            "fk_notifications_document_id",
            type_="foreignkey",
        )
        batch_op.drop_column("document_id")

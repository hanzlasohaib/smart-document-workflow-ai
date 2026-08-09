"""Add admin_otp_challenges for admin email OTP login.

Revision ID: 004_admin_otp_challenges
Revises: 003_notification_document_id
Create Date: 2026-08-09
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "004_admin_otp_challenges"
down_revision: Union[str, Sequence[str], None] = "003_notification_document_id"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "admin_otp_challenges",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("challenge_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("max_attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.Column("invalidated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_admin_otp_challenges_id"),
        "admin_otp_challenges",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_admin_otp_challenges_challenge_id"),
        "admin_otp_challenges",
        ["challenge_id"],
        unique=True,
    )
    op.create_index(
        op.f("ix_admin_otp_challenges_user_id"),
        "admin_otp_challenges",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_admin_otp_challenges_user_id"),
        table_name="admin_otp_challenges",
    )
    op.drop_index(
        op.f("ix_admin_otp_challenges_challenge_id"),
        table_name="admin_otp_challenges",
    )
    op.drop_index(op.f("ix_admin_otp_challenges_id"), table_name="admin_otp_challenges")
    op.drop_table("admin_otp_challenges")

"""
Seed or update an administrator account (PAS-03 ADR-03-002).

Usage (from backend/):

    python -m scripts.seed_admin

Requires env:
  DATABASE_URL
  ADMIN_EMAIL
  ADMIN_PASSWORD
Optional:
  ADMIN_NAME (default: Administrator)
  SECRET_KEY (loaded by Settings; required if Settings validates at import)
"""

from __future__ import annotations

import sys

import app.db.models  # noqa: F401
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def seed_admin() -> None:
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD
    name = settings.ADMIN_NAME or "Administrator"

    if not email or not password:
        print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set.", file=sys.stderr)
        sys.exit(1)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.name = name
            user.hashed_password = hash_password(password)
            user.role = "admin"
            user.is_active = True
            action = "updated"
        else:
            user = User(
                name=name,
                email=email,
                hashed_password=hash_password(password),
                role="admin",
                is_active=True,
            )
            db.add(user)
            action = "created"

        db.commit()
        db.refresh(user)
        print(f"Admin {action}: id={user.id} email={user.email} role={user.role}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()

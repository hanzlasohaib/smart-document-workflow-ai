"""
Optional local helper. Prefer Alembic for schema changes:

    alembic upgrade head

Do not use create_all as the production migration path (PAS-03 ADR-03-005).
"""

import app.db.models  # noqa: F401
from app.db.base import Base
from app.db.session import engine


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    print("Prefer: alembic upgrade head")
    print("Running create_all for local convenience only...")
    init_db()
    print("Database tables created (local helper)")

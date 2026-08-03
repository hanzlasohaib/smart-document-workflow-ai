import os
from pathlib import Path

# Must set before importing app modules that load Settings.
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["UPLOAD_DIR"] = str(Path(__file__).resolve().parent / "_uploads")
os.environ["STORAGE_BACKEND"] = "local"
os.environ["CONFIDENCE_THRESHOLD"] = "0.70"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "15"
os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.db.models  # noqa: F401
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.deps import get_db
from app.main import app
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.user import User
from app.services.storage import get_storage

API_PREFIX = "/api/v1"

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    get_storage.cache_clear()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    get_storage.cache_clear()


@pytest.fixture()
def user(db) -> User:
    u = User(
        name="Test User",
        email="user@example.com",
        hashed_password=hash_password("password123"),
        role="user",
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture()
def admin(db) -> User:
    u = User(
        name="Admin User",
        email="admin@example.com",
        hashed_password=hash_password("password123"),
        role="admin",
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@pytest.fixture()
def other_user(db) -> User:
    u = User(
        name="Other User",
        email="other@example.com",
        hashed_password=hash_password("password123"),
        role="user",
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def owned_document(db, user) -> Document:
    doc = Document(
        user_id=user.id,
        original_filename="resume.pdf",
        stored_filename="stored.pdf",
        file_path="/tmp/stored.pdf",
        status="needs_review",
        document_type="Resume",
        confidence_score=0.5,
        approval_status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    for name, value in (("name", "Jane Doe"), ("email", "jane@example.com")):
        db.add(
            ExtractedField(
                document_id=doc.id,
                field_name=name,
                field_value=value,
                is_verified=False,
            )
        )
    db.commit()
    db.refresh(doc)
    return doc

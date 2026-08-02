import hashlib
import secrets
import uuid
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.deps import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def issue_refresh_token(
    db: Session,
    user: User,
    family_id: str | None = None,
) -> str:
    raw_token = secrets.token_urlsafe(48)
    family = family_id or str(uuid.uuid4())
    record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw_token),
        family_id=family,
        expires_at=datetime.utcnow()
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        revoked=False,
    )
    db.add(record)
    db.commit()
    return raw_token


def revoke_refresh_token_record(db: Session, record: RefreshToken) -> None:
    record.revoked = True
    record.revoked_at = datetime.utcnow()
    db.add(record)
    db.commit()


def revoke_refresh_family(db: Session, family_id: str) -> None:
    now = datetime.utcnow()
    (
        db.query(RefreshToken)
        .filter(
            RefreshToken.family_id == family_id,
            RefreshToken.revoked.is_(False),
        )
        .update({"revoked": True, "revoked_at": now}, synchronize_session=False)
    )
    db.commit()


def revoke_user_refresh_tokens(db: Session, user_id: int) -> None:
    now = datetime.utcnow()
    (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked.is_(False),
        )
        .update({"revoked": True, "revoked_at": now}, synchronize_session=False)
    )
    db.commit()


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[User, str]:
    """Validate refresh token, rotate, return (user, new_raw_refresh)."""
    token_hash = hash_refresh_token(raw_token)
    record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if record.revoked:
        # Reuse detection: revoke the whole family
        revoke_refresh_family(db, record.family_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse detected",
        )

    if record.expires_at < datetime.utcnow():
        revoke_refresh_token_record(db, record)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    user = db.query(User).filter(User.id == record.user_id).first()
    if user is None or not user.is_active:
        revoke_refresh_family(db, record.family_id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    revoke_refresh_token_record(db, record)
    new_raw = issue_refresh_token(db, user, family_id=record.family_id)
    return user, new_raw


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user

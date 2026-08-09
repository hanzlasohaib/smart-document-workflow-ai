"""Admin login OTP challenges (hashed, short-lived, one-time)."""

from __future__ import annotations

import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.admin_otp_challenge import AdminOtpChallenge
from app.models.user import User
from app.services.email_service import send_admin_otp_email

logger = logging.getLogger(__name__)


def _hash_otp_code(code: str) -> str:
    material = f"{settings.SECRET_KEY}:admin-otp:{code}".encode("utf-8")
    return hashlib.sha256(material).hexdigest()


def generate_otp_code() -> str:
    length = max(4, min(settings.ADMIN_OTP_LENGTH, 10))
    upper = 10**length
    return f"{secrets.randbelow(upper):0{length}d}"


def invalidate_active_challenges(db: Session, user_id: int) -> None:
    now = datetime.utcnow()
    (
        db.query(AdminOtpChallenge)
        .filter(
            AdminOtpChallenge.user_id == user_id,
            AdminOtpChallenge.consumed_at.is_(None),
            AdminOtpChallenge.invalidated_at.is_(None),
        )
        .update({"invalidated_at": now}, synchronize_session=False)
    )
    db.commit()


def create_admin_otp_challenge(db: Session, user: User) -> tuple[AdminOtpChallenge, str]:
    """
    Create a new OTP challenge for an admin user.
    Returns (challenge_row, plaintext_code). Never log the plaintext code.
    """
    destination = settings.admin_otp_destination()
    if not destination:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin OTP destination is not configured",
        )

    invalidate_active_challenges(db, user.id)

    code = generate_otp_code()
    challenge = AdminOtpChallenge(
        challenge_id=str(uuid.uuid4()),
        user_id=user.id,
        code_hash=_hash_otp_code(code),
        expires_at=datetime.utcnow()
        + timedelta(minutes=settings.ADMIN_OTP_EXPIRE_MINUTES),
        attempts=0,
        max_attempts=settings.ADMIN_OTP_MAX_ATTEMPTS,
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    sent = send_admin_otp_email(to_email=destination, code=code)
    if not sent:
        logger.warning(
            "Admin OTP email was not sent for challenge %s (user_id=%s)",
            challenge.challenge_id,
            user.id,
        )
    else:
        logger.info(
            "Admin OTP challenge created challenge_id=%s user_id=%s",
            challenge.challenge_id,
            user.id,
        )
    return challenge, code


def _get_challenge(db: Session, challenge_id: str) -> AdminOtpChallenge:
    challenge = (
        db.query(AdminOtpChallenge)
        .filter(AdminOtpChallenge.challenge_id == challenge_id)
        .first()
    )
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )
    return challenge


def _ensure_challenge_usable(challenge: AdminOtpChallenge) -> None:
    if challenge.invalidated_at is not None or challenge.consumed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )
    if challenge.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification code expired",
        )
    if challenge.attempts >= challenge.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts. Request a new code.",
        )


def verify_admin_otp(db: Session, challenge_id: str, code: str) -> User:
    challenge = _get_challenge(db, challenge_id)
    _ensure_challenge_usable(challenge)

    challenge.attempts += 1
    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    if not secrets.compare_digest(challenge.code_hash, _hash_otp_code(code.strip())):
        if challenge.attempts >= challenge.max_attempts:
            challenge.invalidated_at = datetime.utcnow()
            db.add(challenge)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many verification attempts. Request a new code.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )

    user = db.query(User).filter(User.id == challenge.user_id).first()
    if user is None or user.role != "admin" or not user.is_active:
        challenge.invalidated_at = datetime.utcnow()
        db.add(challenge)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    challenge.consumed_at = datetime.utcnow()
    db.add(challenge)
    db.commit()
    return user


def resend_admin_otp(db: Session, challenge_id: str) -> AdminOtpChallenge:
    """Invalidate the current challenge and issue a fresh one for the same admin."""
    existing = _get_challenge(db, challenge_id)
    if existing.consumed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired verification code",
        )

    user = db.query(User).filter(User.id == existing.user_id).first()
    if user is None or user.role != "admin" or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    challenge, _code = create_admin_otp_challenge(db, user)
    return challenge

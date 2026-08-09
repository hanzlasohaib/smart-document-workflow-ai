from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import check_rate_limit
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    hash_refresh_token,
    issue_refresh_token,
    revoke_refresh_token_record,
    rotate_refresh_token,
    verify_password,
)
from app.db.deps import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.user import (
    AdminOtpChallengeOut,
    AdminOtpResendRequest,
    AdminOtpVerifyRequest,
    LogoutRequest,
    RefreshRequest,
    Token,
    UserCreate,
    UserOut,
)
from app.services.admin_otp_service import (
    create_admin_otp_challenge,
    resend_admin_otp,
    verify_admin_otp,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _token_pair(db: Session, user: User) -> dict:
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    refresh_token = issue_refresh_token(db, user)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def _otp_challenge_response(challenge_id: str) -> AdminOtpChallengeOut:
    destination = settings.admin_otp_destination() or ""
    return AdminOtpChallengeOut(
        challenge_id=challenge_id,
        otp_destination=destination,
    )


@router.post("/register", response_model=UserOut)
def register_user(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, scope="auth")
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="user",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token | AdminOtpChallengeOut)
def login_user(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    check_rate_limit(request, scope="auth")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    if user.role == "admin":
        challenge, _code = create_admin_otp_challenge(db, user)
        return _otp_challenge_response(challenge.challenge_id)

    return _token_pair(db, user)


@router.post("/admin/verify-otp", response_model=Token)
def verify_admin_login_otp(
    request: Request,
    body: AdminOtpVerifyRequest,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, scope="auth_otp")
    user = verify_admin_otp(db, body.challenge_id, body.code)
    return _token_pair(db, user)


@router.post("/admin/resend-otp", response_model=AdminOtpChallengeOut)
def resend_admin_login_otp(
    request: Request,
    body: AdminOtpResendRequest,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, scope="auth_otp")
    challenge = resend_admin_otp(db, body.challenge_id)
    return _otp_challenge_response(challenge.challenge_id)


@router.post("/refresh", response_model=Token)
def refresh_session(
    request: Request,
    body: RefreshRequest,
    db: Session = Depends(get_db),
):
    check_rate_limit(request, scope="auth")
    user, new_refresh = rotate_refresh_token(db, body.refresh_token)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(
    body: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token_hash = hash_refresh_token(body.refresh_token)
    record = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == current_user.id,
        )
        .first()
    )
    if record and not record.revoked:
        revoke_refresh_token_record(db, record)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

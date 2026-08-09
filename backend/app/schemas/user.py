from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AdminOtpChallengeOut(BaseModel):
    requires_otp: Literal[True] = True
    challenge_id: str
    message: str = "Administrator verification required"
    otp_destination: str


class AdminOtpVerifyRequest(BaseModel):
    challenge_id: str
    code: str = Field(min_length=4, max_length=12)


class AdminOtpResendRequest(BaseModel):
    challenge_id: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str

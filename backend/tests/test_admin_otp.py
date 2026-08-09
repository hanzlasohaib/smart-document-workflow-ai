"""Admin email OTP login challenge flow."""

from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

from app.core.config import settings
from app.models.admin_otp_challenge import AdminOtpChallenge
from app.services import admin_otp_service
from tests.conftest import API_PREFIX


@pytest.fixture()
def otp_destination(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_OTP_EMAIL", "hanzlamaan125@gmail.com")
    monkeypatch.setattr(settings, "ADMIN_EMAIL", "admin@example.com")
    monkeypatch.setattr(settings, "ADMIN_OTP_MAX_ATTEMPTS", 5)
    monkeypatch.setattr(settings, "ADMIN_OTP_EXPIRE_MINUTES", 10)


@pytest.fixture()
def capture_otp(monkeypatch):
    sent: dict = {}

    def fake_send(*, to_email: str, code: str) -> bool:
        sent["to_email"] = to_email
        sent["code"] = code
        return True

    monkeypatch.setattr(admin_otp_service, "send_admin_otp_email", fake_send)
    return sent


def _login_admin(client, email="admin@example.com", password="password123"):
    return client.post(
        f"{API_PREFIX}/auth/login",
        data={"username": email, "password": password},
    )


def test_admin_login_creates_otp_challenge_without_tokens(
    client, admin, otp_destination, capture_otp, db
):
    response = _login_admin(client)
    assert response.status_code == 200
    body = response.json()
    assert body["requires_otp"] is True
    assert body["challenge_id"]
    assert body["otp_destination"] == "hanzlamaan125@gmail.com"
    assert "access_token" not in body
    assert "refresh_token" not in body

    row = (
        db.query(AdminOtpChallenge)
        .filter(AdminOtpChallenge.challenge_id == body["challenge_id"])
        .first()
    )
    assert row is not None
    assert row.user_id == admin.id
    assert row.consumed_at is None
    assert capture_otp["to_email"] == "hanzlamaan125@gmail.com"
    assert capture_otp["code"]
    assert len(capture_otp["code"]) == settings.ADMIN_OTP_LENGTH


def test_admin_login_requests_resend_email(client, admin, otp_destination, monkeypatch):
    send = MagicMock(return_value=True)
    monkeypatch.setattr(admin_otp_service, "send_admin_otp_email", send)

    response = _login_admin(client)
    assert response.status_code == 200
    send.assert_called_once()
    assert send.call_args.kwargs["to_email"] == "hanzlamaan125@gmail.com"
    assert "code" in send.call_args.kwargs


def test_valid_otp_issues_tokens(client, admin, otp_destination, capture_otp):
    challenge = _login_admin(client).json()
    response = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": capture_otp["code"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"

    me = client.get(f"{API_PREFIX}/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["role"] == "admin"


def test_invalid_otp_rejected(client, admin, otp_destination, capture_otp):
    challenge = _login_admin(client).json()
    response = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": "000000"},
    )
    assert response.status_code == 401


def test_expired_otp_rejected(client, admin, otp_destination, capture_otp, db):
    challenge = _login_admin(client).json()
    row = (
        db.query(AdminOtpChallenge)
        .filter(AdminOtpChallenge.challenge_id == challenge["challenge_id"])
        .first()
    )
    row.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db.commit()

    response = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": capture_otp["code"]},
    )
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_reused_otp_rejected(client, admin, otp_destination, capture_otp):
    challenge = _login_admin(client).json()
    code = capture_otp["code"]
    first = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": code},
    )
    assert first.status_code == 200

    second = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": code},
    )
    assert second.status_code == 401


def test_previous_challenge_invalidated_on_new_login(
    client, admin, otp_destination, capture_otp, db
):
    first = _login_admin(client).json()
    first_code = capture_otp["code"]
    second = _login_admin(client).json()
    assert second["challenge_id"] != first["challenge_id"]

    stale = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": first["challenge_id"], "code": first_code},
    )
    assert stale.status_code == 401

    ok = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": second["challenge_id"], "code": capture_otp["code"]},
    )
    assert ok.status_code == 200


def test_excessive_otp_attempts_rejected(client, admin, otp_destination, capture_otp, monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_OTP_MAX_ATTEMPTS", 3)
    challenge = _login_admin(client).json()

    for _ in range(3):
        response = client.post(
            f"{API_PREFIX}/auth/admin/verify-otp",
            json={"challenge_id": challenge["challenge_id"], "code": "111111"},
        )
    assert response.status_code == 429

    locked = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": capture_otp["code"]},
    )
    assert locked.status_code in (401, 429)


def test_non_admin_login_unchanged(client, user):
    response = client.post(
        f"{API_PREFIX}/auth/login",
        data={"username": "user@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body.get("requires_otp") is not True


def test_inactive_admin_rejected_before_otp(client, admin, otp_destination, capture_otp, db):
    admin.is_active = False
    db.commit()

    response = _login_admin(client)
    assert response.status_code == 403
    assert capture_otp == {}


def test_resend_otp_issues_new_challenge(client, admin, otp_destination, capture_otp):
    first = _login_admin(client).json()
    old_code = capture_otp["code"]

    resend = client.post(
        f"{API_PREFIX}/auth/admin/resend-otp",
        json={"challenge_id": first["challenge_id"]},
    )
    assert resend.status_code == 200
    body = resend.json()
    assert body["requires_otp"] is True
    assert body["challenge_id"] != first["challenge_id"]

    stale = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": first["challenge_id"], "code": old_code},
    )
    assert stale.status_code == 401

    ok = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": body["challenge_id"], "code": capture_otp["code"]},
    )
    assert ok.status_code == 200


def test_admin_refresh_and_logout_after_otp(client, admin, otp_destination, capture_otp):
    challenge = _login_admin(client).json()
    tokens = client.post(
        f"{API_PREFIX}/auth/admin/verify-otp",
        json={"challenge_id": challenge["challenge_id"], "code": capture_otp["code"]},
    ).json()

    refreshed = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refreshed.status_code == 200
    assert refreshed.json()["refresh_token"] != tokens["refresh_token"]

    logout = client.post(
        f"{API_PREFIX}/auth/logout",
        headers={"Authorization": f"Bearer {refreshed.json()['access_token']}"},
        json={"refresh_token": refreshed.json()["refresh_token"]},
    )
    assert logout.status_code == 200

    reuse = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": refreshed.json()["refresh_token"]},
    )
    assert reuse.status_code == 401

"""Access + refresh token rotation (PAS-03 ADR-03-004)."""

from tests.conftest import API_PREFIX, auth_header


def _login(client, email: str = "user@example.com", password: str = "password123"):
    return client.post(
        f"{API_PREFIX}/auth/login",
        data={"username": email, "password": password},
    )


def test_login_returns_access_and_refresh(client, user):
    response = _login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


def test_refresh_rotates_token(client, user):
    login = _login(client).json()
    old_refresh = login["refresh_token"]

    refreshed = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert refreshed.status_code == 200
    body = refreshed.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["refresh_token"] != old_refresh

    # Old refresh cannot be reused
    reused = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert reused.status_code == 401


def test_inactive_user_blocked_on_login(client, user, db):
    user.is_active = False
    db.commit()

    response = _login(client)
    assert response.status_code == 403


def test_inactive_user_blocked_on_refresh(client, user, db):
    login = _login(client).json()
    user.is_active = False
    db.commit()

    response = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": login["refresh_token"]},
    )
    assert response.status_code == 403


def test_logout_revokes_refresh(client, user):
    login = _login(client).json()
    response = client.post(
        f"{API_PREFIX}/auth/logout",
        headers=auth_header(user),
        json={"refresh_token": login["refresh_token"]},
    )
    assert response.status_code == 200

    refreshed = client.post(
        f"{API_PREFIX}/auth/refresh",
        json={"refresh_token": login["refresh_token"]},
    )
    assert refreshed.status_code == 401

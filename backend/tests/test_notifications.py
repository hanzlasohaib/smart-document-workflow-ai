"""Notification list + mark-read (PAS-03 / P2)."""

from app.models.notification import Notification
from tests.conftest import API_PREFIX, auth_header


def _seed_notification(db, user_id: int, title: str = "Test") -> Notification:
    n = Notification(
        user_id=user_id,
        title=title,
        message="Hello",
        is_read=False,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def test_list_own_notifications(client, user, other_user, db):
    mine = _seed_notification(db, user.id, "Mine")
    _seed_notification(db, other_user.id, "Theirs")

    response = client.get(
        f"{API_PREFIX}/notifications/",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["id"] == mine.id
    assert body[0]["title"] == "Mine"
    assert body[0]["is_read"] is False


def test_cannot_list_without_auth(client):
    response = client.get(f"{API_PREFIX}/notifications/")
    assert response.status_code == 401


def test_mark_read_own(client, user, db):
    n = _seed_notification(db, user.id)
    response = client.post(
        f"{API_PREFIX}/notifications/{n.id}/read",
        headers=auth_header(user),
    )
    assert response.status_code == 200
    assert response.json()["is_read"] is True


def test_cannot_mark_read_others(client, user, other_user, db):
    n = _seed_notification(db, other_user.id)
    response = client.post(
        f"{API_PREFIX}/notifications/{n.id}/read",
        headers=auth_header(user),
    )
    assert response.status_code == 404


def test_cors_allows_configured_origin(client):
    response = client.options(
        f"{API_PREFIX}/auth/me",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"

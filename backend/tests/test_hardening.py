"""P3 hardening: correlation IDs, security headers, auth rate limits."""

from app.core.rate_limit import reset_rate_limits
from tests.conftest import API_PREFIX


def test_correlation_id_generated(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.headers.get("X-Correlation-ID")


def test_correlation_id_echoed(client):
    response = client.get("/live", headers={"X-Correlation-ID": "test-cid-123"})
    assert response.headers.get("X-Correlation-ID") == "test-cid-123"


def test_security_headers_present(client):
    response = client.get("/live")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_auth_rate_limit_returns_429(client, monkeypatch):
    reset_rate_limits()
    monkeypatch.setattr("app.core.rate_limit.settings.AUTH_RATE_LIMIT_REQUESTS", 3)
    monkeypatch.setattr("app.core.rate_limit.settings.AUTH_RATE_LIMIT_WINDOW_SECONDS", 60)

    for _ in range(3):
        response = client.post(
            f"{API_PREFIX}/auth/login",
            data={"username": "nobody@example.com", "password": "wrong"},
        )
        assert response.status_code in (401, 429)

    limited = client.post(
        f"{API_PREFIX}/auth/login",
        data={"username": "nobody@example.com", "password": "wrong"},
    )
    assert limited.status_code == 429
    reset_rate_limits()

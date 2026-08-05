from unittest.mock import MagicMock


def test_live_ok(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ready_ok_when_db_and_storage_ok(client, monkeypatch):
    mock_conn = MagicMock()
    mock_cm = MagicMock()
    mock_cm.__enter__.return_value = mock_conn
    mock_cm.__exit__.return_value = False

    monkeypatch.setattr("app.main.engine.connect", lambda: mock_cm)

    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert body["storage"] == "ok"


def test_health_alias_matches_ready(client, monkeypatch):
    mock_conn = MagicMock()
    mock_cm = MagicMock()
    mock_cm.__enter__.return_value = mock_conn
    mock_cm.__exit__.return_value = False
    monkeypatch.setattr("app.main.engine.connect", lambda: mock_cm)

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ready_unhealthy_when_db_down(client, monkeypatch):
    def boom():
        raise RuntimeError("db down")

    monkeypatch.setattr("app.main.engine.connect", boom)

    response = client.get("/ready")
    assert response.status_code == 503
    body = response.json()
    assert body["status"] == "unhealthy"
    assert body["database"] == "unreachable"


def test_ready_unhealthy_when_storage_misconfigured(client, monkeypatch):
    mock_conn = MagicMock()
    mock_cm = MagicMock()
    mock_cm.__enter__.return_value = mock_conn
    mock_cm.__exit__.return_value = False
    monkeypatch.setattr("app.main.engine.connect", lambda: mock_cm)
    monkeypatch.setattr(
        "app.main.settings.STORAGE_BACKEND",
        "supabase",
    )
    monkeypatch.setattr("app.main.settings.SUPABASE_URL", None)
    monkeypatch.setattr("app.main.settings.SUPABASE_SERVICE_ROLE_KEY", None)

    response = client.get("/ready")
    assert response.status_code == 503
    assert response.json()["storage"] == "misconfigured"

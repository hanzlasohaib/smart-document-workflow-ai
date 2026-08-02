from unittest.mock import MagicMock


def test_health_ok_when_db_reachable(client, monkeypatch):
    mock_conn = MagicMock()
    mock_cm = MagicMock()
    mock_cm.__enter__.return_value = mock_conn
    mock_cm.__exit__.return_value = False

    monkeypatch.setattr("app.main.engine.connect", lambda: mock_cm)

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_unhealthy_when_db_down(client, monkeypatch):
    def boom():
        raise RuntimeError("db down")

    monkeypatch.setattr("app.main.engine.connect", boom)

    response = client.get("/health")
    assert response.status_code == 503
    assert response.json()["status"] == "unhealthy"

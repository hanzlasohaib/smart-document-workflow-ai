"""Controlled Sentry debug endpoint (opt-in via SENTRY_ENABLE_DEBUG_ENDPOINT)."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes.sentry_debug import router as sentry_debug_router
from app.routes.sentry_debug import trigger_sentry_error


def test_sentry_debug_absent_by_default(client):
    response = client.get("/sentry-debug")
    assert response.status_code == 404


def test_sentry_debug_handler_raises():
    with pytest.raises(RuntimeError, match="Sentry debug test error"):
        trigger_sentry_error()


def test_sentry_debug_returns_500_when_mounted():
    test_app = FastAPI()
    test_app.include_router(sentry_debug_router)
    with TestClient(test_app, raise_server_exceptions=False) as test_client:
        response = test_client.get("/sentry-debug")
    assert response.status_code == 500

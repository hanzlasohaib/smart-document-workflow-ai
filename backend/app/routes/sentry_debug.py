"""Temporary Sentry verification route. Enable only via SENTRY_ENABLE_DEBUG_ENDPOINT."""

from fastapi import APIRouter

router = APIRouter(tags=["Sentry"])


@router.get("/sentry-debug")
def trigger_sentry_error() -> None:
    """Deliberately raise so Sentry can capture a test exception. Remove after verification."""
    raise RuntimeError("Sentry debug test error — safe to ignore")

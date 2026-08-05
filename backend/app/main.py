import logging

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1 import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware, SecurityHeadersMiddleware
from app.db.session import engine
from app.routes import auth, documents, review

configure_logging(settings.LOG_FORMAT)
logger = logging.getLogger(__name__)

if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration

    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.0,
        send_default_pii=False,
    )

app = FastAPI(title="Smart Document Workflow AI")

# Middleware is applied outermost-last in Starlette; add CORS first so it wraps others.
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestContextMiddleware)

cors_origins = settings.cors_origin_list()
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID"],
    )

# Canonical versioned API (PAS-02)
app.include_router(api_router)

# Temporary unversioned shims for P0 clients (prefer /api/v1)
app.include_router(auth.router, deprecated=True)
app.include_router(documents.router, deprecated=True)
app.include_router(review.router, deprecated=True)


@app.get("/")
def read_root():
    return {
        "message": "API is running",
        "api": "/api/v1",
        "docs": "/docs",
        "live": "/live",
        "ready": "/ready",
        "health": "/health",
    }


@app.get("/live")
def live():
    """Liveness: process is up."""
    return {"status": "ok"}


def _readiness_payload(response: Response) -> dict:
    checks: dict[str, str] = {}
    healthy = True

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        logger.error("Readiness DB check failed: %s", exc)
        checks["database"] = "unreachable"
        healthy = False

    if settings.storage_config_ready():
        checks["storage"] = "ok"
    else:
        checks["storage"] = "misconfigured"
        healthy = False

    if not healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unhealthy", **checks}
    return {"status": "ok", **checks}


@app.get("/ready")
def ready(response: Response):
    """Readiness: DB reachable and storage config present."""
    return _readiness_payload(response)


@app.get("/health")
def health(response: Response):
    """Backward-compatible readiness alias (same checks as /ready)."""
    return _readiness_payload(response)

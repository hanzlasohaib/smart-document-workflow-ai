import logging

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1 import api_router
from app.core.config import settings
from app.db.session import engine
from app.routes import auth, documents, review

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Document Workflow AI")

cors_origins = settings.cors_origin_list()
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
        "health": "/health",
    }


@app.get("/health")
def health(response: Response):
    """Readiness: HTTP 200 only when the database is reachable."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unhealthy", "database": "unreachable"}
    return {"status": "ok", "database": "ok"}

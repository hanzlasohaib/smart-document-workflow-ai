"""Simple in-memory sliding-window rate limiter for auth endpoints."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status

from app.core.config import settings

_lock = Lock()
_hits: dict[str, deque[float]] = defaultdict(deque)


def _client_key(request: Request, scope: str) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    else:
        ip = "unknown"
    return f"{scope}:{ip}"


def check_rate_limit(request: Request, scope: str = "auth") -> None:
    """Raise 429 when the client exceeds AUTH_RATE_LIMIT_* settings."""
    limit = settings.AUTH_RATE_LIMIT_REQUESTS
    window = settings.AUTH_RATE_LIMIT_WINDOW_SECONDS
    if limit <= 0 or window <= 0:
        return

    key = _client_key(request, scope)
    now = time.monotonic()
    cutoff = now - window

    with _lock:
        bucket = _hits[key]
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Try again later.",
                headers={"Retry-After": str(window)},
            )
        bucket.append(now)


def reset_rate_limits() -> None:
    """Test helper to clear limiter state."""
    with _lock:
        _hits.clear()

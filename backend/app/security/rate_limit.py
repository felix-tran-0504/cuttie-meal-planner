"""Simple in-memory per-IP rate limiting for expensive endpoints (single-process / dev)."""

from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock

from fastapi import HTTPException, Request

from ..settings import get_settings

_lock = Lock()
# IP -> monotonic timestamps of recent requests
_buckets: dict[str, list[float]] = defaultdict(list)


def _prune_bucket(bucket: list[float], now: float, window: float) -> None:
    while bucket and now - bucket[0] > window:
        bucket.pop(0)


def enforce_suggestions_rate_limit(request: Request) -> None:
    """Raises 429 if this client exceeded the configured suggestion rate."""
    settings = get_settings()
    max_req = max(1, settings.suggestions_rate_limit_max)
    window = float(max(1, settings.suggestions_rate_limit_window_seconds))

    client = request.client
    if client is None:
        return

    ip = client.host
    now = time.monotonic()

    with _lock:
        bucket = _buckets[ip]
        _prune_bucket(bucket, now, window)
        if len(bucket) >= max_req:
            raise HTTPException(
                status_code=429,
                detail="Too many meal-idea requests. Please wait a minute and try again.",
            )
        bucket.append(now)

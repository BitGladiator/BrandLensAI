"""Environment-based configuration for the BrandLens AI backend."""

from __future__ import annotations

import os


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    """Small settings object; values are provided by the process environment."""

    def __init__(self) -> None:
        origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        self.allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        self.ai_review_enabled = _as_bool(os.getenv("AI_REVIEW_ENABLED"), default=False)
        self.ai_review_module = os.getenv("AI_REVIEW_MODULE", "ai_review")
        self.ai_review_function = os.getenv("AI_REVIEW_FUNCTION", "review_draft")
        try:
            timeout = float(os.getenv("AI_REVIEW_TIMEOUT_SECONDS", "15"))
            self.ai_review_timeout_seconds = min(max(timeout, 1.0), 120.0)
        except ValueError:
            self.ai_review_timeout_seconds = 15.0


settings = Settings()

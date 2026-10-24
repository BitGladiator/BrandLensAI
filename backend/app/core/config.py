"""Environment-based configuration for the BrandLens AI backend."""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Automatically load .env from backend/ directory or root directory
_backend_dir = Path(__file__).resolve().parent.parent.parent
_env_backend = _backend_dir / ".env"
_env_root = _backend_dir.parent / ".env"

if _env_backend.is_file():
    load_dotenv(dotenv_path=_env_backend)
elif _env_root.is_file():
    load_dotenv(dotenv_path=_env_root)
else:
    load_dotenv()


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Settings:
    """Settings object populated from environment variables and .env file."""

    def __init__(self) -> None:
        origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        self.allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]

        # Groq Cloud API configuration (using OpenAI GPT OSS models on Groq)
        self.groq_api_key: str | None = os.getenv("GROQ_API_KEY")
        self.groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
        self.groq_base_url: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()
        try:
            groq_timeout = float(os.getenv("GROQ_TIMEOUT_SECONDS", "45"))
            self.groq_timeout_seconds = min(max(groq_timeout, 2.0), 180.0)
        except ValueError:
            self.groq_timeout_seconds = 45.0

        # General AI review configuration
        self.ai_review_enabled = _as_bool(os.getenv("AI_REVIEW_ENABLED"), default=True)
        self.ai_review_module = os.getenv("AI_REVIEW_MODULE", "ai_review")
        self.ai_review_function = os.getenv("AI_REVIEW_FUNCTION", "review_draft")
        try:
            timeout = float(os.getenv("AI_REVIEW_TIMEOUT_SECONDS", "30"))
            self.ai_review_timeout_seconds = min(max(timeout, 1.0), 120.0)
        except ValueError:
            self.ai_review_timeout_seconds = 30.0


settings = Settings()

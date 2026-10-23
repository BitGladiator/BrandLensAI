"""Adapter for Yuvasri's separately owned AI review module.

Expected callable contract:
    review_draft(payload: dict) -> dict | list[dict]

A dictionary result should contain a `findings` list. Each finding supplies
category, severity, excerpt, explanation, and suggestion. It may also supply
id, evidence_ids, and confidence. Provider credentials and prompt/model logic
belong in the separately supplied AI module, not in this backend adapter.
"""

from __future__ import annotations

import asyncio
import importlib
import inspect
import logging
from typing import Any

from pydantic import ValidationError

from app.core.config import settings
from app.schemas.review import Finding

logger = logging.getLogger(__name__)


class AIReviewError(Exception):
    """Safe, user-readable indication that the AI review did not complete."""


async def run_ai_review(payload: dict[str, Any]) -> list[Finding]:
    """Load and call the external AI module without exposing provider errors."""
    try:
        module = importlib.import_module(settings.ai_review_module)
        function = getattr(module, settings.ai_review_function, None)
        if not callable(function):
            raise AIReviewError("Configured AI review function is missing.")

        if inspect.iscoroutinefunction(function):
            raw_result = await asyncio.wait_for(
                function(payload), timeout=settings.ai_review_timeout_seconds
            )
        else:
            raw_result = await asyncio.wait_for(
                asyncio.to_thread(function, payload),
                timeout=settings.ai_review_timeout_seconds,
            )

        if isinstance(raw_result, dict):
            if "findings" not in raw_result:
                raise AIReviewError("AI review response did not contain a findings list.")
            raw_findings = raw_result["findings"]
        elif isinstance(raw_result, list):
            raw_findings = raw_result
        else:
            raise AIReviewError("AI review returned an unsupported response format.")

        if not isinstance(raw_findings, list):
            raise AIReviewError("AI review findings must be a list.")

        findings: list[Finding] = []
        for index, raw_finding in enumerate(raw_findings, start=1):
            if not isinstance(raw_finding, dict):
                raise AIReviewError("An AI finding was not a JSON object.")
            item = dict(raw_finding)
            item.setdefault("id", f"F-AI-{index:03d}")
            item.setdefault("evidence_ids", [])
            item.setdefault("confidence", "medium")
            # Normalize only harmless casing differences in the documented enum fields.
            if isinstance(item.get("severity"), str):
                item["severity"] = item["severity"].strip().capitalize()
            if isinstance(item.get("confidence"), str):
                item["confidence"] = item["confidence"].strip().lower()
            findings.append(Finding.model_validate(item))
        return findings

    except AIReviewError:
        raise
    except (ImportError, AttributeError) as exc:
        logger.warning("AI review module is unavailable (%s).", type(exc).__name__)
        raise AIReviewError(
            "AI review is unavailable. Confirm Yuvasri's module is installed and configured."
        ) from exc
    except asyncio.TimeoutError as exc:
        logger.warning("AI review timed out.")
        raise AIReviewError("AI review timed out. Please try again later.") from exc
    except ValidationError as exc:
        logger.warning("AI review returned invalid finding data.")
        raise AIReviewError("AI review returned invalid finding data.") from exc
    except Exception as exc:  # fail safely if the external module/provider raises
        logger.warning("AI review failed (%s).", type(exc).__name__)
        raise AIReviewError("AI review could not be completed.") from exc

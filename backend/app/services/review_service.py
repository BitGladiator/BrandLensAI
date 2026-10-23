"""Coordinates deterministic checks with the optional AI review module."""

from __future__ import annotations

import logging

from app.core.config import settings
from app.rules.terminology import find_terminology_issues
from app.schemas.review import Finding, ReviewRequest, ReviewResponse
from app.services.ai_review_adapter import AIReviewError, run_ai_review

logger = logging.getLogger(__name__)


async def review_draft(request: ReviewRequest) -> ReviewResponse:
    findings: list[Finding] = find_terminology_issues(request.draft_text, request.approved_terms)
    ai_status = "disabled"

    if settings.ai_review_enabled:
        payload = request.model_dump(mode="json")
        try:
            ai_findings = await run_ai_review(payload)
            findings.extend(ai_findings)
            ai_status = "available"
        except AIReviewError as exc:
            # Do not fail the whole request: the deterministic findings can still help.
            ai_status = "unavailable"
            logger.warning("Continuing with deterministic findings only: %s", str(exc))

    if ai_status == "unavailable":
        summary = (
            "Terminology review completed. AI review is currently unavailable, "
            "so tone and claim/fact findings may be incomplete. Human review is required."
        )
    elif ai_status == "disabled":
        summary = (
            "Terminology review completed. AI review is disabled; only deterministic "
            "terminology checks ran. Human review is required."
        )
    elif findings:
        summary = "Review completed. Findings are suggestions for human review."
    else:
        summary = "Review completed; no issues were found by the enabled checks. Human review is still required."

    return ReviewResponse(
        findings=findings,
        review_summary=summary,
        # The application must never treat machine review as final approval.
        needs_human_review=True,
    )

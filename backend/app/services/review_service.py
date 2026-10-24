"""Coordinates brand review directly through Groq Cloud AI."""

from __future__ import annotations

import logging
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.groq_service import review_draft_with_groq

logger = logging.getLogger(__name__)


async def review_draft(request: ReviewRequest) -> ReviewResponse:
    """Send review request directly to Groq Cloud AI.

    No hardcoded findings or static summaries; every review is evaluated
    in real time by Groq Cloud AI against the provided brand references.
    """
    return await review_draft_with_groq(request)

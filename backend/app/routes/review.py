"""API route for draft content review powered by Groq Cloud AI."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.groq_service import GroqApiError, GroqConfigurationError
from app.services.review_service import review_draft

router = APIRouter(prefix="/api", tags=["review"])


@router.post(
    "/review",
    response_model=ReviewResponse,
    summary="Review draft content against supplied brand references using Groq Cloud AI",
    description=(
        "Sends draft content, brand guidelines, approved terminology, and approved facts "
        "directly to Groq Cloud AI for real-time brand-governance review."
    ),
)
async def review_endpoint(request: ReviewRequest) -> ReviewResponse:
    try:
        return await review_draft(request)
    except GroqConfigurationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except GroqApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

from fastapi import APIRouter

from app.schemas.review import ReviewRequest, ReviewResponse
from app.services.review_service import review_draft

router = APIRouter(prefix="/api", tags=["review"])


@router.post(
    "/review",
    response_model=ReviewResponse,
    summary="Review draft content against supplied brand references",
    description=(
        "Runs deterministic terminology checks and, when configured, calls "
        "Yuvasri's external AI review module for tone and claim/fact review. "
        "Results are advisory and always require human review."
    ),
)
async def review_endpoint(request: ReviewRequest) -> ReviewResponse:
    return await review_draft(request)

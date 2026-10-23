from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/api/health", summary="Check backend health")
def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "BrandLens AI backend",
        "ai_review_enabled": settings.ai_review_enabled,
    }

"""FastAPI application entry point for BrandLens AI."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.health import router as health_router
from app.routes.review import router as review_router

app = FastAPI(
    title="BrandLens AI Backend",
    description=(
        "Brand-governance review API. Findings are advisory; a person must "
        "make the final content decision."
    ),
    version="1.0.0",
)

# Wildcard CORS cannot be combined safely with credentialed requests.
allow_all_origins = "*" in settings.allowed_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else settings.allowed_origins,
    allow_origin_regex=None if allow_all_origins else r"https://.*\.vercel\.app",
    allow_credentials=not allow_all_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    return response


app.include_router(health_router)
app.include_router(review_router)

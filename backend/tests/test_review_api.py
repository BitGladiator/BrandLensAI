"""Tests for the BrandLens AI review API powered by Groq Cloud AI."""

from __future__ import annotations

from unittest.mock import AsyncMock
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.schemas.review import Finding, ReviewResponse
from app.services import review_service

client = TestClient(app)


def test_health_endpoint_reports_backend_up():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "BrandLens AI backend"


def test_review_rejects_missing_groq_api_key():
    """When no Groq key is configured in backend/.env, return 400 Bad Request."""
    settings.groq_api_key = None
    response = client.post(
        "/api/review",
        json={
            "draft_text": "Every consumer can use our service.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        },
    )
    assert response.status_code == 400
    assert "Groq Cloud API key is not configured" in response.json()["detail"]


def test_review_succeeds_with_backend_groq_integration(monkeypatch):
    """When Groq review runs, it returns dynamic findings and dynamic summary."""
    mock_response = ReviewResponse(
        findings=[
            Finding(
                id="F-001",
                category="Terminology",
                severity="Low",
                excerpt="consumer",
                explanation="The brand guidelines prefer customer over consumer.",
                suggestion="customer",
                evidence_ids=["TERM-01"],
                confidence="high",
            )
        ],
        review_summary="Groq Cloud AI completed the review: 1 terminology issue found.",
        needs_human_review=True,
    )

    fake_groq = AsyncMock(return_value=mock_response)
    monkeypatch.setattr(review_service, "review_draft_with_groq", fake_groq)

    response = client.post(
        "/api/review",
        json={
            "draft_text": "Every consumer can use our service.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["findings"]) == 1
    assert body["findings"][0]["category"] == "Terminology"
    assert body["findings"][0]["excerpt"] == "consumer"
    assert "Groq Cloud AI" in body["review_summary"]
    assert body["needs_human_review"] is True


def test_empty_or_whitespace_draft_is_rejected():
    for draft in ("", "   \n\t"):
        response = client.post("/api/review", json={"draft_text": draft})
        assert response.status_code == 422


def test_malformed_request_is_rejected():
    missing_draft = client.post("/api/review", json={"approved_terms": []})
    unexpected_field = client.post(
        "/api/review", json={"draft_text": "A valid draft", "unrecognized": True}
    )
    assert missing_draft.status_code == 422
    assert unexpected_field.status_code == 422


def test_groq_api_error_returns_bad_gateway(monkeypatch):
    """When Groq API returns an upstream error, return 502 with message."""
    from app.services.groq_service import GroqApiError

    async def fake_failing_groq(request):
        raise GroqApiError("Groq Cloud API error: Rate limit reached", status_code=502)

    monkeypatch.setattr(review_service, "review_draft_with_groq", fake_failing_groq)

    response = client.post(
        "/api/review",
        json={
            "draft_text": "A consumer can access this service.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        },
    )
    assert response.status_code == 502
    assert "Rate limit reached" in response.json()["detail"]


def test_groq_comprehensive_review_categories(monkeypatch):
    """Groq review returns multiple finding categories dynamically."""
    mock_response = ReviewResponse(
        findings=[
            Finding(
                id="F-001",
                category="Terminology",
                severity="Low",
                excerpt="consumer",
                explanation="Avoid consumer.",
                suggestion="customer",
                evidence_ids=["TERM-01"],
                confidence="high",
            ),
            Finding(
                id="F-002",
                category="Tone",
                severity="Medium",
                excerpt="guaranteed success",
                explanation="Violates guideline VOICE-01 regarding absolute promises.",
                suggestion="designed for success",
                evidence_ids=["VOICE-01"],
                confidence="medium",
            ),
            Finding(
                id="F-003",
                category="Claim Verification",
                severity="High",
                excerpt="doubles sales in 3 days",
                explanation="No evidence in approved facts supports this claim.",
                suggestion="verify with performance data",
                evidence_ids=[],
                confidence="high",
            ),
        ],
        review_summary="Groq Cloud AI identified 3 findings across terminology, tone, and claims.",
        needs_human_review=True,
    )

    fake_groq = AsyncMock(return_value=mock_response)
    monkeypatch.setattr(review_service, "review_draft_with_groq", fake_groq)

    response = client.post(
        "/api/review",
        json={
            "draft_text": "A consumer gets guaranteed success and doubles sales in 3 days.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
            "brand_guidelines": [{"id": "VOICE-01", "text": "Avoid absolute promises."}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["findings"]) == 3
    categories = {f["category"] for f in body["findings"]}
    assert categories == {"Terminology", "Tone", "Claim Verification"}
    assert body["review_summary"].startswith("Groq Cloud AI")

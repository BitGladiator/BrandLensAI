from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services import review_service

client = TestClient(app)


def test_health_endpoint_reports_backend_up():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "BrandLens AI backend"


def test_review_returns_terminology_finding():
    settings.ai_review_enabled = False
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
    finding = body["findings"][0]
    assert finding["category"] == "Terminology"
    assert finding["excerpt"] == "consumer"
    assert finding["suggestion"] == "customer"
    assert finding["evidence_ids"] == ["TERM-01"]
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


def test_ai_failure_does_not_break_terminology_review(monkeypatch):
    settings.ai_review_enabled = True

    async def fake_failed_ai(payload):
        from app.services.ai_review_adapter import AIReviewError
        raise AIReviewError("safe simulated failure")

    monkeypatch.setattr(review_service, "run_ai_review", fake_failed_ai)
    response = client.post(
        "/api/review",
        json={
            "draft_text": "A consumer can access this service.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body["findings"]) == 1
    assert "AI review is currently unavailable" in body["review_summary"]
    assert body["needs_human_review"] is True
    settings.ai_review_enabled = False


def test_clean_draft_returns_empty_findings_array():
    settings.ai_review_enabled = False
    response = client.post(
        "/api/review",
        json={
            "draft_text": "Every customer can review the service details.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        },
    )
    assert response.status_code == 200
    assert response.json()["findings"] == []
    assert response.json()["needs_human_review"] is True


def test_ai_findings_are_combined_with_rule_findings(monkeypatch):
    settings.ai_review_enabled = True

    async def fake_ai(payload):
        from app.schemas.review import Finding
        assert payload["draft_text"].startswith("A consumer")
        return [
            Finding(
                id="F-AI-001",
                category="Tone",
                severity="Medium",
                excerpt="guaranteed success",
                explanation="The supplied guideline asks for specific, non-exaggerated claims.",
                suggestion="Describe the supported benefit without an absolute promise.",
                evidence_ids=["VOICE-01"],
                confidence="medium",
            )
        ]

    monkeypatch.setattr(review_service, "run_ai_review", fake_ai)
    response = client.post(
        "/api/review",
        json={
            "draft_text": "A consumer is guaranteed success.",
            "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
            "brand_guidelines": [{"id": "VOICE-01", "text": "Avoid exaggerated promises."}],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert {finding["category"] for finding in body["findings"]} == {"Terminology", "Tone"}
    assert body["review_summary"].startswith("Review completed")
    settings.ai_review_enabled = False

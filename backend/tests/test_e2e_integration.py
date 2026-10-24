from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_e2e_frontend_contract_sample_review():
    """Verify that the frontend's default payload contract works with the backend."""
    payload = {
        "draft_text": (
            "Our consumer service is available in 10 regions. "
            "It is the best in the world and guarantees double the sales for every customer."
        ),
        "brand_guidelines": [
            {
                "id": "VOICE-01",
                "text": "Use clear, friendly language. Avoid exaggerated or absolute promises.",
            },
            {
                "id": "VOICE-02",
                "text": "Keep claims specific and make sure factual statements are supported by approved facts.",
            },
        ],
        "approved_terms": [
            {
                "preferred": "customer",
                "avoid": ["consumer", "buyer"],
            }
        ],
        "approved_facts": [
            {
                "id": "FACT-01",
                "text": "The service is available in 10 regions.",
            }
        ],
    }

    response = client.post("/api/review", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "findings" in data
    assert "review_summary" in data
    assert data["needs_human_review"] is True

    # Check finding fields
    findings = data["findings"]
    assert len(findings) >= 1
    term_finding = findings[0]
    assert term_finding["id"] == "F-TERM-001"
    assert term_finding["category"] == "Terminology"
    assert term_finding["severity"] in ["Low", "Medium", "High"]
    assert term_finding["excerpt"] == "consumer"
    assert term_finding["suggestion"] == "customer"
    assert term_finding["confidence"] in ["low", "medium", "high"]
    assert "TERM-01" in term_finding["evidence_ids"]


def test_e2e_cors_headers_for_vite_dev_server():
    """Verify that OPTIONS preflight and headers permit Vite frontend origin."""
    response = client.options(
        "/api/review",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_e2e_large_draft_handling():
    """Verify that backend handles larger realistic drafts up to the limit."""
    long_text = "This is a customer draft. " * 200  # ~5,200 chars
    payload = {
        "draft_text": long_text,
        "brand_guidelines": [],
        "approved_terms": [{"preferred": "customer", "avoid": ["consumer"]}],
        "approved_facts": [],
    }
    response = client.post("/api/review", json=payload)
    assert response.status_code == 200
    assert response.json()["findings"] == []

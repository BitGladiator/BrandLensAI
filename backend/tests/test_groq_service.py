"""Unit tests for groq_service direct API calls and parsing."""

from __future__ import annotations

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.schemas.review import (
    ApprovedFact,
    ApprovedTerm,
    BrandGuideline,
    ReviewRequest,
)
from app.services.groq_service import (
    GroqApiError,
    GroqConfigurationError,
    _format_user_prompt,
    _parse_groq_response,
    review_draft_with_groq,
)


def test_format_user_prompt_includes_all_sections():
    request = ReviewRequest(
        draft_text="Our consumer offering is the best in the universe.",
        brand_guidelines=[BrandGuideline(id="VOICE-01", text="Stay grounded.")],
        approved_terms=[ApprovedTerm(preferred="customer", avoid=["consumer"])],
        approved_facts=[ApprovedFact(id="FACT-01", text="Available in 10 regions.")],
    )
    prompt = _format_user_prompt(request)
    assert "--- DRAFT TEXT ---" in prompt
    assert "Our consumer offering" in prompt
    assert "[VOICE-01] Stay grounded." in prompt
    assert 'Preferred: "customer" | Avoid: ["consumer"]' in prompt
    assert "[FACT-01] Available in 10 regions." in prompt


def test_parse_groq_response_sanitizes_findings():
    draft = "Every consumer gets 100% guaranteed results."
    groq_payload = {
        "review_summary": "Draft contains terminology and unverified claim issues.",
        "findings": [
            {
                "id": "F-001",
                "category": "Terminology",
                "severity": "low",
                "excerpt": "consumer",
                "explanation": "Prefer customer.",
                "suggestion": "customer",
                "evidence_ids": ["TERM-01"],
                "confidence": "HIGH",
            },
            {
                "category": "Claim Verification",
                "severity": "high",
                "excerpt": "\"100% guaranteed results\"",
                "explanation": "Unverified absolute claim.",
                "suggestion": "proven results",
            },
        ],
        "needs_human_review": True,
    }
    response = _parse_groq_response(groq_payload, draft)
    assert len(response.findings) == 2
    f1 = response.findings[0]
    assert f1.severity == "Low"
    assert f1.confidence == "high"
    assert f1.excerpt == "consumer"

    f2 = response.findings[1]
    assert f2.severity == "High"
    # Notice stripped quote marks matched draft
    assert f2.excerpt == "100% guaranteed results"
    assert response.review_summary.startswith("Draft contains")
    assert response.needs_human_review is True


@pytest.mark.anyio
async def test_groq_missing_key_raises_configuration_error():
    request = ReviewRequest(draft_text="A clean draft.")
    with patch("app.core.config.settings.groq_api_key", None):
        with pytest.raises(GroqConfigurationError) as exc_info:
            await review_draft_with_groq(request, api_key=None)
        assert "Groq Cloud API key is not configured" in str(exc_info.value)


@pytest.mark.anyio
async def test_groq_successful_call(monkeypatch):
    request = ReviewRequest(
        draft_text="Our consumer portal is live.",
        approved_terms=[ApprovedTerm(preferred="customer", avoid=["consumer"])],
    )

    mock_llm_json = {
        "review_summary": "Identified terminology conflict with brand standards.",
        "findings": [
            {
                "id": "F-001",
                "category": "Terminology",
                "severity": "Low",
                "excerpt": "consumer",
                "explanation": "Use customer instead of consumer.",
                "suggestion": "customer",
                "evidence_ids": ["TERM-01"],
                "confidence": "high",
            }
        ],
        "needs_human_review": True,
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(mock_llm_json),
                }
            }
        ]
    }

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

        async def post(self, url, headers=None, json=None):
            return mock_response

    monkeypatch.setattr("httpx.AsyncClient", MockAsyncClient)

    result = await review_draft_with_groq(request, api_key="gsk_valid_key")
    assert len(result.findings) == 1
    assert result.findings[0].excerpt == "consumer"
    assert result.review_summary.startswith("Identified terminology conflict")

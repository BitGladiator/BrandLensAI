"""Direct Groq Cloud AI integration for BrandLens AI.

Sends the user's marketing draft, brand guidelines, approved terminology,
and approved facts to Groq Cloud (e.g. Llama 3.3 70B Versatile). The response
is parsed and returned directly as a validated ReviewResponse.
"""

from __future__ import annotations

import json
import logging
from typing import Any
import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.review import Finding, ReviewRequest, ReviewResponse

logger = logging.getLogger(__name__)


class GroqConfigurationError(Exception):
    """Raised when the Groq API key is missing or invalid."""


class GroqApiError(Exception):
    """Raised when the Groq Cloud API request fails or returns an error."""

    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


SYSTEM_PROMPT = """You are BrandLens AI, an expert enterprise brand governance and marketing compliance reviewer.
Your job is to thoroughly analyze the provided marketing draft strictly against the supplied Brand Standards:
1. Brand Guidelines (voice, tone, style rules)
2. Approved Terminology (preferred terms vs words/phrases to avoid)
3. Approved Facts (verified facts to check for unsupported, exaggerated, or contradictory claims)

You must return a valid JSON object matching this exact structure:
{
  "review_summary": "A concise, dynamic 2-3 sentence executive summary of your review findings for this specific draft.",
  "findings": [
    {
      "id": "F-001",
      "category": "Terminology",
      "severity": "Low",
      "excerpt": "Exact verbatim snippet from draft_text",
      "explanation": "Clear explanation of why this excerpt is an issue according to the guidelines, terms, or facts",
      "suggestion": "Specific, actionable replacement or revision",
      "evidence_ids": ["VOICE-01"],
      "confidence": "high"
    }
  ],
  "needs_human_review": true
}

Critical Instructions:
- Every finding's "excerpt" MUST be an exact verbatim substring from draft_text (case-sensitive) so the frontend editor can highlight and replace it. Do not paraphrase or alter punctuation in the excerpt.
- Terminology Check: If any avoided term or phrase from Approved Terminology appears in the draft, create a "Terminology" finding. Severity is typically "Low" or "Medium". Suggest the preferred term.
- Tone & Voice Check: If draft text violates any Brand Guideline (e.g. overly aggressive, passive, vague, slang), create a "Tone" or "Brand Voice" finding. Reference the guideline ID in evidence_ids.
- Claim Verification Check: If draft text makes an absolute claim ("100% guaranteed", "best in the world"), an unverified statistic, or a statement not supported by Approved Facts, create a "Claim Verification" finding. Severity should be "Medium" or "High".
- Category must be one of: "Terminology", "Tone", "Claim Verification", "Brand Voice", "Compliance".
- Severity must be: "Low", "Medium", or "High".
- Confidence must be: "low", "medium", or "high".
- If the draft is completely compliant and has no issues, return "findings": [] and a summary stating that the draft adheres to all supplied standards.
- Return ONLY the JSON object. Do not wrap in markdown fences (```json).
"""


def _format_user_prompt(request: ReviewRequest) -> str:
    """Format the review request into clear sections for the Groq LLM."""
    parts: list[str] = [
        "Please review the following marketing draft against our brand standards:\n",
        f"--- DRAFT TEXT ---\n{request.draft_text}\n",
    ]

    if request.brand_guidelines:
        parts.append("--- BRAND GUIDELINES ---")
        for g in request.brand_guidelines:
            parts.append(f"[{g.id}] {g.text}")
        parts.append("")

    if request.approved_terms:
        parts.append("--- APPROVED TERMINOLOGY ---")
        for idx, t in enumerate(request.approved_terms, start=1):
            avoid_list = ", ".join(f'"{a}"' for a in t.avoid) if t.avoid else "none"
            parts.append(f"[TERM-{idx:02d}] Preferred: \"{t.preferred}\" | Avoid: [{avoid_list}]")
        parts.append("")

    if request.approved_facts:
        parts.append("--- APPROVED FACTS ---")
        for f in request.approved_facts:
            parts.append(f"[{f.id}] {f.text}")
        parts.append("")

    parts.append(
        "Analyze the draft thoroughly against all the above brand standards. "
        "Ensure all excerpts are exact substrings of the draft. "
        "Return the JSON object now."
    )
    return "\n".join(parts)


def _parse_groq_response(parsed: dict[str, Any], draft_text: str) -> ReviewResponse:
    """Validate and sanitize findings returned by Groq Cloud."""
    if not isinstance(parsed, dict):
        raise GroqApiError("Groq Cloud AI response was not a valid JSON object.")

    raw_findings = parsed.get("findings", [])
    if not isinstance(raw_findings, list):
        raise GroqApiError("Groq Cloud AI 'findings' field was not a list.")

    review_summary = parsed.get("review_summary")
    if not isinstance(review_summary, str) or not review_summary.strip():
        review_summary = "Review completed by Groq Cloud AI. Findings are advisory suggestions for human review."

    findings: list[Finding] = []
    for index, raw_item in enumerate(raw_findings, start=1):
        if not isinstance(raw_item, dict):
            continue

        item = dict(raw_item)
        item.setdefault("id", f"F-{index:03d}")
        item.setdefault("evidence_ids", [])

        # Normalize severity
        sev = str(item.get("severity", "Medium")).strip().capitalize()
        if sev not in ("Low", "Medium", "High"):
            sev = "Medium"
        item["severity"] = sev

        # Normalize confidence
        conf = str(item.get("confidence", "medium")).strip().lower()
        if conf not in ("low", "medium", "high"):
            conf = "medium"
        item["confidence"] = conf

        # Normalize category
        cat = str(item.get("category", "Brand Standards")).strip()
        item["category"] = cat if cat else "Brand Standards"

        # Sanitize and verify excerpt
        excerpt = str(item.get("excerpt", "")).strip()
        if not excerpt:
            continue

        # If model excerpt differs only by outer quotes or whitespace, adjust
        if excerpt not in draft_text:
            cleaned = excerpt.strip("\"'.,;:")
            if cleaned and cleaned in draft_text:
                excerpt = cleaned
        item["excerpt"] = excerpt

        item.setdefault("explanation", "Potential conflict with brand standards.")
        item.setdefault("suggestion", "Review and revise wording.")

        try:
            finding = Finding.model_validate(item)
            findings.append(finding)
        except ValidationError as exc:
            logger.warning("Skipping invalid finding from Groq: %s (%s)", item, exc)

    return ReviewResponse(
        findings=findings,
        review_summary=review_summary.strip(),
        needs_human_review=True,
    )


async def review_draft_with_groq(
    request: ReviewRequest,
    api_key: str | None = None,
) -> ReviewResponse:
    """Call Groq Cloud chat completions API to review the draft."""
    active_key = (api_key or settings.groq_api_key or "").strip()
    if not active_key:
        raise GroqConfigurationError(
            "Groq Cloud API key is not configured. Please set GROQ_API_KEY in backend/.env."
        )

    endpoint = f"{settings.groq_base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {active_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _format_user_prompt(request)},
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=settings.groq_timeout_seconds) as client:
        try:
            response = await client.post(endpoint, headers=headers, json=payload)
        except httpx.TimeoutException as exc:
            raise GroqApiError(
                f"Groq Cloud API request timed out after {settings.groq_timeout_seconds} seconds.",
                status_code=504,
            ) from exc
        except httpx.RequestError as exc:
            raise GroqApiError(
                f"Could not connect to Groq Cloud API: {str(exc)}",
                status_code=502,
            ) from exc

    if response.status_code != 200:
        error_detail = f"Groq Cloud API returned HTTP {response.status_code}"
        try:
            err_data = response.json()
            if isinstance(err_data, dict) and "error" in err_data:
                err_obj = err_data["error"]
                if isinstance(err_obj, dict) and "message" in err_obj:
                    error_detail = f"Groq Cloud API error: {err_obj['message']}"
                elif isinstance(err_obj, str):
                    error_detail = f"Groq Cloud API error: {err_obj}"
        except Exception:
            pass

        status_code = response.status_code if response.status_code in (401, 403, 429) else 502
        raise GroqApiError(error_detail, status_code=status_code)

    try:
        response_data = response.json()
    except Exception as exc:
        raise GroqApiError("Groq Cloud API returned non-JSON response.", status_code=502) from exc

    choices = response_data.get("choices")
    if not choices or not isinstance(choices, list):
        raise GroqApiError("Groq Cloud API response contained no completion choices.", status_code=502)

    message_content = choices[0].get("message", {}).get("content", "")
    if not message_content or not isinstance(message_content, str):
        raise GroqApiError("Groq Cloud API returned empty completion content.", status_code=502)

    clean_content = message_content.strip()
    if clean_content.startswith("```"):
        lines = clean_content.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        clean_content = "\n".join(lines).strip()

    try:
        parsed_json = json.loads(clean_content)
    except json.JSONDecodeError as exc:
        # Fallback: extract the outermost JSON object if there is extraneous text
        start_idx = clean_content.find("{")
        end_idx = clean_content.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            try:
                parsed_json = json.loads(clean_content[start_idx : end_idx + 1])
            except json.JSONDecodeError:
                raise GroqApiError(f"Groq Cloud AI returned malformed JSON: {exc}", status_code=502) from exc
        else:
            raise GroqApiError(f"Groq Cloud AI returned malformed JSON: {exc}", status_code=502) from exc

    return _parse_groq_response(parsed_json, request.draft_text)

# BrandLens AI — Backend (Srishti's scope)

This folder implements **Srishti's backend responsibilities from the team guide**: FastAPI routes, Pydantic request/response validation, deterministic terminology checks, review data flow, an integration adapter for Yuvasri's AI module, safe errors, CORS/environment configuration, a health endpoint, sample reference data, and backend tests.

It does not implement Deepali's frontend, Shreya's deployment/testing coordination, or Yuvasri's prompt/model/provider logic. The AI adapter is the integration boundary for Yuvasri's separately owned module.

## Requirements

- Python 3.10 or newer
- pip
- A terminal opened in this `BrandLens-ai-backend` directory

## Run on Windows PowerShell

These commands do not require activating the virtual environment, which avoids common PowerShell activation-policy issues.

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --env-file .env
```

Open the interactive API documentation at `http://127.0.0.1:8000/docs` and health check at `http://127.0.0.1:8000/api/health`.

If the `py` command is not available, replace `py` with `python`.

## Run on macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --env-file .env
```

## API contract

### `GET /api/health`

Example response:

```json
{
  "status": "ok",
  "service": "BrandLens AI backend",
  "ai_review_enabled": false
}
```

### `POST /api/review`

The request matches the shared contract in the team guide. `draft_text` is required; reference arrays are optional.

```json
{
  "draft_text": "Our consumer service is available in 10 regions.",
  "brand_guidelines": [
    {"id": "VOICE-01", "text": "Use clear, friendly language."}
  ],
  "approved_terms": [
    {"preferred": "customer", "avoid": ["consumer"]}
  ],
  "approved_facts": [
    {"id": "FACT-01", "text": "The service is available in 10 regions."}
  ]
}
```

Example response when AI review is disabled:

```json
{
  "findings": [
    {
      "id": "F-TERM-001",
      "category": "Terminology",
      "severity": "Low",
      "excerpt": "consumer",
      "explanation": "The supplied term list prefers \"customer\" instead of \"consumer\".",
      "suggestion": "customer",
      "evidence_ids": ["TERM-01"],
      "confidence": "high"
    }
  ],
  "review_summary": "Terminology review completed. AI review is disabled; only deterministic terminology checks ran. Human review is required.",
  "needs_human_review": true
}
```

The backend returns `422` for empty/whitespace drafts, malformed JSON shapes, unknown request fields, and values outside the input limits. It returns `findings: []` when the enabled checks do not identify issues. The backend never auto-approves a draft.

## Connect Yuvasri's AI module

1. Yuvasri should place an importable `ai_review.py` module in this backend directory (or set `AI_REVIEW_MODULE` to its import path).
2. It should export a function named `review_draft(payload)` (or set `AI_REVIEW_FUNCTION`). It can be synchronous or asynchronous.
3. The function receives the validated request as a dictionary with `draft_text`, `brand_guidelines`, `approved_terms`, and `approved_facts`.
4. It should return either `{"findings": [...]}` or a list of findings. Each finding must contain `category`, `severity` (`Low`, `Medium`, or `High`), `excerpt`, `explanation`, and `suggestion`. `id`, `evidence_ids`, and `confidence` are optional; the adapter supplies safe defaults for them. Use `evidence_ids` to reference supplied guideline/fact IDs whenever possible.
5. Once that module is available, set `AI_REVIEW_ENABLED=true` in `.env` and restart the server. Keep provider credentials in environment variables used by Yuvasri's module; never put real secrets in source control or frontend code.

If the module is missing, times out, or returns malformed data, the API remains available and returns deterministic terminology findings with a clear warning in `review_summary`. Tone and claim/fact findings may therefore be incomplete until AI integration is configured.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `ALLOWED_ORIGINS` | Comma-separated frontend origins for CORS | `http://localhost:5173,http://127.0.0.1:5173` |
| `AI_REVIEW_ENABLED` | Enable call to Yuvasri's module | `false` |
| `AI_REVIEW_MODULE` | Python import path for the AI module | `ai_review` |
| `AI_REVIEW_FUNCTION` | Function exported by that module | `review_draft` |
| `AI_REVIEW_TIMEOUT_SECONDS` | Timeout for the AI module call | `15` |

Do not commit `.env`; `.env.example` contains only non-secret defaults.

## Tests

Windows PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

macOS/Linux:

```bash
python -m pytest -q
```

Tests cover health, terminology matching, valid review input, empty input, malformed requests, AI failures, AI/rule finding combination, and a no-findings response. AI integration is mocked in tests, so no provider key is required to run them.

## Project structure

```text
BrandLens-ai-backend/
├── app/
│   ├── core/config.py
│   ├── routes/health.py
│   ├── routes/review.py
│   ├── schemas/review.py
│   ├── services/ai_review_adapter.py
│   ├── services/review_service.py
│   ├── rules/terminology.py
│   └── main.py
├── data/sample_brand_reference.json
├── tests/test_review_api.py
├── tests/test_terminology.py
├── .env.example
├── requirements.txt
└── README.md
```

## Current scope / limitations

- The backend checks terminology deterministically using the supplied approved-term list.
- Tone and claim/fact review require Yuvasri's AI module. They are not simulated by this backend.
- The MVP uses in-request reference data and a JSON sample file; it does not require a database.
- Findings are advisory and do not prove a claim is true or false. A human reviewer remains responsible for approval.

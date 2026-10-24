# BrandLens AI — The Brand Intelligence Studio

**BrandLens AI** is an enterprise-grade creative operations and brand-governance studio that reviews marketing copy against brand standards, enforces terminology consistency, evaluates tone, and identifies potentially unsupported claims before content reaches audiences.

---

## Architecture Overview

```text
BrandLensAI/
├── README.md                     # Project documentation & runbook
├── .gitignore                    # Repository ignore rules
├── backend/                      # FastAPI Python Review Service
│   ├── app/
│   │   ├── core/config.py        # Environment & CORS configuration
│   │   ├── main.py               # FastAPI entrypoint & security middleware
│   │   ├── routes/
│   │   │   ├── health.py         # GET /api/health endpoint
│   │   │   └── review.py         # POST /api/review endpoint
│   │   ├── rules/
│   │   │   └── terminology.py    # Deterministic terminology checks
│   │   ├── schemas/
│   │   │   └── review.py         # Strict Pydantic models (extra="forbid")
│   │   └── services/
│   │       ├── ai_review_adapter.py # Integration adapter for AI module
│   │       └── review_service.py    # Service orchestrator
│   ├── data/
│   │   └── sample_brand_reference.json # Sample brand standards & draft
│   ├── tests/
│   │   ├── test_review_api.py       # API route & failure tests
│   │   ├── test_terminology.py      # Rule engine tests
│   │   └── test_e2e_integration.py  # End-to-end integration tests
│   ├── pytest.ini                # Pytest path configuration
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
│
└── frontend/                     # React + TypeScript + Vite Studio
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx           # Brand navigation & connection pill
    │   │   ├── HealthIndicator.tsx  # Live backend status indicator
    │   │   ├── DraftEditor.tsx      # Draft textarea, character limiter & actions
    │   │   ├── BrandStandards.tsx   # Editable brand guidelines, terms & facts
    │   │   ├── ReviewSummary.tsx    # Completion status, metrics & distribution
    │   │   ├── FindingFilters.tsx   # Category filter tabs
    │   │   ├── FindingCard.tsx      # Finding card with accept/dismiss/copy
    │   │   └── Footer.tsx           # Product footer & advisory notice
    │   ├── pages/
    │   │   ├── HomePage.tsx         # Public product landing page
    │   │   ├── WorkspacePage.tsx    # The Brand Intelligence Studio workspace
    │   │   └── NotFoundPage.tsx     # 404 handler with return navigation
    │   ├── services/
    │   │   └── api.ts               # Reusable API client & error parser
    │   ├── types/
    │   │   └── review.ts            # TypeScript definitions matching backend
    │   ├── data/
    │   │   └── sampleData.ts        # Pre-loaded sample references & drafts
    │   ├── styles/
    │   │   ├── tokens.css           # Design tokens (colors, typography, radii)
    │   │   ├── base.css             # Resets & overflow guards
    │   │   ├── components.css       # Buttons, badges, cards, inputs
    │   │   └── layouts.css          # Responsive grids & media queries
    │   ├── tests/
    │   │   └── review.test.mjs      # Frontend validation & contract tests
    │   ├── App.tsx                  # Router configuration
    │   └── main.tsx                 # Application mount
    ├── index.html                   # HTML entrypoint & typography preconnect
    ├── vite.config.ts               # Vite configuration (port 5173)
    ├── tsconfig.json                # TypeScript configuration
    └── package.json                 # Frontend dependencies & scripts
```

---

## Brand Identity & Design System

BrandLens AI is designed with an understated, confident modern B2B SaaS design system:
- **Main Background**: `#F8F8F6`
- **Primary Surfaces**: `#FFFFFF`
- **Primary Text**: `#242B33`
- **Secondary Text**: `#596575`
- **Muted Text**: `#77818D`
- **Borders & Dividers**: `#D9DEE5`
- **Primary Brand Color**: Deep slate blue (`#344F6B`, hover `#263E57`)
- **Soft Blue Surface**: `#EDF2F7`
- **Restrained Accent**: Warm ochre (`#B58A49`, bg `#FDF9F2`, border `#F4E7CE`)
- **Error**: `#A43D35` (bg `#FDF2F1`, border `#F6D3CF`)
- **Success / Passed**: `#2E6855` (bg `#F2F8F5`, border `#C6E2D5`)

All layout components implement strict CSS overflow guards (`box-sizing: border-box`, `min-width: 0`, `min-height: 0`, `overflow-wrap: anywhere`, `scrollbar-gutter: stable`, and `overscroll-behavior: contain`) to prevent UI breakage regardless of content or AI response length. No gradients, neon colors, or artificial decorative effects are used.

---

## Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
   *(On Windows PowerShell: `.\.venv\Scripts\Activate.ps1`)*

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Default `.env` settings:
   ```ini
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   AI_REVIEW_ENABLED=false
   AI_REVIEW_MODULE=ai_review
   AI_REVIEW_FUNCTION=review_draft
   AI_REVIEW_TIMEOUT_SECONDS=15
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API is now running at `http://127.0.0.1:8000`.
   - Health check: `http://127.0.0.1:8000/api/health`
   - Interactive OpenAPI docs: `http://127.0.0.1:8000/docs`

#### Configuring External AI Provider Credentials
- If integrating Yuvasri's AI module, place `ai_review.py` in the `backend/` directory exporting `review_draft(payload: dict) -> dict`.
- Set `AI_REVIEW_ENABLED=true` in `backend/.env`.
- Provider API keys (e.g., Groq, OpenAI, Anthropic) belong exclusively in backend environment variables, never on the client.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   The `.env` file contains:
   ```ini
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or `http://127.0.0.1:5173`) in your browser.

5. To generate a production build:
   ```bash
   npm run build
   ```

---

## Running Tests

### Backend Tests
From the `backend/` directory (with the virtual environment active):
```bash
pytest -v
```
*(Or from repository root: `./backend/.venv/bin/pytest backend`)*

Covers:
- `test_health_endpoint_reports_backend_up`: Verifies health status.
- `test_review_returns_terminology_finding`: Verifies deterministic word-boundary term matching.
- `test_empty_or_whitespace_draft_is_rejected`: Rejects empty drafts with HTTP 422.
- `test_malformed_request_is_rejected`: Rejects unknown fields (`extra="forbid"`).
- `test_ai_failure_does_not_break_terminology_review`: Gracefully falls back to deterministic findings if AI fails.
- `test_clean_draft_returns_empty_findings_array`: Returns empty list when no issues are found.
- `test_ai_findings_are_combined_with_rule_findings`: Combines rule-based and AI findings.
- `test_matching_is_case_insensitive_and_avoids_partial_words`: Boundary isolation tests.
- `test_e2e_frontend_contract_sample_review`: Verifies frontend contract compatibility.
- `test_e2e_cors_headers_for_vite_dev_server`: Verifies CORS headers for Vite.
- `test_e2e_large_draft_handling`: Verifies handling of large drafts.

### Frontend Tests
From the `frontend/` directory:
```bash
npm test
```

Covers:
- Client-side draft validation (empty string, whitespace, 20,000 character limit).
- Safe excerpt replacement logic (unambiguous replacement, duplicate phrase detection, fallback).
- Backend `ReviewResponse` schema conformance validation.
- Multi-category finding filtering (All, Terminology, Tone, Claims & Facts).

---

## API Contract Summary

### `GET /api/health`
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "BrandLens AI backend",
  "ai_review_enabled": false
}
```

### `POST /api/review`
**Request Payload:**
```json
{
  "draft_text": "Our consumer service is available in 10 regions.",
  "brand_guidelines": [
    { "id": "VOICE-01", "text": "Use clear, friendly language." }
  ],
  "approved_terms": [
    { "preferred": "customer", "avoid": ["consumer"] }
  ],
  "approved_facts": [
    { "id": "FACT-01", "text": "The service is available in 10 regions." }
  ]
}
```

**Response (200 OK):**
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

---

## Key Features & Capabilities

1. **Content Review Studio (`/workspace`)**:
   - Interactive draft editor with character counter (up to 20,000 characters).
   - Sample draft loading with pre-built scenarios (Product Announcement, Newsletter, Campaign Copy).
   - Real-time backend connectivity pill with automatic polling and manual retry.
   - Expandable Brand Standards panel allowing editing of Guidelines, Approved Terms, and Approved Facts.
   - Comprehensive review summary with rule-based vs. AI-assisted metric breakdown and severity badges.
   - Dynamic category filtering (All, Terminology, Tone, Claims & Facts).
   - Safe one-click suggestion application with unambiguous excerpt replacement and duplicate match handling.
   - Local finding dismissal with full undo support.
2. **Product Homepage (`/`)**:
   - Complete marketing landing page with BrandLens AI identity.
   - Hero section featuring an interactive, bounded studio preview.
   - Explanations of genuine product capabilities (Voice Analysis, Terminology Consistency, Claims Review, Human Control).
   - Three-step workflow visualization.
   - Fully responsive design on desktop, tablet, and mobile screens.
3. **Safety & Advisory Principle**:
   - Review findings are explicitly advisory. The platform never claims machine review constitutes final publishing approval.

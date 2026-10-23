# AI module handoff contract — backend integration only

This file describes the boundary Srishti's backend expects from Yuvasri's independently owned AI implementation.

## Function

```python
def review_draft(payload: dict) -> dict:
    # Return {"findings": [ ... ]}
    ...
```

An async function is also supported. The payload contains the same four request fields accepted by `POST /api/review`: `draft_text`, `brand_guidelines`, `approved_terms`, and `approved_facts`.

## Each finding

```json
{
  "category": "Tone",
  "severity": "Medium",
  "excerpt": "wording from the draft",
  "explanation": "why it may conflict with supplied material",
  "suggestion": "a possible revision",
  "evidence_ids": ["VOICE-01"],
  "confidence": "medium"
}
```

`category`, `severity`, `excerpt`, `explanation`, and `suggestion` are required. `severity` is `Low`, `Medium`, or `High`. `evidence_ids` and `confidence` are optional. The backend creates an ID if one is omitted. For unsupported factual claims, communicate uncertainty and ask for human verification rather than declaring the claim false without evidence.

## Integration behavior

- Turn on the call with `AI_REVIEW_ENABLED=true`.
- Configure `AI_REVIEW_MODULE` and `AI_REVIEW_FUNCTION` if the defaults do not match the module name.
- Module import failures, timeouts, exceptions, and invalid output are handled without crashing the review endpoint. The response summary warns that AI findings may be incomplete.
- Do not add model-provider API keys to this repository or return secrets/provider stack traces in API responses.

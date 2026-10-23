"""Rule-based terminology checks against the supplied approved-term list."""

from __future__ import annotations

import re

from app.schemas.review import ApprovedTerm, Finding


def find_terminology_issues(draft_text: str, approved_terms: list[ApprovedTerm]) -> list[Finding]:
    """Return one finding for each avoided phrase found in the draft.

    Matching is case-insensitive and uses word boundaries so, for example,
    `consumer` does not match the middle of `consumerism`.
    """
    findings: list[Finding] = []

    for term_index, term in enumerate(approved_terms, start=1):
        preferred = term.preferred.strip()
        for avoided in term.avoid:
            avoided = avoided.strip()
            if not avoided or avoided.casefold() == preferred.casefold():
                continue

            pattern = re.compile(rf"(?<!\w){re.escape(avoided)}(?!\w)", re.IGNORECASE)
            match = pattern.search(draft_text)
            if not match:
                continue

            findings.append(
                Finding(
                    id=f"F-TERM-{len(findings) + 1:03d}",
                    category="Terminology",
                    severity="Low",
                    excerpt=match.group(0),
                    explanation=(
                        f'The supplied term list prefers "{preferred}" '
                        f'instead of "{avoided}".'
                    ),
                    suggestion=preferred,
                    evidence_ids=[f"TERM-{term_index:02d}"],
                    confidence="high",
                )
            )

    return findings

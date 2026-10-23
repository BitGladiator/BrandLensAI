"""Shared API contract for POST /api/review."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class BrandGuideline(StrictModel):
    id: str = Field(min_length=1, max_length=80)
    text: str = Field(min_length=1, max_length=2_000)

    @field_validator("id", "text")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field must not be blank.")
        return value


class ApprovedTerm(StrictModel):
    preferred: str = Field(min_length=1, max_length=120)
    avoid: list[str] = Field(default_factory=list, max_length=30)

    @field_validator("preferred")
    @classmethod
    def preferred_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Preferred term must not be blank.")
        return value.strip()

    @field_validator("avoid")
    @classmethod
    def clean_avoid_terms(cls, values: list[str]) -> list[str]:
        cleaned: list[str] = []
        for value in values:
            if not value.strip():
                raise ValueError("Avoid terms must not be blank.")
            cleaned.append(value.strip())
        return cleaned


class ApprovedFact(StrictModel):
    id: str = Field(min_length=1, max_length=80)
    text: str = Field(min_length=1, max_length=2_000)

    @field_validator("id", "text")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field must not be blank.")
        return value


class ReviewRequest(StrictModel):
    draft_text: str = Field(min_length=1, max_length=20_000)
    brand_guidelines: list[BrandGuideline] = Field(default_factory=list, max_length=100)
    approved_terms: list[ApprovedTerm] = Field(default_factory=list, max_length=100)
    approved_facts: list[ApprovedFact] = Field(default_factory=list, max_length=100)

    @field_validator("draft_text")
    @classmethod
    def draft_must_contain_non_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Draft text must not be empty or whitespace only.")
        return value


class Finding(StrictModel):
    id: str = Field(min_length=1, max_length=80)
    category: str = Field(min_length=1, max_length=100)
    severity: Literal["Low", "Medium", "High"]
    excerpt: str = Field(min_length=1, max_length=2_000)
    explanation: str = Field(min_length=1, max_length=2_000)
    suggestion: str = Field(min_length=1, max_length=2_000)
    evidence_ids: list[str] = Field(default_factory=list, max_length=100)
    confidence: Literal["low", "medium", "high"] = "medium"

    @field_validator("id", "category", "excerpt", "explanation", "suggestion")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field must not be blank.")
        return value


class ReviewResponse(StrictModel):
    findings: list[Finding]
    review_summary: str
    needs_human_review: bool = True

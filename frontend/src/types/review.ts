export type Severity = 'Low' | 'Medium' | 'High';
export type Confidence = 'low' | 'medium' | 'high';

export interface BrandGuideline {
  id: string;
  text: string;
}

export interface ApprovedTerm {
  preferred: string;
  avoid: string[];
}

export interface ApprovedFact {
  id: string;
  text: string;
}

export interface ReviewRequest {
  draft_text: string;
  brand_guidelines: BrandGuideline[];
  approved_terms: ApprovedTerm[];
  approved_facts: ApprovedFact[];
}

export interface Finding {
  id: string;
  category: string;
  severity: Severity;
  excerpt: string;
  explanation: string;
  suggestion: string;
  evidence_ids: string[];
  confidence: Confidence;
}

export interface ReviewResponse {
  findings: Finding[];
  review_summary: string;
  needs_human_review: boolean;
}

export interface HealthResponse {
  status: string;
  service: string;
  ai_review_enabled: boolean;
}

export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
}

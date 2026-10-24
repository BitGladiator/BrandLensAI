import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DraftEditor } from '../components/DraftEditor';
import { BrandStandards } from '../components/BrandStandards';
import { ReviewSummary } from '../components/ReviewSummary';
import { FindingFilters } from '../components/FindingFilters';
import { FindingCard } from '../components/FindingCard';
import { reviewDraft, ApiError } from '../services/api';
import {
  Finding,
  ReviewRequest,
  ReviewResponse,
  BrandGuideline,
  ApprovedTerm,
  ApprovedFact,
} from '../types/review';
import {
  DEFAULT_BRAND_GUIDELINES,
  DEFAULT_APPROVED_TERMS,
  DEFAULT_APPROVED_FACTS,
  SAMPLE_DRAFT_TEXT,
} from '../data/sampleData';

export const WorkspacePage: React.FC = () => {
  // State for draft text
  const [draftText, setDraftText] = useState<string>(SAMPLE_DRAFT_TEXT);

  // State for brand standards (initialized from sample backend data)
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(DEFAULT_BRAND_GUIDELINES);
  const [approvedTerms, setApprovedTerms] = useState<ApprovedTerm[]>(DEFAULT_APPROVED_TERMS);
  const [approvedFacts, setApprovedFacts] = useState<ApprovedFact[]>(DEFAULT_APPROVED_FACTS);

  // Review states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [activeFindings, setActiveFindings] = useState<Finding[]>([]);
  const [dismissedFindings, setDismissedFindings] = useState<Finding[]>([]);
  const [appliedFindingIds, setAppliedFindingIds] = useState<Set<string>>(new Set());

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Notification and error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [lastDismissed, setLastDismissed] = useState<Finding | null>(null);

  // Clear notice after 5 seconds
  useEffect(() => {
    if (statusNotice) {
      const timer = setTimeout(() => setStatusNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusNotice]);

  const handleResetDefaults = () => {
    if (window.confirm('Reset brand standards to backend sample defaults?')) {
      setGuidelines(DEFAULT_BRAND_GUIDELINES);
      setApprovedTerms(DEFAULT_APPROVED_TERMS);
      setApprovedFacts(DEFAULT_APPROVED_FACTS);
      setStatusNotice('Brand standards reset to sample reference defaults.');
    }
  };

  // Run brand review
  const handleRunReview = useCallback(async () => {
    if (!draftText.trim()) {
      setErrorMessage('Please enter draft text before running review.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const payload: ReviewRequest = {
      draft_text: draftText,
      brand_guidelines: guidelines,
      approved_terms: approvedTerms,
      approved_facts: approvedFacts,
    };

    try {
      const result = await reviewDraft(payload);
      setReviewResponse(result);
      setActiveFindings(result.findings);
      setDismissedFindings([]);
      setAppliedFindingIds(new Set());
      setLastDismissed(null);
      setSelectedCategory('All');
      setStatusNotice(`Review completed with ${result.findings.length} finding${result.findings.length === 1 ? '' : 's'}.`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while reviewing the draft.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [draftText, guidelines, approvedTerms, approvedFacts]);

  // Safe accept / replacement logic
  const handleAcceptSuggestion = (finding: Finding) => {
    const target = finding.excerpt;
    const replacement = finding.suggestion;

    if (!target) {
      setStatusNotice('No excerpt provided in finding to replace.');
      return;
    }

    // Check count of target occurrences in draft text
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = draftText.match(regex);

    if (!matches || matches.length === 0) {
      // Excerpt might have already been edited or changed
      setStatusNotice(
        `Could not find "${target}" in draft text. The excerpt may have been edited. Suggested replacement copied to clipboard.`
      );
      navigator.clipboard.writeText(replacement).catch(() => {});
      return;
    }

    if (matches.length === 1) {
      // Unambiguous exact match: replace directly
      const updatedText = draftText.replace(target, replacement);
      setDraftText(updatedText);
      setAppliedFindingIds((prev) => new Set(prev).add(finding.id));
      setStatusNotice(`Applied suggestion: Replaced "${target}" with "${replacement}".`);
    } else {
      // Multiple occurrences: replace the first occurrence safely and notify user
      const updatedText = draftText.replace(target, replacement);
      setDraftText(updatedText);
      setAppliedFindingIds((prev) => new Set(prev).add(finding.id));
      setStatusNotice(
        `Applied to first occurrence of "${target}" (${matches.length} matches found). Please verify remaining instances.`
      );
    }
  };

  // Dismiss finding locally
  const handleDismissFinding = (findingId: string) => {
    const findingToDismiss = activeFindings.find((f) => f.id === findingId);
    if (!findingToDismiss) return;

    setActiveFindings((prev) => prev.filter((f) => f.id !== findingId));
    setDismissedFindings((prev) => [...prev, findingToDismiss]);
    setLastDismissed(findingToDismiss);
    setStatusNotice(`Dismissed finding ${findingToDismiss.id}.`);
  };

  // Undo dismiss finding
  const handleUndoDismiss = () => {
    if (!lastDismissed) return;
    setActiveFindings((prev) => [...prev, lastDismissed]);
    setDismissedFindings((prev) => prev.filter((f) => f.id !== lastDismissed.id));
    setStatusNotice(`Restored finding ${lastDismissed.id}.`);
    setLastDismissed(null);
  };

  // Filter findings based on selected category
  const filteredFindings = activeFindings.filter((finding) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Terminology') {
      return finding.category.toLowerCase().includes('term');
    }
    if (selectedCategory === 'Tone') {
      return (
        finding.category.toLowerCase().includes('tone') ||
        finding.category.toLowerCase().includes('voice')
      );
    }
    if (selectedCategory === 'Claims & Facts') {
      return (
        finding.category.toLowerCase().includes('claim') ||
        finding.category.toLowerCase().includes('fact')
      );
    }
    return finding.category === selectedCategory;
  });

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="workspace-page">
          {/* Header */}
          <div className="workspace-header">
            <div>
              <h1 className="workspace-headline">Content review</h1>
              <p className="workspace-subline">
                Check a draft against your current brand standards.
              </p>
            </div>

            {lastDismissed && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleUndoDismiss}
                title="Undo last dismissed finding"
              >
                Undo dismiss ({lastDismissed.id})
              </button>
            )}
          </div>

          {/* Feedback Toast Notice */}
          {statusNotice && (
            <div className="alert alert-info" role="status">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-xs)' }}>
                {statusNotice}
              </div>
              <button
                type="button"
                className="btn-ghost btn-sm"
                style={{ padding: '0 4px', height: 'auto' }}
                onClick={() => setStatusNotice(null)}
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          )}

          {/* Studio Split Grid */}
          <div className="workspace-grid">
            {/* LEFT PANEL: Draft Editor & Brand Standards */}
            <section className="workspace-left-panel" aria-label="Draft editor and brand standards">
              <DraftEditor
                draftText={draftText}
                onChange={setDraftText}
                onSubmitReview={handleRunReview}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onClearError={() => setErrorMessage(null)}
              />

              <BrandStandards
                guidelines={guidelines}
                approvedTerms={approvedTerms}
                approvedFacts={approvedFacts}
                onUpdateGuidelines={setGuidelines}
                onUpdateApprovedTerms={setApprovedTerms}
                onUpdateApprovedFacts={setApprovedFacts}
                onResetDefaults={handleResetDefaults}
              />
            </section>

            {/* RIGHT PANEL: Review Results & Findings */}
            <section className="workspace-right-panel" aria-label="Review results and findings">
              {/* Summary Metrics */}
              {reviewResponse && (
                <ReviewSummary
                  response={reviewResponse}
                  activeFindings={activeFindings}
                  dismissedCount={dismissedFindings.length}
                />
              )}

              {/* Finding Filters */}
              {activeFindings.length > 0 && (
                <FindingFilters
                  findings={activeFindings}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {/* Findings List */}
              {reviewResponse ? (
                activeFindings.length > 0 ? (
                  filteredFindings.length > 0 ? (
                    <div className="findings-container" role="feed" aria-label="Review findings">
                      {filteredFindings.map((finding) => (
                        <FindingCard
                          key={finding.id}
                          finding={finding}
                          onAcceptSuggestion={handleAcceptSuggestion}
                          onDismiss={handleDismissFinding}
                          isApplied={appliedFindingIds.has(finding.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                      </div>
                      <h3 className="empty-state-title">No findings in this category</h3>
                      <p className="empty-state-text">
                        No active issues match "{selectedCategory}". Switch to "All" to view remaining findings.
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCategory('All')}
                      >
                        View all findings ({activeFindings.length})
                      </button>
                    </div>
                  )
                ) : (
                  <div className="empty-state" style={{ borderColor: 'var(--color-success-border)', background: 'var(--color-success-bg)' }}>
                    <div className="empty-state-icon" style={{ background: '#d1fae5', color: 'var(--color-success-text)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3 className="empty-state-title" style={{ color: 'var(--color-success-text)' }}>
                      No brand issues detected
                    </h3>
                    <p className="empty-state-text">
                      The current draft matches the enabled terminology and brand rules. Human editorial review is still recommended.
                    </p>
                  </div>
                )
              ) : (
                /* Initial state before review has run */
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <h3 className="empty-state-title">Ready to review draft</h3>
                  <p className="empty-state-text">
                    Enter your draft content and click <strong>Run review</strong> to check against active brand standards.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleRunReview}
                    disabled={isLoading || !draftText.trim()}
                  >
                    Run review
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

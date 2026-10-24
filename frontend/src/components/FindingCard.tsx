import React, { useState } from 'react';
import { Finding } from '../types/review';

interface FindingCardProps {
  finding: Finding;
  onAcceptSuggestion: (finding: Finding) => void;
  onDismiss: (findingId: string) => void;
  isApplied?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onAcceptSuggestion,
  onDismiss,
  isApplied = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySuggestion = async () => {
    try {
      await navigator.clipboard.writeText(finding.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const severityClass =
    finding.severity === 'High'
      ? 'severity-high'
      : finding.severity === 'Medium'
      ? 'severity-medium'
      : 'severity-low';

  const badgeClass =
    finding.severity === 'High'
      ? 'badge-high'
      : finding.severity === 'Medium'
      ? 'badge-medium'
      : 'badge-low';

  return (
    <article
      className={`finding-card ${severityClass} ${isApplied ? 'applied' : ''}`}
      aria-labelledby={`finding-title-${finding.id}`}
    >
      {/* Header Row: Category, Severity, Confidence, Finding ID */}
      <div className="finding-card-header">
        <div className="finding-badges">
          <span className="badge badge-category">{finding.category}</span>
          <span className={`badge ${badgeClass}`}>{finding.severity} severity</span>
          {finding.confidence && (
            <span className="badge badge-neutral">
              {finding.confidence} confidence
            </span>
          )}
          {isApplied && (
            <span className="badge badge-success">Applied</span>
          )}
        </div>

        <span id={`finding-title-${finding.id}`} className="finding-id">
          {finding.id}
        </span>
      </div>

      {/* Excerpt */}
      <div className="finding-excerpt-box">
        <div className="finding-excerpt-label">Flagged text</div>
        <div className="finding-excerpt-text">"{finding.excerpt}"</div>
      </div>

      {/* Explanation */}
      <p className="finding-explanation">{finding.explanation}</p>

      {/* Suggested Revision Box */}
      <div className="finding-suggestion-box">
        <div className="finding-suggestion-label">Suggested replacement</div>
        <div className="finding-suggestion-text">{finding.suggestion}</div>
      </div>

      {/* Evidence & References */}
      {finding.evidence_ids && finding.evidence_ids.length > 0 && (
        <div className="finding-evidence-row">
          <span>Standards reference:</span>
          {finding.evidence_ids.map((refId) => (
            <span key={refId} className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
              {refId}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="finding-actions-row">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleCopySuggestion}
          title="Copy suggestion to clipboard"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onDismiss(finding.id)}
          title="Dismiss this finding locally"
        >
          Dismiss
        </button>

        {!isApplied && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onAcceptSuggestion(finding)}
            title="Replace flagged text in draft with suggested revision"
          >
            Apply suggestion
          </button>
        )}
      </div>
    </article>
  );
};

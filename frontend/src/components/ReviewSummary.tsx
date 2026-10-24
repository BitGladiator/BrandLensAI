import React from 'react';
import { Finding, ReviewResponse } from '../types/review';

interface ReviewSummaryProps {
  response: ReviewResponse | null;
  activeFindings: Finding[];
  dismissedCount: number;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  response,
  activeFindings,
  dismissedCount,
}) => {
  if (!response) {
    return null;
  }

  const highCount = activeFindings.filter((f) => f.severity === 'High').length;
  const mediumCount = activeFindings.filter((f) => f.severity === 'Medium').length;
  const lowCount = activeFindings.filter((f) => f.severity === 'Low').length;

  const ruleCount = activeFindings.filter(
    (f) => f.id.startsWith('F-TERM') || f.category.toLowerCase().includes('terminol')
  ).length;

  const aiCount = activeFindings.filter(
    (f) => f.id.startsWith('F-AI') || (!f.id.startsWith('F-TERM') && !f.category.toLowerCase().includes('terminol'))
  ).length;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Review summary</span>
        </div>

        {response.needs_human_review && (
          <span className="badge badge-neutral">
            Human review required
          </span>
        )}
      </div>

      <div className="card-body">
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: 1.55 }}>
          {response.review_summary}
        </p>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Active findings
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {activeFindings.length}
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Rule checks
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
              {ruleCount}
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              AI assisted
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-secondary)', marginTop: '2px' }}>
              {aiCount}
            </div>
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Severity
            </div>
            <div style={{ fontSize: 'var(--text-xs)', marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {highCount > 0 && <span className="badge badge-high">{highCount} High</span>}
              {mediumCount > 0 && <span className="badge badge-medium">{mediumCount} Med</span>}
              {lowCount > 0 && <span className="badge badge-low">{lowCount} Low</span>}
              {highCount === 0 && mediumCount === 0 && lowCount === 0 && (
                <span className="badge badge-success">0</span>
              )}
            </div>
          </div>
        </div>

        {dismissedCount > 0 && (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {dismissedCount} finding{dismissedCount === 1 ? '' : 's'} dismissed locally.
          </div>
        )}
      </div>
    </div>
  );
};

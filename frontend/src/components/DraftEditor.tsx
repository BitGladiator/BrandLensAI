import React, { useState } from 'react';
import { SAMPLE_DRAFT_TEXT, ALTERNATIVE_SAMPLE_DRAFTS } from '../data/sampleData';

interface DraftEditorProps {
  draftText: string;
  onChange: (text: string) => void;
  onSubmitReview: () => void;
  isLoading: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

const MAX_CHARS = 20000;

export const DraftEditor: React.FC<DraftEditorProps> = ({
  draftText,
  onChange,
  onSubmitReview,
  isLoading,
  errorMessage,
  onClearError,
}) => {
  const [showSamplesDropdown, setShowSamplesDropdown] = useState(false);
  const charCount = draftText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > 18000;
  const isEmpty = draftText.trim().length === 0;

  const handleClear = () => {
    if (draftText.trim() && window.confirm('Are you sure you want to clear your current draft?')) {
      onChange('');
      onClearError?.();
    }
  };

  const handleLoadSample = (sample: string) => {
    onChange(sample);
    setShowSamplesDropdown(false);
    onClearError?.();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Draft content</span>
        </div>

        <div className="editor-toolbar">
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowSamplesDropdown(!showSamplesDropdown)}
              title="Insert sample marketing content"
              disabled={isLoading}
            >
              <span>Load sample</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showSamplesDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-dropdown)',
                  zIndex: 20,
                  minWidth: '240px',
                  padding: '4px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleLoadSample(SAMPLE_DRAFT_TEXT)}
                >
                  Primary sample (Terminology & tone)
                </button>
                {ALTERNATIVE_SAMPLE_DRAFTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => handleLoadSample(sample.text)}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleClear}
            disabled={isLoading || isEmpty}
            title="Clear current text"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="card-body">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-xs)' }}>
              <strong>Review error:</strong> {errorMessage}
            </div>
            {onClearError && (
              <button
                type="button"
                className="btn-danger-ghost btn-sm"
                onClick={onClearError}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="draft-textarea" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Draft content text
          </label>
          <textarea
            id="draft-textarea"
            className="form-textarea"
            placeholder="Enter marketing copy to evaluate against brand guidelines, approved terminology, and verified facts..."
            rows={8}
            value={draftText}
            onChange={(e) => {
              onChange(e.target.value);
              if (errorMessage) onClearError?.();
            }}
            disabled={isLoading}
            aria-invalid={isOverLimit}
            aria-describedby="char-count-info"
          />
        </div>

        <div className="editor-actions-row">
          <div id="char-count-info" className={`char-counter ${isOverLimit ? 'danger' : isNearLimit ? 'warning' : ''}`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            {isOverLimit && ' (Exceeds limit)'}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmitReview}
            disabled={isLoading || isEmpty || isOverLimit}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Running review...</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <span>Run review</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

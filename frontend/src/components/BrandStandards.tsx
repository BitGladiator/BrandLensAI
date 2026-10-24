import React, { useState } from 'react';
import { BrandGuideline, ApprovedTerm, ApprovedFact } from '../types/review';

interface BrandStandardsProps {
  guidelines: BrandGuideline[];
  approvedTerms: ApprovedTerm[];
  approvedFacts: ApprovedFact[];
  onUpdateGuidelines: (guidelines: BrandGuideline[]) => void;
  onUpdateApprovedTerms: (terms: ApprovedTerm[]) => void;
  onUpdateApprovedFacts: (facts: ApprovedFact[]) => void;
  onResetDefaults: () => void;
}

export const BrandStandards: React.FC<BrandStandardsProps> = ({
  guidelines,
  approvedTerms,
  approvedFacts,
  onUpdateGuidelines,
  onUpdateApprovedTerms,
  onUpdateApprovedFacts,
  onResetDefaults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'terms' | 'voice' | 'facts'>('terms');

  // Input states for adding new entries
  const [newPreferred, setNewPreferred] = useState('');
  const [newAvoid, setNewAvoid] = useState('');
  const [newGuidelineId, setNewGuidelineId] = useState('');
  const [newGuidelineText, setNewGuidelineText] = useState('');
  const [newFactId, setNewFactId] = useState('');
  const [newFactText, setNewFactText] = useState('');

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreferred.trim()) return;
    const avoidList = newAvoid
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    onUpdateApprovedTerms([
      ...approvedTerms,
      { preferred: newPreferred.trim(), avoid: avoidList },
    ]);
    setNewPreferred('');
    setNewAvoid('');
  };

  const handleRemoveTerm = (index: number) => {
    onUpdateApprovedTerms(approvedTerms.filter((_, i) => i !== index));
  };

  const handleAddGuideline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuidelineText.trim()) return;
    const id = newGuidelineId.trim() || `VOICE-0${guidelines.length + 1}`;
    onUpdateGuidelines([...guidelines, { id, text: newGuidelineText.trim() }]);
    setNewGuidelineId('');
    setNewGuidelineText('');
  };

  const handleRemoveGuideline = (index: number) => {
    onUpdateGuidelines(guidelines.filter((_, i) => i !== index));
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    const id = newFactId.trim() || `FACT-0${approvedFacts.length + 1}`;
    onUpdateApprovedFacts([...approvedFacts, { id, text: newFactText.trim() }]);
    setNewFactId('');
    setNewFactText('');
  };

  const handleRemoveFact = (index: number) => {
    onUpdateApprovedFacts(approvedFacts.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <button
        type="button"
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Brand standards</span>
          <span className="badge badge-neutral" style={{ marginLeft: '4px' }}>
            {approvedTerms.length} terms · {guidelines.length} guidelines · {approvedFacts.length} facts
          </span>
        </div>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="accordion-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div className="filter-tabs" style={{ margin: 0 }}>
              <button
                type="button"
                className={`filter-tab ${activeTab === 'terms' ? 'active' : ''}`}
                onClick={() => setActiveTab('terms')}
              >
                Terminology ({approvedTerms.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === 'voice' ? 'active' : ''}`}
                onClick={() => setActiveTab('voice')}
              >
                Voice ({guidelines.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${activeTab === 'facts' ? 'active' : ''}`}
                onClick={() => setActiveTab('facts')}
              >
                Approved facts ({approvedFacts.length})
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onResetDefaults}
              title="Reset standards to backend default sample reference"
            >
              Reset defaults
            </button>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Session standards are sent with each review request. Changes apply to the current active review session.
          </p>

          {/* TAB 1: APPROVED TERMS */}
          {activeTab === 'terms' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {approvedTerms.map((term, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>
                        {term.preferred}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>avoids:</span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {term.avoid.map((avoided, i) => (
                          <span
                            key={i}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '0.72rem',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              textDecoration: 'line-through',
                            }}
                          >
                            {avoided}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-danger-ghost btn-sm"
                      onClick={() => handleRemoveTerm(index)}
                      title="Remove term"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Term Form */}
              <form onSubmit={handleAddTerm} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: '1 1 130px', fontSize: 'var(--text-xs)' }}
                  placeholder="Preferred (e.g. customer)"
                  value={newPreferred}
                  onChange={(e) => setNewPreferred(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: '2 1 190px', fontSize: 'var(--text-xs)' }}
                  placeholder="Avoided, comma-separated (e.g. consumer, buyer)"
                  value={newAvoid}
                  onChange={(e) => setNewAvoid(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={!newPreferred.trim()}>
                  + Add
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: VOICE GUIDELINES */}
          {activeTab === 'voice' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {guidelines.map((g, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <span className="badge badge-neutral" style={{ marginRight: '8px', fontFamily: 'var(--font-mono)' }}>
                        {g.id}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                        {g.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-danger-ghost btn-sm"
                      onClick={() => handleRemoveGuideline(index)}
                      title="Remove guideline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Guideline Form */}
              <form onSubmit={handleAddGuideline} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100px', fontSize: 'var(--text-xs)' }}
                  placeholder="ID (VOICE-03)"
                  value={newGuidelineId}
                  onChange={(e) => setNewGuidelineId(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: '1 1 200px', fontSize: 'var(--text-xs)' }}
                  placeholder="Guideline text"
                  value={newGuidelineText}
                  onChange={(e) => setNewGuidelineText(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={!newGuidelineText.trim()}>
                  + Add
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: APPROVED FACTS */}
          {activeTab === 'facts' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {approvedFacts.map((fact, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <span className="badge badge-neutral" style={{ marginRight: '8px', fontFamily: 'var(--font-mono)' }}>
                        {fact.id}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                        {fact.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-danger-ghost btn-sm"
                      onClick={() => handleRemoveFact(index)}
                      title="Remove fact"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Fact Form */}
              <form onSubmit={handleAddFact} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100px', fontSize: 'var(--text-xs)' }}
                  placeholder="ID (FACT-02)"
                  value={newFactId}
                  onChange={(e) => setNewFactId(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: '1 1 200px', fontSize: 'var(--text-xs)' }}
                  placeholder="Approved fact statement"
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={!newFactText.trim()}>
                  + Add
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* HERO SECTION */}
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-grid">
            <div className="flex-child-safe">
              <div className="hero-eyebrow">
                Brand content review
              </div>

              <h1 id="hero-heading" className="hero-headline">
                Your brand standards, built into every draft.
              </h1>

              <p className="hero-lead">
                Review marketing content against your brand voice, preferred terminology, and approved facts before it reaches your audience.
              </p>

              <div className="hero-cta-group">
                <Link to="/workspace" className="btn btn-primary btn-lg">
                  <span>Open workspace</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>

                <a href="#how-it-works" className="btn btn-secondary btn-lg">
                  How it works
                </a>
              </div>

              <div className="hero-trust-list">
                <div className="hero-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-primary)">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Deterministic terminology matching</span>
                </div>
                <div className="hero-trust-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-primary)">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Advisory suggestions with author control</span>
                </div>
              </div>
            </div>

            {/* PRODUCT PREVIEW PANEL (Substantial, well-proportioned interface panel) */}
            <div className="flex-child-safe">
              <div className="product-preview-card" role="region" aria-label="Product review preview">
                <div className="preview-header">
                  <div className="preview-header-title">Content review workspace</div>
                  <span className="badge badge-neutral">
                    Illustrative sample
                  </span>
                </div>

                <div className="preview-body">
                  {/* Draft Excerpt */}
                  <div style={{ background: 'var(--color-surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px', fontSize: 'var(--text-xs)' }}>
                      Sample draft excerpt
                    </div>
                    <div style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                      "Our <span style={{ backgroundColor: '#fed7aa', padding: '1px 3px', borderRadius: '2px', color: '#9a3412' }}>consumer</span> service is available in 10 regions. It is <span style={{ backgroundColor: '#fef08a', padding: '1px 3px', borderRadius: '2px', color: '#854d0e' }}>the best in the world</span> and <span style={{ backgroundColor: '#fecaca', padding: '1px 3px', borderRadius: '2px', color: '#991b1b' }}>guarantees double sales</span> for every customer."
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-primary-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd7e3', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                      Brand review assessment completed
                    </span>
                    <span className="badge badge-category">
                      3 findings
                    </span>
                  </div>

                  {/* Example Finding 1: Terminology */}
                  <div style={{ border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge badge-category">Terminology</span>
                        <span className="badge badge-low">Low severity</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>F-TERM-001</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      The supplied term list prefers <strong>"customer"</strong> instead of <strong>"consumer"</strong>.
                    </div>
                    <div style={{ background: 'var(--color-primary-subtle)', border: '1px solid #cbd7e3', borderRadius: 'var(--radius-xs)', padding: '6px 10px', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Suggested: <strong>customer</strong></span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>TERM-01</span>
                    </div>
                  </div>

                  {/* Example Finding 2: Tone (Warm Ochre) */}
                  <div style={{ border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent-ochre)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge badge-category">Tone</span>
                        <span className="badge badge-medium">Medium severity</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>F-AI-001</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      Avoid absolute or superlative promises such as "best in the world".
                    </div>
                    <div style={{ background: 'var(--color-primary-subtle)', border: '1px solid #cbd7e3', borderRadius: 'var(--radius-xs)', padding: '6px 10px', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
                      Suggested: <strong>"a leading high-performance service"</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                    <Link to="/workspace" className="btn btn-secondary btn-sm" style={{ width: '100%', minHeight: '38px' }}>
                      Open workspace to review your drafts →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES */}
        <section id="features" className="home-section" aria-labelledby="features-heading">
          <div className="section-container">
            <div className="section-header">
              <div className="section-eyebrow">Product capabilities</div>
              <h2 id="features-heading" className="section-title">
                Precise content standards for modern marketing teams
              </h2>
              <p className="section-desc">
                BrandLens AI helps teams maintain consistent messaging across product releases, campaign copy, and external communications.
              </p>
            </div>

            <div className="capabilities-grid">
              {/* Capability 1 */}
              <div className="capability-card">
                <div className="capability-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                </div>
                <h3 className="capability-title">Brand voice analysis</h3>
                <p className="capability-text">
                  Evaluates drafts against documented voice rules to flag exaggerated superlatives, inconsistent formality, or absolute claims.
                </p>
              </div>

              {/* Capability 2 */}
              <div className="capability-card">
                <div className="capability-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <h3 className="capability-title">Terminology consistency</h3>
                <p className="capability-text">
                  Deterministic keyword inspection detects avoided phrases with exact word boundaries to prevent brand vocabulary errors.
                </p>
              </div>

              {/* Capability 3 */}
              <div className="capability-card">
                <div className="capability-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3 className="capability-title">Claims and factual review</h3>
                <p className="capability-text">
                  Cross-references draft assertions against your approved fact repository to highlight statements requiring human factual verification.
                </p>
              </div>

              {/* Capability 4 */}
              <div className="capability-card">
                <div className="capability-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7.5" r="4"/>
                    <polyline points="17 11 19 13 23 9"/>
                  </svg>
                </div>
                <h3 className="capability-title">Human-controlled suggestions</h3>
                <p className="capability-text">
                  Findings are strictly advisory. Authors maintain full control to inspect, selectively apply inline replacements, or dismiss findings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="home-section-alt" aria-labelledby="workflow-heading">
          <div className="section-container">
            <div className="section-header">
              <div className="section-eyebrow">Workflow</div>
              <h2 id="workflow-heading" className="section-title">
                How the review process works
              </h2>
              <p className="section-desc">
                A straightforward three-step workflow designed to fit easily into editorial and copy approval processes.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">Step 01</span>
                <h3 className="step-title">Add your marketing draft</h3>
                <p className="step-desc">
                  Paste content into the workspace editor and confirm your brand standards, approved terms, and verified facts.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">Step 02</span>
                <h3 className="step-title">Run the brand review</h3>
                <p className="step-desc">
                  The backend executes deterministic terminology matching and evaluates tone and factual statements against your criteria.
                </p>
              </div>

              <div className="step-card">
                <span className="step-number">Step 03</span>
                <h3 className="step-title">Inspect and apply suggestions</h3>
                <p className="step-desc">
                  Review categorized findings, check evidence references, and apply one-click revisions directly to the draft.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND STANDARDS PILLARS */}
        <section id="brand-standards" className="home-section" aria-labelledby="standards-heading">
          <div className="section-container">
            <div className="section-header">
              <div className="section-eyebrow">Reference framework</div>
              <h2 id="standards-heading" className="section-title">
                Three pillars of brand standards
              </h2>
              <p className="section-desc">
                Organize your company's editorial guidelines into structured, testable reference data.
              </p>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="badge badge-category">Terminology</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-md)' }}>Approved terms</span>
                </div>
                <p className="capability-text">
                  Define preferred terminology and paired lists of avoided phrases to eliminate unauthorized naming or deprecations.
                </p>
              </div>

              <div className="capability-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="badge badge-category">Voice</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-md)' }}>Style guidelines</span>
                </div>
                <p className="capability-text">
                  Codify voice principles such as clarity, directness, and avoidance of superlatives with guideline identifiers.
                </p>
              </div>

              <div className="capability-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className="badge badge-category">Facts</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-md)' }}>Approved facts</span>
                </div>
                <p className="capability-text">
                  Maintain verified statements (e.g. region availability, certifications) to identify unverified performance claims.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL WORKSPACE CTA */}
        <section className="home-section-alt" aria-labelledby="cta-heading" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-container">
            <div className="cta-banner-card">
              <div>
                <h2 id="cta-heading" className="cta-banner-title">
                  Ready to review your marketing content?
                </h2>
                <p className="cta-banner-desc">
                  Open the review workspace to check your draft against active brand voice, terminology, and approved facts.
                </p>
              </div>
              <Link to="/workspace" className="btn btn-primary btn-lg">
                <span>Open workspace</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

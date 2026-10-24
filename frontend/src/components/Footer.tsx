import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
            BrandLens AI
          </div>
          <p style={{ margin: 0, maxWidth: '420px', lineHeight: 1.5, color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
            Brand content review platform. Evaluates marketing drafts against brand guidelines, preferred terminology, and verified facts.
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Advisory review tool. Final content decisions require human approval.
          </p>
        </div>

        <ul className="footer-links">
          <li>
            <Link to="/" className="nav-link">Product</Link>
          </li>
          <li>
            <Link to="/workspace" className="nav-link">Workspace</Link>
          </li>
          <li>
            <a href="#features" className="nav-link">Features</a>
          </li>
          <li>
            <a href="#how-it-works" className="nav-link">How it works</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div className="empty-state" style={{ maxWidth: '440px', width: '100%', padding: '32px 24px' }}>
          <div className="empty-state-icon" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="empty-state-title" style={{ fontSize: '1.25rem' }}>
            Page not found (404)
          </h1>
          <p className="empty-state-text">
            The page you requested does not exist.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Link to="/" className="btn btn-secondary btn-sm">
              Return to overview
            </Link>
            <Link to="/workspace" className="btn btn-primary btn-sm">
              Open workspace
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HealthIndicator } from './HealthIndicator';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onHealthStatusChange?: (status: 'checking' | 'connected' | 'disconnected') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHealthStatusChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isWorkspace = location.pathname === '/workspace';

  const closeMobile = () => setMobileMenuOpen(false);

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileMenuOpen]);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo-link" onClick={closeMobile} aria-label="BrandLens AI Home">
          <BrandLogo size={28} />
          <div className="brand-logo-text">
            <span className="brand-title">BrandLens AI</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {!isWorkspace ? (
          <nav className="nav-links nav-links-desktop" aria-label="Main navigation">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#brand-standards" className="nav-link">Brand standards</a>
          </nav>
        ) : (
          <nav className="nav-links nav-links-desktop" aria-label="Workspace navigation">
            <Link to="/" className="nav-link">← Product overview</Link>
          </nav>
        )}

        <div className="nav-actions">
          <HealthIndicator onStatusChange={onHealthStatusChange} />

          {!isWorkspace ? (
            <Link to="/workspace" className="btn btn-primary btn-sm nav-links-desktop">
              Open workspace
            </Link>
          ) : (
            <span className="badge badge-category nav-links-desktop">
              Workspace
            </span>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="nav-mobile-drawer" aria-label="Mobile navigation">
          {!isWorkspace ? (
            <>
              <a href="#features" className="nav-link" onClick={closeMobile}>Features</a>
              <a href="#how-it-works" className="nav-link" onClick={closeMobile}>How it works</a>
              <a href="#brand-standards" className="nav-link" onClick={closeMobile}>Brand standards</a>
              <Link to="/workspace" className="btn btn-primary btn-sm" onClick={closeMobile}>
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={closeMobile}>← Product overview</Link>
              <span className="badge badge-category" style={{ alignSelf: 'flex-start' }}>Active: Workspace</span>
            </>
          )}

          <div className="nav-mobile-status">
            <span>API Status</span>
            <HealthIndicator onStatusChange={onHealthStatusChange} showFullLabelAlways={true} />
          </div>
        </nav>
      )}
    </header>
  );
};

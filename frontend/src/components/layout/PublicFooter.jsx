import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function PublicFooter() {
  const location = useLocation();
  const isDocsPage = location.pathname.startsWith('/docs');

  return (
    <footer className={`public-footer ${isDocsPage ? 'fixed-docs-footer' : ''}`}>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="public-brand" style={{ marginBottom: '8px', textDecoration: 'none', display: 'inline-flex' }}>
              <Activity size={18} className="public-brand-icon" />
              <span>PulseOps</span>
            </Link>
            <p className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
              Infrastructure monitoring for websites and APIs. Real-time health checks, incident detection, and performance tracking.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/docs" className="footer-link">
              Documentation
            </Link>
            <Link to="/login" className="footer-link">
              Log in
            </Link>
            <Link to="/register" className="footer-link">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

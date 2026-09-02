import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="public-brand" style={{ marginBottom: '8px' }}>
              <Activity size={18} className="public-brand-icon" />
              <span>PulseOps</span>
            </div>
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
            <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">
              GitHub
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PulseOps. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

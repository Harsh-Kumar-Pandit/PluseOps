import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Menu, X, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeSwitcher from '../common/ThemeSwitcher';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="public-navbar">
      <Link to="/" className="public-brand">
        <Activity size={20} className="public-brand-icon" />
        <span>PulseOps</span>
      </Link>

      <nav className={`public-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <a href="/#features" className="public-nav-link" onClick={() => setMobileMenuOpen(false)}>
          Features
        </a>
        <a href="/#how-it-works" className="public-nav-link" onClick={() => setMobileMenuOpen(false)}>
          How it works
        </a>
        <NavLink
          to="/docs"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) => (isActive ? 'public-nav-link active' : 'public-nav-link')}
        >
          Docs
        </NavLink>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="public-nav-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          GitHub <ExternalLink size={12} />
        </a>

        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="btn btn-primary"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutDashboard size={16} /> Go to Dashboard
          </Link>
        ) : (
          <>
            <NavLink
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'public-nav-link active' : 'public-nav-link')}
            >
              Log in
            </NavLink>
            <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ThemeSwitcher />
        <button
          className="menu-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Public Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

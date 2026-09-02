import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import ThemeSwitcher from '../common/ThemeSwitcher';

export default function Header({ onToggleMobile }) {
  const location = useLocation();

  // Determine section title based on active path
  const getSectionTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/monitors/new')) return 'New Monitor';
    if (path.startsWith('/monitors/')) return 'Monitor Detail';
    if (path.startsWith('/monitors')) return 'Monitors';
    if (path.startsWith('/incidents/')) return 'Incident Detail';
    if (path.startsWith('/incidents')) return 'Incidents';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Control Panel';
  };

  return (
    <header className="app-header">
      <div className="header-title-area">
        <button
          className="menu-toggle-btn"
          onClick={onToggleMobile}
          aria-label="Toggle Application Navigation"
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
          {getSectionTitle(location.pathname)}
        </span>
      </div>

      <div className="header-actions">
        {/* Real Theme Switcher */}
        <ThemeSwitcher />

        {/* Account Placeholder */}
        <div className="user-area-placeholder">
          <User size={15} style={{ color: 'var(--text-secondary)' }} />
          <span>Account Placeholder</span>
        </div>
      </div>
    </header>
  );
}

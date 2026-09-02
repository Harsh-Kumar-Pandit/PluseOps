import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Radio, AlertTriangle, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={onCloseMobile} />
      )}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="public-brand" onClick={onCloseMobile}>
            <Activity size={20} className="public-brand-icon" />
            <span>PulseOps</span>
          </Link>
          {mobileOpen && (
            <button className="menu-toggle-btn" onClick={onCloseMobile} aria-label="Close Navigation">
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/monitors"
            onClick={onCloseMobile}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <Radio size={18} />
            <span>Monitors</span>
          </NavLink>

          <NavLink
            to="/incidents"
            onClick={onCloseMobile}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <AlertTriangle size={18} />
            <span>Incidents</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-link"
            onClick={handleLogout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

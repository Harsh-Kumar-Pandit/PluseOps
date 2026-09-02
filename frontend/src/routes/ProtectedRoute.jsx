import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

/**
 * ProtectedRoute Component
 *
 * Enforces authentication requirement for protected app routes.
 * Displays a clean loading state while restoring session, and redirects to /login if unauthenticated.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--background)',
          color: 'var(--text-secondary)',
          gap: '1rem',
        }}
      >
        <Activity size={32} style={{ color: 'var(--brand-dark)', animation: 'pulse 1.5s infinite' }} />
        <span className="font-mono" style={{ fontSize: '0.875rem', letterSpacing: '0.04em' }}>
          VERIFYING SESSION...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

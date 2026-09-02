import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component (Structural Shell)
 *
 * NOTE for Phase 1A: This component provides the structural route wrapper.
 * Authentication logic (token validation, redirecting to /login) will be implemented
 * in a future phase after integrating with FastAPI authentication endpoints.
 */
export default function ProtectedRoute({ children }) {
  return children ? children : <Outlet />;
}

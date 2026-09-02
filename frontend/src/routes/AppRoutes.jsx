import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicAuthRoute from './PublicAuthRoute';

// Public Pages
import Home from '../pages/public/Home';
import Docs from '../pages/public/Docs';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// App Pages
import Dashboard from '../pages/app/Dashboard';
import Monitors from '../pages/app/Monitors';
import MonitorNew from '../pages/app/MonitorNew';
import MonitorDetail from '../pages/app/MonitorDetail';
import MonitorEdit from '../pages/app/MonitorEdit';
import Incidents from '../pages/app/Incidents';
import IncidentDetail from '../pages/app/IncidentDetail';
import Settings from '../pages/app/Settings';

// 404
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <Register />
            </PublicAuthRoute>
          }
        />
      </Route>

      {/* Authenticated Application Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitors" element={<Monitors />} />
        <Route path="/monitors/new" element={<MonitorNew />} />
        <Route path="/monitors/:id" element={<MonitorDetail />} />
        <Route path="/monitors/:id/edit" element={<MonitorEdit />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

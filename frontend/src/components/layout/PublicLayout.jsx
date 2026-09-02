import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-main-content">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Plus } from 'lucide-react';

export default function Monitors() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-xl">Monitors</h1>
          <p className="page-desc">Manage your uptime monitors and HTTP endpoints.</p>
        </div>
        <Link to="/monitors/new" className="btn btn-primary">
          <Plus size={16} /> New Monitor
        </Link>
      </div>

      <div className="empty-state">
        <Radio size={36} className="empty-state-icon" />
        <h2 className="empty-state-title">No Active Monitors</h2>
        <p className="empty-state-desc">
          You haven't configured any monitoring tasks. Create a monitor to start recording health check metrics.
        </p>
        <Link to="/monitors/new" className="btn btn-primary">
          Configure Monitor
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="heading-xl">Dashboard</h1>
          <p className="page-desc">Infrastructure monitoring overview and service health.</p>
        </div>
        <Link to="/monitors/new" className="btn btn-primary">
          <Plus size={16} /> New Monitor
        </Link>
      </div>

      <div className="empty-state">
        <Activity size={36} className="empty-state-icon" />
        <h2 className="empty-state-title">No Monitors Configured Yet</h2>
        <p className="empty-state-desc">
          Add your first HTTP endpoint or API URL to begin tracking uptime, response time latency, and automated incident detection.
        </p>
        <Link to="/monitors/new" className="btn btn-primary">
          Create Your First Monitor
        </Link>
      </div>
    </div>
  );
}

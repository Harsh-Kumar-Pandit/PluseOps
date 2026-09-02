import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function MonitorDetail() {
  const { id } = useParams();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/monitors" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '0.5rem', display: 'inline-flex', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Monitors
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="heading-xl">Monitor #{id}</h1>
          <StatusBadge status="PENDING" />
        </div>
        <p className="page-desc">Response time analytics, health check history, and monitor configuration.</p>
      </div>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Monitor Analytics Shell</h2>
        <p className="body-text text-muted">
          Health check response latency trend charts, 30-day uptime statistics, and log history for monitor #{id} will be rendered here.
        </p>
      </div>
    </div>
  );
}

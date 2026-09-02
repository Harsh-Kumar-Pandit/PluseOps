import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MonitorNew() {
  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/monitors" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '0.5rem', display: 'inline-flex', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Monitors
        </Link>
        <h1 className="heading-xl">Create New Monitor</h1>
        <p className="page-desc">Configure HTTP endpoint, check intervals, and threshold limits.</p>
      </div>

      <div className="card">
        <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Monitor Configuration Shell</h2>
        <p className="body-text text-muted" style={{ marginBottom: '1.5rem' }}>
          Target URL specification, polling intervals (10s-300s), expected status code (e.g. 200), and latency degradation thresholds will be configured in the monitor creation form in subsequent phases.
        </p>
        <button className="btn btn-primary" disabled>
          Create Monitor
        </button>
      </div>
    </div>
  );
}

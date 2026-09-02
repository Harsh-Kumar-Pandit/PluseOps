import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Incidents() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-xl">Incidents</h1>
        <p className="page-desc">Track service downtime and resolution timelines.</p>
      </div>

      <div className="empty-state">
        <AlertTriangle size={36} className="empty-state-icon" style={{ color: 'var(--success)' }} />
        <h2 className="empty-state-title">No Incidents Reported</h2>
        <p className="empty-state-desc">
          All systems are operational. Incident records will automatically be logged here when consecutive failure thresholds are met.
        </p>
      </div>
    </div>
  );
}

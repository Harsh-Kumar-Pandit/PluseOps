import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function IncidentDetail() {
  const { id } = useParams();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/incidents" className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: '0.5rem', display: 'inline-flex', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Incidents
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="heading-xl">Incident Report #{id}</h1>
          <StatusBadge status="DOWN" />
        </div>
        <p className="page-desc">Detailed incident root cause, failure timeline, and resolution metrics.</p>
      </div>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Incident #{id} Detailed Report Shell</h2>
        <p className="body-text text-muted">
          Downtime duration, HTTP error logs, and associated monitor details for incident report #{id} will be rendered here.
        </p>
      </div>
    </div>
  );
}

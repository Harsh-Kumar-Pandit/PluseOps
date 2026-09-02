import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import MonitorForm from '../../components/monitors/MonitorForm';

export default function MonitorNew() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await monitorsApi.createMonitor(payload);
    navigate('/monitors', { replace: true });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/monitors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Monitors
        </Link>
        <h1 className="heading-xl">Create Monitor</h1>
        <p className="page-desc">Configure an endpoint and define how PulseOps should monitor it.</p>
      </div>

      <MonitorForm
        onSubmit={handleCreate}
        submitText="Create Monitor"
        submittingText="Creating monitor..."
        onCancel={() => navigate('/monitors')}
      />
    </div>
  );
}

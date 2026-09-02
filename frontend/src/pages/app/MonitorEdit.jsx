import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import MonitorForm from '../../components/monitors/MonitorForm';

export default function MonitorEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMonitor() {
      setLoading(true);
      setError('');
      try {
        const data = await monitorsApi.getMonitor(id);
        setMonitor(data);
      } catch (err) {
        console.error('Failed to fetch monitor for editing:', err.message);
        setError(err.message || 'Monitor not found.');
      } finally {
        setLoading(false);
      }
    }

    loadMonitor();
  }, [id]);

  const handleUpdate = async (payload) => {
    await monitorsApi.updateMonitor(id, payload);
    navigate(`/monitors/${id}`, { replace: true });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        <p className="body-text text-muted">Loading monitor configuration...</p>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        <Link
          to="/monitors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Monitors
        </Link>
        <div
          className="card"
          style={{
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={20} />
          <span>{error || 'Monitor not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/monitors/${id}`}
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
          <ArrowLeft size={16} /> Back to Monitor Detail
        </Link>
        <h1 className="heading-xl">Edit Monitor</h1>
        <p className="page-desc">Update monitor configuration and thresholds for {monitor.name}.</p>
      </div>

      <MonitorForm
        initialValues={monitor}
        onSubmit={handleUpdate}
        submitText="Save Changes"
        submittingText="Saving changes..."
        onCancel={() => navigate(`/monitors/${id}`)}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Plus, AlertCircle, RotateCcw } from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import MonitorCard from '../../components/monitors/MonitorCard';

export default function Monitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMonitors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await monitorsApi.getMonitors();
      // Ensure backend array safety
      setMonitors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch monitors:', err.message);
      setError(err.message || 'Unable to load monitors. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="heading-xl">Monitors</h1>
          <p className="page-desc">Manage your uptime monitors and HTTP endpoints.</p>
        </div>
        <Link to="/monitors/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> New Monitor
        </Link>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>Loading monitors...</p>
          {[1, 2, 3].map((skeletonId) => (
            <div
              key={skeletonId}
              className="card"
              style={{
                height: '110px',
                backgroundColor: 'var(--surface-secondary)',
                opacity: 0.7,
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          className="card"
          style={{
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchMonitors}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && monitors.length === 0 && (
        <div className="empty-state">
          <Radio size={36} className="empty-state-icon" />
          <h2 className="empty-state-title">No monitors yet</h2>
          <p className="empty-state-desc">
            Add your first monitor to start tracking service availability and response time.
          </p>
          <Link to="/monitors/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Create your first monitor
          </Link>
        </div>
      )}

      {/* Real Monitor List Grid */}
      {!loading && !error && monitors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {monitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}
    </div>
  );
}

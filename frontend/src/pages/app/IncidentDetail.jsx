import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Globe, ShieldAlert, Radio, Activity } from 'lucide-react';
import { incidentsApi } from '../../api/incidents';
import { monitorsApi } from '../../api/monitors';
import { healthApi } from '../../api/health';
import StatusBadge from '../../components/common/StatusBadge';

export default function IncidentDetail() {
  const { id } = useParams();

  const [incident, setIncident] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticker, setTicker] = useState(() => Date.now());

  useEffect(() => {
    async function loadIncident() {
      setLoading(true);
      setError('');

      try {
        const incidentData = await incidentsApi.getIncident(id);
        setIncident(incidentData);

        if (incidentData && incidentData.monitor_id) {
          try {
            const [monitorData, healthData] = await Promise.all([
              monitorsApi.getMonitor(incidentData.monitor_id),
              healthApi.getHealthChecks(incidentData.monitor_id, 20, 0),
            ]);
            setMonitor(monitorData);
            setHealthChecks(healthData.items || []);
          } catch (mErr) {
            console.warn('Monitor detail lookup failed for incident:', mErr.message);
          }
        }
      } catch (err) {
        console.error('Failed to load incident detail:', err.message);
        setError(err.message || 'Incident report not found.');
      } finally {
        setLoading(false);
      }
    }

    loadIncident();
  }, [id]);

  // Live timer ticker for OPEN incidents
  useEffect(() => {
    if (!incident || incident.status !== 'OPEN') return;
    const interval = setInterval(() => {
      setTicker(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [incident?.status]);

  if (loading) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <p className="body-text text-muted">Loading incident details...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <Link
          to="/incidents"
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
          <ArrowLeft size={16} /> Back to Incidents
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
          <AlertTriangle size={20} />
          <span>{error || 'Incident report not found.'}</span>
        </div>
      </div>
    );
  }

  const isOpen = incident.status === 'OPEN';
  const startDate = incident.started_at
    ? new Date(incident.started_at.endsWith('Z') ? incident.started_at : `${incident.started_at}Z`)
    : null;
  const endDate = incident.resolved_at
    ? new Date(incident.resolved_at.endsWith('Z') ? incident.resolved_at : `${incident.resolved_at}Z`)
    : null;

  let computedDurationText = 'Ongoing';
  if (incident.duration !== null && incident.duration !== undefined) {
    computedDurationText = `${incident.duration} seconds`;
  } else if (isOpen && startDate) {
    const elapsed = Math.max(0, Math.floor((ticker - startDate.getTime()) / 1000));
    computedDurationText = `${elapsed} seconds (Ongoing)`;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Top Back Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/incidents"
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
          <ArrowLeft size={16} /> Back to Incidents
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="heading-xl" style={{ margin: 0 }}>Incident #{incident.id}</h1>
              <StatusBadge status={incident.status} />
            </div>
            <p className="page-desc" style={{ marginTop: '4px' }}>
              Detailed root cause analysis, downtime duration, and associated monitor details.
            </p>
          </div>

          {monitor && (
            <Link to={`/monitors/${monitor.id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={15} /> View Monitor Detail
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Incident Summary Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="heading-md" style={{ margin: 0 }}>Incident Summary</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Incident Status</span>
              <StatusBadge status={incident.status} size="small" />
            </div>

            {monitor && (
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Current Monitor Status</span>
                <StatusBadge status={monitor.status} size="small" />
              </div>
            )}

            <div>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Downtime Duration</span>
              <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {computedDurationText}
              </span>
            </div>

            <div>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Started At</span>
              <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {startDate ? startDate.toLocaleString() : 'N/A'}
              </span>
            </div>

            <div>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Resolved At</span>
              <span className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {endDate ? endDate.toLocaleString() : (isOpen ? 'Not resolved yet' : 'N/A')}
              </span>
            </div>
          </div>
        </div>

        {/* Root Cause Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ color: isOpen ? 'var(--danger)' : 'var(--warning)' }} />
            Root Cause & Failure Log
          </h3>

          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p className="font-mono" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>
              {incident.reason || 'Consecutive failed health checks exceeded trigger threshold.'}
            </p>
          </div>
        </div>

        {/* Associated Monitor Resource */}
        {monitor && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="heading-md" style={{ margin: 0 }}>Target Monitor Resource</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {monitor.name}
                </h4>
                <div className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{monitor.url}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>Method: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{monitor.method}</strong></span>
                <span>Interval: <strong>{monitor.interval}s</strong></span>
                <span>Failure Threshold: <strong>{monitor.failure_threshold}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Health Check Log Timeline */}
        {healthChecks.length > 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--brand-dark)' }} /> Monitor Health Timeline
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Code</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Latency</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                    <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {healthChecks.slice(0, 10).map((chk) => (
                    <tr key={chk.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <StatusBadge status={chk.status} />
                      </td>
                      <td className="font-mono" style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                        {chk.status_code ?? '—'}
                      </td>
                      <td className="font-mono" style={{ padding: '0.5rem 0.75rem' }}>
                        {chk.response_time !== null ? `${chk.response_time}ms` : '—'}
                      </td>
                      <td className="font-mono" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
                        {new Date(chk.checked_at.endsWith('Z') ? chk.checked_at : `${chk.checked_at}Z`).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', color: chk.error ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {chk.error || 'OK'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

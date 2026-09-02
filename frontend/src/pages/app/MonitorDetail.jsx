import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Play,
  Pause,
  Trash2,
  Globe,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import { healthApi } from '../../api/health';
import StatusBadge from '../../components/common/StatusBadge';

/**
 * Parse Python UTC ISO timestamp correctly into a JavaScript Date object.
 * Python datetime.utcnow().isoformat() produces strings like "2026-09-02T15:44:05.123456" (without trailing Z).
 * Appending 'Z' when missing forces JS to parse as UTC.
 */
function parseUtcDate(isoString) {
  if (!isoString) return null;
  const normalized =
    typeof isoString === 'string' && !isoString.endsWith('Z') && !isoString.includes('+')
      ? `${isoString}Z`
      : isoString;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format ISO timestamp into human-readable relative time (e.g. "12 seconds ago", "Just now")
 */
function getRelativeTime(isoString, nowTimestamp = Date.now()) {
  const date = parseUtcDate(isoString);
  if (!date) return 'Not checked yet';

  const secondsAgo = Math.max(0, Math.floor((nowTimestamp - date.getTime()) / 1000));

  if (secondsAgo < 5) return 'Just now';
  if (secondsAgo < 60) return `${secondsAgo} seconds ago`;

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
}

export default function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState(null);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [error, setError] = useState('');
  const [healthError, setHealthError] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  // Local ticker timestamp used for live 1-second relative time & countdown display
  const [tickerTime, setTickerTime] = useState(() => Date.now());

  const latestCheckedAtRef = useRef(null);
  const latestHealthCheckIdRef = useRef(null);
  const isPollingRef = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Initial Page Data Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setHealthError('');

    try {
      // Fetch monitor detail
      const monitorData = await monitorsApi.getMonitor(id);
      setMonitor(monitorData);

      // Fetch health checks history
      try {
        setHealthLoading(true);
        const healthData = await healthApi.getHealthChecks(id, 10, 0);
        const items = healthData.items || [];
        const sorted = [...items].sort((a, b) => {
          const tA = parseUtcDate(a.checked_at)?.getTime() || 0;
          const tB = parseUtcDate(b.checked_at)?.getTime() || 0;
          return tB - tA;
        });
        setHealthChecks(sorted);
        if (sorted.length > 0) {
          latestCheckedAtRef.current = sorted[0].checked_at;
          latestHealthCheckIdRef.current = sorted[0].id;
        } else if (monitorData.last_checked_at) {
          latestCheckedAtRef.current = monitorData.last_checked_at;
          latestHealthCheckIdRef.current = null;
        } else {
          latestCheckedAtRef.current = null;
          latestHealthCheckIdRef.current = null;
        }
      } catch (hErr) {
        console.error('Failed to load health history:', hErr.message);
        setHealthError(hErr.message || 'Unable to load health history.');
      } finally {
        setHealthLoading(false);
      }
    } catch (err) {
      console.error('Failed to load monitor detail:', err.message);
      setError(err.message || 'Monitor not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Local 1-Second Visual Ticker (Updates relative time & countdown string locally, ZERO API CALLS)
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Decoupled 5-Second Health Polling (Detects new backend checks without full-page reloads)
  useEffect(() => {
    const isPaused = !monitor || !monitor.is_active || monitor.status === 'PAUSED';
    if (isPaused) return;

    let isMounted = true;

    const pollHealth = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const healthData = await healthApi.getHealthChecks(id, 10, 0);
        if (!isMounted) return;

        const items = healthData.items || [];
        if (items.length > 0) {
          const sorted = [...items].sort((a, b) => {
            const tA = parseUtcDate(a.checked_at)?.getTime() || 0;
            const tB = parseUtcDate(b.checked_at)?.getTime() || 0;
            return tB - tA;
          });

          const newest = sorted[0];
          const newestTime = parseUtcDate(newest.checked_at)?.getTime() || 0;
          const prevTime = parseUtcDate(latestCheckedAtRef.current)?.getTime() || 0;

          // Compare newest checked_at and ID with previously known values
          if (newestTime > prevTime || newest.id !== latestHealthCheckIdRef.current) {
            latestCheckedAtRef.current = newest.checked_at;
            latestHealthCheckIdRef.current = newest.id;
            setHealthChecks(sorted);

            try {
              const updatedMonitor = await monitorsApi.getMonitor(id);
              if (isMounted) {
                setMonitor(updatedMonitor);
              }
            } catch (mErr) {
              console.error('Background monitor sync error:', mErr.message);
            }
          }
        }
      } catch (err) {
        console.error('Background health poll error:', err.message);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Poll every 5 seconds while component is mounted
    const pollInterval = setInterval(pollHealth, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [id, monitor?.is_active, monitor?.status]);

  // Defensive sort: newest health check first
  const sortedHealthChecks = Array.isArray(healthChecks)
    ? [...healthChecks].sort((a, b) => {
        const dateA = parseUtcDate(a.checked_at)?.getTime() || 0;
        const dateB = parseUtcDate(b.checked_at)?.getTime() || 0;
        return dateB - dateA;
      })
    : [];

  const newestHealthCheck = sortedHealthChecks.length > 0 ? sortedHealthChecks[0] : null;
  const lastCheckedIso = newestHealthCheck?.checked_at || monitor?.last_checked_at;

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsRefreshingData(true);
    try {
      const [monitorData, healthData] = await Promise.all([
        monitorsApi.getMonitor(id),
        healthApi.getHealthChecks(id, 10, 0),
      ]);
      setMonitor(monitorData);
      const items = healthData.items || [];
      const sorted = [...items].sort((a, b) => {
        const tA = parseUtcDate(a.checked_at)?.getTime() || 0;
        const tB = parseUtcDate(b.checked_at)?.getTime() || 0;
        return tB - tA;
      });
      setHealthChecks(sorted);
      if (sorted.length > 0) {
        latestCheckedAtRef.current = sorted[0].checked_at;
        latestHealthCheckIdRef.current = sorted[0].id;
      } else if (monitorData.last_checked_at) {
        latestCheckedAtRef.current = monitorData.last_checked_at;
      }
      showToast('Data refreshed.');
    } catch (err) {
      console.error('Manual refresh failed:', err.message);
    } finally {
      setIsRefreshingData(false);
    }
  };

  const handleTogglePause = async () => {
    if (!monitor || actionPending) return;
    setActionPending(true);

    try {
      let updated;
      if (monitor.is_active && monitor.status !== 'PAUSED') {
        updated = await monitorsApi.pauseMonitor(id);
        showToast('Monitor paused.');
      } else {
        updated = await monitorsApi.resumeMonitor(id);
        showToast('Monitor resumed.');
      }
      setMonitor(updated);
      const healthData = await healthApi.getHealthChecks(id, 10, 0);
      const items = healthData.items || [];
      const sorted = [...items].sort((a, b) => {
        const tA = parseUtcDate(a.checked_at)?.getTime() || 0;
        const tB = parseUtcDate(b.checked_at)?.getTime() || 0;
        return tB - tA;
      });
      setHealthChecks(sorted);
      if (sorted.length > 0) {
        latestCheckedAtRef.current = sorted[0].checked_at;
        latestHealthCheckIdRef.current = sorted[0].id;
      } else if (updated.last_checked_at) {
        latestCheckedAtRef.current = updated.last_checked_at;
      }
    } catch (err) {
      console.error('Failed to toggle pause/resume:', err.message);
      setError(err.message || 'Unable to update monitor state.');
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    if (actionPending) return;
    setActionPending(true);

    try {
      await monitorsApi.deleteMonitor(id);
      showToast('Monitor deleted.');
      navigate('/monitors', { replace: true });
    } catch (err) {
      console.error('Failed to delete monitor:', err.message);
      setError(err.message || 'Unable to delete monitor.');
      setShowDeleteModal(false);
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
        <p className="body-text text-muted">Loading monitor details...</p>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
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

  const isPaused = !monitor.is_active || monitor.status === 'PAUSED';

  // Latest Response formatting
  let latestResponseText = 'Waiting for first check';
  if (newestHealthCheck) {
    if (newestHealthCheck.response_time !== null && newestHealthCheck.response_time !== undefined) {
      latestResponseText = `${newestHealthCheck.response_time} ms`;
    } else {
      latestResponseText = '—';
    }
  }

  // Last Checked formatting (using local 1-second ticker)
  const lastCheckedText = lastCheckedIso
    ? getRelativeTime(lastCheckedIso, tickerTime)
    : 'Not checked yet';

  // Next Check countdown calculation
  let nextCheckText = 'Waiting for first check';
  if (isPaused) {
    nextCheckText = 'Paused';
  } else if (lastCheckedIso) {
    const lastCheckDate = parseUtcDate(lastCheckedIso);
    if (lastCheckDate) {
      const intervalSec = monitor.interval || 60;
      const nextCheckMs = lastCheckDate.getTime() + intervalSec * 1000;
      const diffSec = Math.ceil((nextCheckMs - tickerTime) / 1000);

      if (diffSec <= 0) {
        nextCheckText = 'CHECKING...';
      } else {
        nextCheckText = `~${diffSec}s`;
      }
    }
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1))',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--brand-dark)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation & Title Bar */}
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
              <h1 className="heading-xl">{monitor.name}</h1>
              <StatusBadge status={monitor.status} />
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                wordBreak: 'break-all',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Globe size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{monitor.url}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="btn btn-secondary"
              title="Refresh Health Data"
              disabled={isRefreshingData}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isRefreshingData ? 'spin' : ''} /> Refresh
            </button>

            <Link
              to={`/monitors/${id}/edit`}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit size={14} /> Edit
            </Link>

            <button
              type="button"
              onClick={handleTogglePause}
              disabled={actionPending}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isPaused ? (
                <>
                  <Play size={14} /> {actionPending ? 'Resuming...' : 'Resume Monitor'}
                </>
              ) : (
                <>
                  <Pause size={14} /> {actionPending ? 'Pausing...' : 'Pause Monitor'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={actionPending}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT MONITORING STATUS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Current Status
          </span>
          <div>
            <StatusBadge status={monitor.status} />
          </div>
        </div>

        {/* Latest Response */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Latest Response
          </span>
          <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {latestResponseText}
          </span>
        </div>

        {/* Last Checked */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Last Checked
          </span>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {lastCheckedText}
          </span>
        </div>

        {/* Next Check */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Next Check
          </span>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: isPaused ? 'var(--warning)' : 'var(--brand-dark)',
            }}
          >
            {nextCheckText}
          </span>
        </div>
      </div>

      {/* RECENT HEALTH CHECKS HISTORY TABLE */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="heading-md" style={{ margin: 0 }}>Recent Health Checks</h2>
          <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
            Last 10 checks
          </span>
        </div>

        {healthError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-soft)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            {healthError}
          </div>
        )}

        {healthLoading ? (
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>Loading health history...</p>
        ) : sortedHealthChecks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <Activity size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p className="body-text text-muted" style={{ margin: 0 }}>No health checks recorded yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HTTP Code</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Latency</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Checked At</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Error / Details</th>
                </tr>
              </thead>
              <tbody>
                {sortedHealthChecks.map((check) => (
                  <tr key={check.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <StatusBadge status={check.status} />
                    </td>
                    <td className="font-mono" style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>
                      {check.status_code ?? '—'}
                    </td>
                    <td className="font-mono" style={{ padding: '0.625rem 0.75rem' }}>
                      {check.response_time !== null && check.response_time !== undefined ? `${check.response_time} ms` : '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {parseUtcDate(check.checked_at)?.toLocaleString() || check.checked_at}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: check.error ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {check.error || 'OK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MONITOR CONFIGURATION SUMMARY CARD */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 className="heading-md" style={{ margin: 0 }}>Monitor Overview</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              HTTP Method
            </span>
            <p className="font-mono" style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>
              {monitor.method}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Check Interval
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>
              Every {monitor.interval} seconds
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Request Timeout
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>
              {monitor.timeout} seconds
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Expected Status
            </span>
            <p className="font-mono" style={{ margin: '4px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>
              {monitor.expected_status}
            </p>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-muted)', margin: '0.5rem 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Failure Threshold
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>
              {monitor.failure_threshold} consecutive failures
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Degraded Threshold
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>
              {monitor.degraded_threshold} ms latency
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Recovery Threshold
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: 'var(--text-primary)' }}>
              {monitor.recovery_threshold} consecutive successes
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Activity State
            </span>
            <p style={{ margin: '4px 0 0', fontWeight: 500, color: monitor.is_active ? 'var(--brand-dark)' : 'var(--warning)' }}>
              {monitor.is_active ? 'Active' : 'Paused'}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.15))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="heading-md" style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Delete monitor?
            </h3>
            <p className="body-text text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              This will permanently remove this monitor and its associated monitoring data.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={actionPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionPending}
                className="btn"
                style={{
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                {actionPending ? 'Deleting...' : 'Delete Monitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

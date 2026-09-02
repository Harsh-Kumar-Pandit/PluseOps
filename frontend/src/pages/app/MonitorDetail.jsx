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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import { healthApi } from '../../api/health';
import { incidentsApi } from '../../api/incidents';
import StatusBadge from '../../components/common/StatusBadge';

function parseUtcDate(isoString) {
  if (!isoString) return null;
  const normalized =
    typeof isoString === 'string' && !isoString.endsWith('Z') && !isoString.includes('+')
      ? `${isoString}Z`
      : isoString;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

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
  const [monitorIncidents, setMonitorIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsDays, setStatsDays] = useState(30);

  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [healthError, setHealthError] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  // Pagination for health checks
  const [healthPage, setHealthPage] = useState(0);
  const pageSize = 10;

  const [tickerTime, setTickerTime] = useState(() => Date.now());

  const latestCheckedAtRef = useRef(null);
  const latestHealthCheckIdRef = useRef(null);
  const isPollingRef = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Fetch Monitor Detail, Health Checks, Incidents & Stats
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setHealthError('');

    try {
      const monitorData = await monitorsApi.getMonitor(id);
      setMonitor(monitorData);

      // Fetch health checks, incidents, and stats in parallel
      setHealthLoading(true);
      setStatsLoading(true);

      const [healthDataRes, incidentsRes, statsRes] = await Promise.allSettled([
        healthApi.getHealthChecks(id, pageSize, healthPage * pageSize),
        incidentsApi.getIncidents(),
        healthApi.getStats(id, statsDays),
      ]);

      if (healthDataRes.status === 'fulfilled') {
        const items = healthDataRes.value.items || [];
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
      } else {
        setHealthError(healthDataRes.reason?.message || 'Unable to load health history.');
      }
      setHealthLoading(false);

      if (incidentsRes.status === 'fulfilled') {
        const allIncidents = Array.isArray(incidentsRes.value) ? incidentsRes.value : [];
        const filtered = allIncidents.filter((inc) => String(inc.monitor_id) === String(id));
        setMonitorIncidents(filtered);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      setStatsLoading(false);
    } catch (err) {
      console.error('Failed to load monitor detail:', err.message);
      setError(err.message || 'Monitor not found.');
    } finally {
      setLoading(false);
    }
  }, [id, healthPage, statsDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch stats when statsDays time range changes
  useEffect(() => {
    let isMounted = true;
    healthApi.getStats(id, statsDays).then((data) => {
      if (isMounted) setStats(data);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [id, statsDays]);

  // 2. Visual 1-Second Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Background Polling (5s)
  useEffect(() => {
    const isPaused = !monitor || !monitor.is_active || monitor.status === 'PAUSED';
    if (isPaused) return;

    let isMounted = true;

    const pollHealth = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const healthData = await healthApi.getHealthChecks(id, pageSize, 0);
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

          if (newestTime > prevTime || newest.id !== latestHealthCheckIdRef.current) {
            latestCheckedAtRef.current = newest.checked_at;
            latestHealthCheckIdRef.current = newest.id;
            if (healthPage === 0) {
              setHealthChecks(sorted);
            }

            try {
              const [updatedMonitor, updatedStats] = await Promise.all([
                monitorsApi.getMonitor(id),
                healthApi.getStats(id, statsDays),
              ]);
              if (isMounted) {
                setMonitor(updatedMonitor);
                setStats(updatedStats);
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

    const pollInterval = setInterval(pollHealth, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [id, monitor?.is_active, monitor?.status, healthPage, statsDays]);

  const sortedHealthChecks = Array.isArray(healthChecks)
    ? [...healthChecks].sort((a, b) => {
        const dateA = parseUtcDate(a.checked_at)?.getTime() || 0;
        const dateB = parseUtcDate(b.checked_at)?.getTime() || 0;
        return dateB - dateA;
      })
    : [];

  const newestHealthCheck = sortedHealthChecks.length > 0 ? sortedHealthChecks[0] : null;
  const lastCheckedIso = newestHealthCheck?.checked_at || monitor?.last_checked_at;

  const handleManualRefresh = async () => {
    setIsRefreshingData(true);
    try {
      await fetchData();
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
      await fetchData();
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
      <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
        <p className="body-text text-muted">Loading monitor details...</p>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
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

  let latestResponseText = 'Waiting for first check';
  if (newestHealthCheck) {
    if (newestHealthCheck.response_time !== null && newestHealthCheck.response_time !== undefined) {
      latestResponseText = `${newestHealthCheck.response_time} ms`;
    } else {
      latestResponseText = '—';
    }
  }

  const lastCheckedText = lastCheckedIso
    ? getRelativeTime(lastCheckedIso, tickerTime)
    : 'Not checked yet';

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
    <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%', position: 'relative' }}>
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
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--brand-dark)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
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

      {/* COMPACT STATUS BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Current Status
          </span>
          <div>
            <StatusBadge status={monitor.status} />
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Latest Response
          </span>
          <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {latestResponseText}
          </span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Last Checked
          </span>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {lastCheckedText}
          </span>
        </div>

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

      {/* STATISTICS SECTION WITH TIME RANGE SELECTOR */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--brand-dark)' }} /> Performance Statistics
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface-secondary)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            {[1, 7, 30].map((d) => (
              <button
                key={d}
                type="button"
                className={`btn btn-sm ${statsDays === d ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}
                onClick={() => setStatsDays(d)}
              >
                {d === 1 ? '24H' : `${d}D`}
              </button>
            ))}
          </div>
        </div>

        {statsLoading ? (
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>Loading statistics...</p>
        ) : stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Uptime</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                {stats.uptime_percentage !== undefined && stats.uptime_percentage !== null ? `${stats.uptime_percentage.toFixed(2)}%` : '—'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Checks</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                {stats.total_checks ?? '—'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Successful</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-dark)', margin: '4px 0 0' }}>
                {stats.successful_checks ?? '—'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Failed</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)', margin: '4px 0 0' }}>
                {stats.failed_checks ?? '—'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Response</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                {stats.average_response_time !== null && stats.average_response_time !== undefined ? `${Math.round(stats.average_response_time)} ms` : '—'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Peak Latency</span>
              <p className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)', margin: '4px 0 0' }}>
                {stats.max_response_time !== null && stats.max_response_time !== undefined ? `${stats.max_response_time} ms` : '—'}
              </p>
            </div>
          </div>
        ) : (
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>No statistics available.</p>
        )}
      </div>

      {/* RECENT INCIDENTS FOR THIS MONITOR */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Recent Incidents
        </h2>
        {monitorIncidents.length === 0 ? (
          <p className="body-text text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>No incidents recorded</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Started</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {monitorIncidents.map((inc) => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <StatusBadge status={inc.status} />
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{inc.reason || 'Threshold failure'}</td>
                    <td className="font-mono" style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}>
                      {parseUtcDate(inc.started_at)?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="font-mono" style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}>
                      {inc.duration !== null ? `${inc.duration}s` : 'Ongoing'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', textAlign: 'right' }}>
                      <Link to={`/incidents/${inc.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT HEALTH CHECKS HISTORY TABLE */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="heading-md" style={{ margin: 0 }}>Recent Health Checks</h2>
          <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
            Page {healthPage + 1}
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
          <>
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

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={healthPage === 0 || healthLoading}
                onClick={() => setHealthPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Page {healthPage + 1}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={sortedHealthChecks.length < pageSize || healthLoading}
                onClick={() => setHealthPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal Overlay */}
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
              boxShadow: 'var(--shadow-lg)',
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

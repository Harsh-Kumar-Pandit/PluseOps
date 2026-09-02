import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Plus,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  PauseCircle,
  Radio,
  Clock,
  ArrowRight,
  Globe,
  BarChart2,
  Zap,
  Server,
  Database,
  Cpu,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import { incidentsApi } from '../../api/incidents';
import { healthApi } from '../../api/health';
import MonitorCard from '../../components/monitors/MonitorCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [recentHealthChecks, setRecentHealthChecks] = useState([]);
  const [statsSummary, setStatsSummary] = useState(null);
  const [selectedStatsPeriod, setSelectedStatsPeriod] = useState(30); // 1, 7, 30 days
  const [chartTimeframe, setChartTimeframe] = useState(0); // 0 = All, 1 = 1H, 6 = 6H, 24 = 24H
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredChecks = useMemo(() => {
    if (chartTimeframe === 0 || !recentHealthChecks) return recentHealthChecks;
    const cutoff = Date.now() - chartTimeframe * 60 * 60 * 1000;
    return recentHealthChecks.filter((c) => {
      const t = new Date(c.checked_at?.endsWith('Z') ? c.checked_at : `${c.checked_at}Z`).getTime();
      return t >= cutoff;
    });
  }, [recentHealthChecks, chartTimeframe]);

  // Main Data Loading Strategy
  const loadDashboardData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);
      setError('');

      try {
        // 1. Fetch Primary Resources (Monitors & Incidents)
        const [monitorsRes, incidentsRes] = await Promise.all([
          monitorsApi.getMonitors(),
          incidentsApi.getIncidents().catch(() => []),
        ]);

        const monitorList = Array.isArray(monitorsRes) ? monitorsRes : [];
        const incidentList = Array.isArray(incidentsRes) ? incidentsRes : [];

        setMonitors(monitorList);
        setIncidents(incidentList);

        // 2. If monitors exist, fetch performance statistics & recent health check history
        if (monitorList.length > 0) {
          // Fetch stats for all monitors in parallel using settled Promises for fault tolerance
          // Fetch health checks based on active chartTimeframe (1H, 6H, 24H, or All)
          const fetchHours = chartTimeframe > 0 ? chartTimeframe : null;
          const fetchLimit = chartTimeframe === 1 ? 200 : chartTimeframe === 6 ? 400 : chartTimeframe === 24 ? 800 : 150;

          const statsPromises = monitorList.map((m) =>
            healthApi.getStats(m.id, selectedStatsPeriod).catch(() => null)
          );
          const healthHistoryPromises = monitorList.slice(0, 5).map((m) =>
            healthApi.getHealthChecks(m.id, fetchLimit, 0, fetchHours).catch(() => ({ items: [] }))
          );

          const [statsResults, healthResults] = await Promise.all([
            Promise.all(statsPromises),
            Promise.all(healthHistoryPromises),
          ]);

          // Aggregate Statistics across monitors safely
          let totalChecks = 0;
          let successfulChecks = 0;
          let failedChecks = 0;
          let degradedChecks = 0;
          let totalResponseTimeSum = 0;
          let validResponseTimeCount = 0;
          let maxResponseTime = 0;

          statsResults.forEach((res) => {
            if (res) {
              totalChecks += res.total_checks || 0;
              successfulChecks += res.successful_checks || 0;
              failedChecks += res.failed_checks || 0;
              degradedChecks += res.degraded_checks || 0;

              if (res.average_response_time > 0) {
                totalResponseTimeSum += (res.average_response_time || 0) * (res.total_checks || 1);
                validResponseTimeCount += res.total_checks || 1;
              }

              if ((res.max_response_time || 0) > maxResponseTime) {
                maxResponseTime = res.max_response_time;
              }
            }
          });

          const overallUptimePct = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;
          const overallAvgRt = validResponseTimeCount > 0 ? totalResponseTimeSum / validResponseTimeCount : 0;

          setStatsSummary({
            total_checks: totalChecks,
            successful_checks: successfulChecks,
            failed_checks: failedChecks,
            degraded_checks: degradedChecks,
            uptime_percentage: totalChecks > 0 ? roundDecimal(overallUptimePct, 2) : null,
            average_response_time: validResponseTimeCount > 0 ? Math.round(overallAvgRt) : null,
            max_response_time: maxResponseTime > 0 ? maxResponseTime : null,
          });

          // Merge & sort health check entries by checked_at descending
          const allChecks = [];
          healthResults.forEach((res, idx) => {
            const monitorInfo = monitorList[idx];
            if (res && Array.isArray(res.items)) {
              res.items.forEach((item) => {
                allChecks.push({
                  ...item,
                  monitor_name: monitorInfo ? monitorInfo.name : `Monitor #${item.monitor_id}`,
                  monitor_url: monitorInfo ? monitorInfo.url : '',
                });
              });
            }
          });

          allChecks.sort((a, b) => {
            const dateA = new Date(a.checked_at?.endsWith('Z') ? a.checked_at : `${a.checked_at}Z`).getTime();
            const dateB = new Date(b.checked_at?.endsWith('Z') ? b.checked_at : `${b.checked_at}Z`).getTime();
            return dateB - dateA;
          });

          setRecentHealthChecks(allChecks);
        } else {
          setStatsSummary(null);
          setRecentHealthChecks([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
        setError(err.message || 'Unable to load dashboard data. Please try again.');
      } finally {
        if (!isSilent) setLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedStatsPeriod, chartTimeframe]
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Periodic Silent Refresh (Every 15s)
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadDashboardData(true);
    }, 15000);
    return () => clearInterval(intervalId);
  }, [loadDashboardData]);

  // Derived Metrics & Status Breakdown
  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter((m) => m.status === 'UP').length;
  const downMonitors = monitors.filter((m) => m.status === 'DOWN').length;
  const degradedMonitors = monitors.filter((m) => m.status === 'DEGRADED').length;
  const pendingMonitors = monitors.filter((m) => m.status === 'PENDING').length;
  const pausedMonitors = monitors.filter((m) => !m.is_active || m.status === 'PAUSED').length;

  const openIncidents = incidents.filter((i) => i.status === 'OPEN').length;

  // Global Infrastructure Health Status Determination
  const infraHealth = useMemo(() => {
    if (totalMonitors === 0) {
      return {
        state: 'NO DATA',
        title: 'No Monitoring Targets Configured',
        description: 'Create your first monitor to start evaluating real-time service uptime and response latency.',
        badgeClass: 'badge-neutral',
        bgStyle: { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' },
        icon: HelpCircle,
        iconColor: 'var(--text-muted)',
      };
    }
    if (downMonitors > 0 || openIncidents > 0) {
      return {
        state: 'CRITICAL',
        title: 'Infrastructure Downtime Detected',
        description: `${downMonitors} monitor(s) failing health check thresholds. ${openIncidents} active incident(s) open.`,
        badgeClass: 'badge-danger',
        bgStyle: { backgroundColor: 'var(--danger-soft)', borderColor: 'var(--danger)' },
        icon: ShieldAlert,
        iconColor: 'var(--danger)',
      };
    }
    if (degradedMonitors > 0) {
      return {
        state: 'ATTENTION REQUIRED',
        title: 'High Response Latency Detected',
        description: `${degradedMonitors} monitor(s) operating above configured latency thresholds.`,
        badgeClass: 'badge-warning',
        bgStyle: { backgroundColor: 'var(--warning-soft)', borderColor: 'var(--warning)' },
        icon: AlertTriangle,
        iconColor: 'var(--warning)',
      };
    }
    if (upMonitors === 0) {
      if (pendingMonitors > 0) {
        return {
          state: 'NO DATA',
          title: 'Monitoring Initializing',
          description: `${pendingMonitors} monitor(s) pending initial health check execution by backend Celery scheduler.`,
          badgeClass: 'badge-neutral',
          bgStyle: { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' },
          icon: Clock,
          iconColor: 'var(--info)',
        };
      }
      return {
        state: 'NO DATA',
        title: 'No Active Monitoring Targets',
        description: 'All configured monitors are currently paused.',
        badgeClass: 'badge-neutral',
        bgStyle: { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' },
        icon: PauseCircle,
        iconColor: 'var(--text-muted)',
      };
    }
    return {
      state: 'HEALTHY',
      title: 'All Systems Operational',
      description: `All ${upMonitors} active monitor(s) performing within healthy threshold limits.`,
      badgeClass: 'badge-success',
      bgStyle: { backgroundColor: 'var(--success-soft)', borderColor: 'var(--success)' },
      icon: CheckCircle2,
      iconColor: 'var(--success)',
    };
  }, [totalMonitors, downMonitors, openIncidents, degradedMonitors, upMonitors, pendingMonitors]);

  return (
    <div style={{ width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            zIndex: 1000,
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Dashboard Top Header & Actions */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="heading-xl">Dashboard</h1>
            {isRefreshing && (
              <RefreshCw
                size={14}
                className="spin-animation"
                style={{ color: 'var(--text-muted)', marginTop: '4px' }}
                title="Refreshing infrastructure metrics..."
              />
            )}
          </div>
          <p className="page-desc">Operational control center & real-time infrastructure observability.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadDashboardData()}
            disabled={loading || isRefreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} className={isRefreshing ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/monitors/new"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> New Monitor
          </Link>
        </div>
      </div>

      {/* Global Dashboard Error State */}
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
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboardData()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Retry Loading Dashboard
          </button>
        </div>
      )}

      {/* Dashboard Main Grid - Renders FULL Layout structure in all states (0 monitors or >0 monitors) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 1. Summary Metric Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map((id) => (
              <div
                key={id}
                className="card"
                style={{
                  height: '84px',
                  backgroundColor: 'var(--surface-secondary)',
                  opacity: 0.7,
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {/* Total Monitors */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Radio size={18} style={{ color: 'var(--brand-dark)' }} />
              </div>
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Total Monitors
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {totalMonitors}
                </span>
              </div>
            </div>

            {/* Operational (UP) */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Operational
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--success)' }}>
                  {upMonitors}
                </span>
              </div>
            </div>

            {/* Down */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Down
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--danger)' }}>
                  {downMonitors}
                </span>
              </div>
            </div>

            {/* Degraded */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Degraded
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--warning)' }}>
                  {degradedMonitors}
                </span>
              </div>
            </div>

            {/* Paused */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <PauseCircle size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>
                  Paused
                </span>
                <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {pausedMonitors}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Infrastructure Health Status Section */}
        {!loading && (
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1.25rem 1.5rem',
              ...infraHealth.bgStyle,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {React.createElement(infraHealth.icon, { size: 28, style: { color: infraHealth.iconColor, flexShrink: 0 } })}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="heading-md" style={{ margin: 0, fontSize: '1.125rem' }}>
                    {infraHealth.title}
                  </h2>
                  <span className={`badge ${infraHealth.badgeClass}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {infraHealth.state}
                  </span>
                </div>
                <p className="body-text text-muted" style={{ fontSize: '0.875rem', marginTop: '4px', margin: 0 }}>
                  {infraHealth.description}
                </p>
              </div>
            </div>

            {totalMonitors === 0 && (
              <Link to="/monitors/new" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Add First Monitor
              </Link>
            )}
          </div>
        )}

        {/* 3. Performance Summary & Status Distribution Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Performance Summary Metrics Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 className="heading-md" style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={18} style={{ color: 'var(--brand-dark)' }} />
                  Performance Overview
                </h3>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
                  Calculated from real backend monitor health checks.
                </span>
              </div>

              {/* Timeframe Selector Pills */}
              <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', gap: '3px' }}>
                {[
                  { days: 1, label: '24H' },
                  { days: 7, label: '7D' },
                  { days: 30, label: '30D' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setSelectedStatsPeriod(item.days)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: selectedStatsPeriod === item.days ? 'var(--surface)' : 'transparent',
                      color: selectedStatsPeriod === item.days ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: selectedStatsPeriod === item.days ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              {/* Uptime % */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Uptime Rate</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: statsSummary?.uptime_percentage !== null ? 'var(--success)' : 'var(--text-muted)' }}>
                  {statsSummary?.uptime_percentage !== null && statsSummary?.uptime_percentage !== undefined ? `${statsSummary.uptime_percentage}%` : '—'}
                </span>
              </div>

              {/* Avg Response Time */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Avg Response Time</span>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {statsSummary?.average_response_time !== null && statsSummary?.average_response_time !== undefined ? `${statsSummary.average_response_time} ms` : '—'}
                </span>
              </div>

              {/* Max Response Time */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Max Latency Peak</span>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {statsSummary?.max_response_time !== null && statsSummary?.max_response_time !== undefined ? `${statsSummary.max_response_time} ms` : '—'}
                </span>
              </div>

              {/* Total Checks */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Total Health Checks</span>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {statsSummary?.total_checks !== undefined ? statsSummary.total_checks.toLocaleString() : '—'}
                </span>
              </div>

              {/* Successful Checks */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Passed Checks</span>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--success)' }}>
                  {statsSummary?.successful_checks !== undefined ? statsSummary.successful_checks.toLocaleString() : '—'}
                </span>
              </div>

              {/* Failed / Degraded Checks */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)' }}>
                <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Failed / Degraded</span>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 600, color: (statsSummary?.failed_checks || 0) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {statsSummary ? `${statsSummary.failed_checks} / ${statsSummary.degraded_checks}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Monitor Status Distribution Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 className="heading-md" style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: 'var(--brand-dark)' }} />
                Monitor Health Distribution
              </h3>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
                Proportional breakdown of current target states.
              </span>
            </div>

            {/* Visual Status Proportion Bar */}
            <div style={{ display: 'flex', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--surface-secondary)' }}>
              {totalMonitors > 0 ? (
                <>
                  {upMonitors > 0 && <div style={{ width: `${(upMonitors / totalMonitors) * 100}%`, backgroundColor: 'var(--success)' }} title={`Operational: ${upMonitors}`} />}
                  {degradedMonitors > 0 && <div style={{ width: `${(degradedMonitors / totalMonitors) * 100}%`, backgroundColor: 'var(--warning)' }} title={`Degraded: ${degradedMonitors}`} />}
                  {downMonitors > 0 && <div style={{ width: `${(downMonitors / totalMonitors) * 100}%`, backgroundColor: 'var(--danger)' }} title={`Down: ${downMonitors}`} />}
                  {pendingMonitors > 0 && <div style={{ width: `${(pendingMonitors / totalMonitors) * 100}%`, backgroundColor: 'var(--info)' }} title={`Pending: ${pendingMonitors}`} />}
                  {pausedMonitors > 0 && <div style={{ width: `${(pausedMonitors / totalMonitors) * 100}%`, backgroundColor: 'var(--text-muted)' }} title={`Paused: ${pausedMonitors}`} />}
                </>
              ) : (
                <div style={{ width: '100%', backgroundColor: 'var(--border)' }} title="No monitors configured" />
              )}
            </div>

            {/* Distribution Legend List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span>UP</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 700 }}>{upMonitors}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                  <span>DEGRADED</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 700 }}>{degradedMonitors}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                  <span>DOWN</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 700 }}>{downMonitors}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--info)' }} />
                  <span>PENDING</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 700 }}>{pendingMonitors}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                  <span>PAUSED</span>
                </div>
                <span className="font-mono" style={{ fontWeight: 700 }}>{pausedMonitors}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Real Response-Time Chart & Visualization Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="heading-md" style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: 'var(--brand-dark)' }} />
                Response Time Latency Visualizer
              </h3>
              <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
                Real health-check response time trends (ms) across active targets with hourly time details.
              </span>
            </div>

            {/* Timeframe Period Pills */}
            <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', gap: '3px' }}>
              {[
                { hours: 1, label: '1H' },
                { hours: 6, label: '6H' },
                { hours: 24, label: '24H' },
                { hours: 0, label: 'All' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setChartTimeframe(item.hours)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: chartTimeframe === item.hours ? 'var(--surface)' : 'transparent',
                    color: chartTimeframe === item.hours ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: chartTimeframe === item.hours ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '230px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {filteredChecks.length > 0 ? (
              <ResponseTimeChart checks={filteredChecks} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', zIndex: 2 }}>
                <Activity size={24} style={{ opacity: 0.6 }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>No health-check data in selected timeframe</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {totalMonitors === 0 ? 'Create a monitor to begin recording HTTP response time latency.' : 'Try selecting "All" or waiting for scheduled health checks.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. System Activity & Monitoring Flow Architecture Visual */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 className="heading-md" style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              Backend Health Check Engine Pipeline
            </h3>
            <span className="body-text text-muted" style={{ fontSize: '0.75rem' }}>
              High-throughput Celery Beat scheduler & Redis distributed concurrency lock architecture.
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.5rem 0',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Globe size={14} style={{ color: 'var(--brand-dark)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1. Monitor Config</span>
            </div>

            <ArrowRight size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Clock size={14} style={{ color: 'var(--info)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>2. Beat Tick (5s)</span>
            </div>

            <ArrowRight size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Cpu size={14} style={{ color: 'var(--warning)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>3. Redis Lock</span>
            </div>

            <ArrowRight size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Zap size={14} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4. Celery HTTP Check</span>
            </div>

            <ArrowRight size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <Database size={14} style={{ color: 'var(--brand-dark)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5. PostgreSQL Storage</span>
            </div>
          </div>
        </div>

        {/* 6. Active Incidents Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: openIncidents > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />
              Active Incidents
            </h2>
            <Link to="/incidents" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View All Incidents ({incidents.length})
            </Link>
          </div>

          {incidents.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Incident ID</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Root Cause Reason</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Started At</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Duration</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.slice(0, 5).map((incident) => (
                      <tr key={incident.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          #{incident.id}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <StatusBadge status={incident.status} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {incident.reason || 'Consecutive failed checks exceeded threshold'}
                        </td>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                          {incident.started_at
                            ? new Date(incident.started_at.endsWith('Z') ? incident.started_at : `${incident.started_at}Z`).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem' }}>
                          {incident.duration !== null ? `${incident.duration}s` : 'Ongoing'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <Link to={`/incidents/${incident.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <CheckCircle2 size={28} style={{ color: 'var(--success)', marginBottom: '8px' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>No incidents yet</span>
              <span style={{ fontSize: '0.8125rem', marginTop: '4px', maxWidth: '400px' }}>
                Incidents will appear automatically when backend failure threshold checks are triggered.
              </span>
            </div>
          )}
        </div>

        {/* 7. Monitor Overview Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} style={{ color: 'var(--brand-dark)' }} />
              Monitors Overview
            </h2>
            <Link to="/monitors" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8125rem' }}>
              View All Monitors ({totalMonitors})
            </Link>
          </div>

          {totalMonitors > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {monitors.slice(0, 3).map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  onRefresh={() => loadDashboardData(true)}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            <div className="card empty-state" style={{ padding: '2.5rem 1.5rem', margin: 0 }}>
              <Activity size={32} className="empty-state-icon" />
              <h3 className="empty-state-title" style={{ fontSize: '1.125rem' }}>
                No monitors configured
              </h3>
              <p className="empty-state-desc" style={{ fontSize: '0.875rem' }}>
                Create your first monitor to start collecting real HTTP health, response time latency, and uptime history.
              </p>
              <Link to="/monitors/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Create Monitor
              </Link>
            </div>
          )}
        </div>

        {/* 8. Recent Health Checks Activity Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--brand-dark)' }} />
              Recent Health Check Activity
            </h2>
            <span className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
              Latest HTTP ping executions
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Target Monitor</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>HTTP Code</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Latency</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Checked At</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Details / Error</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHealthChecks.length > 0 ? (
                    recentHealthChecks.slice(0, 15).map((hc) => (
                      <tr key={hc.id} style={{ borderBottom: '1px solid var(--border-muted)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          <Link to={`/monitors/${hc.monitor_id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                            {hc.monitor_name}
                          </Link>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <StatusBadge status={hc.status} />
                        </td>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                          {hc.status_code !== null && hc.status_code !== undefined ? hc.status_code : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem' }}>
                          {hc.response_time !== null && hc.response_time !== undefined ? `${hc.response_time} ms` : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {hc.checked_at
                            ? new Date(hc.checked_at.endsWith('Z') ? hc.checked_at : `${hc.checked_at}Z`).toLocaleTimeString()
                            : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {hc.error || 'OK'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No health-check data yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight Vanilla SVG Response Time Latency Visualizer with Hourly X-Axis Detail
 */
function ResponseTimeChart({ checks }) {
  if (!checks || checks.length === 0) return null;

  // 1. Sort chronological (oldest to newest left-to-right)
  const sorted = [...checks].sort((a, b) => {
    const tA = new Date(a.checked_at?.endsWith('Z') ? a.checked_at : `${a.checked_at}Z`).getTime();
    const tB = new Date(b.checked_at?.endsWith('Z') ? b.checked_at : `${b.checked_at}Z`).getTime();
    return tA - tB;
  });

  // 2. Uniform downsampling if large number of data points returned from backend across hours
  const maxPoints = 25;
  let chronological = sorted;
  if (sorted.length > maxPoints) {
    const step = (sorted.length - 1) / (maxPoints - 1);
    chronological = [];
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.min(Math.round(i * step), sorted.length - 1);
      chronological.push(sorted[idx]);
    }
  }

  const pointsCount = chronological.length;

  const width = 800;
  const height = 230;
  const paddingX = 50;
  const paddingTop = 25;
  const paddingBottom = 50;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const latencies = chronological.map((c) => c.response_time || 0);
  const maxMs = Math.max(...latencies, 200);

  const coords = chronological.map((c, i) => {
    const x = paddingX + (i / Math.max(pointsCount - 1, 1)) * chartW;
    const ms = c.response_time || 0;
    const y = paddingTop + chartH - (ms / maxMs) * chartH;
    return {
      x,
      y,
      ms,
      status: c.status,
      name: c.monitor_name,
      time: c.checked_at,
    };
  });

  const pathD = coords.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  const areaD = pathD
    ? `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartH} L ${coords[0].x} ${paddingTop + chartH} Z`
    : '';

  const formatHourLabel = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr.endsWith('Z') ? isoStr : `${isoStr}Z`);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullTimestamp = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr.endsWith('Z') ? isoStr : `${isoStr}Z`);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-dark)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand-dark)" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid Lines & Y-Axis Latency Labels */}
      {[0, 0.5, 1].map((ratio, idx) => {
        const yVal = paddingTop + chartH * (1 - ratio);
        const msLabel = Math.round(maxMs * ratio);
        return (
          <g key={idx}>
            <line x1={paddingX} y1={yVal} x2={width - paddingX} y2={yVal} stroke="var(--border-muted)" strokeDasharray="3 3" />
            <text x={paddingX - 8} y={yVal + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
              {msLabel}ms
            </text>
          </g>
        );
      })}

      {/* Latency Gradient Fill */}
      {areaD && <path d={areaD} fill="url(#latencyGradient)" />}

      {/* Latency Curve Line */}
      {pathD && <path d={pathD} fill="none" stroke="var(--brand-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

      {/* X-Axis Guidelines & Hourly Time Labels */}
      {coords.map((pt, idx) => {
        const step = Math.max(1, Math.floor(pointsCount / 6));
        const showLabel = idx === 0 || idx === pointsCount - 1 || idx % step === 0;

        const color = pt.status === 'DOWN' ? 'var(--danger)' : pt.status === 'DEGRADED' ? 'var(--warning)' : 'var(--success)';

        return (
          <g key={idx}>
            {/* Vertical tick guideline to X-axis */}
            <line
              x1={pt.x}
              y1={pt.y}
              x2={pt.x}
              y2={paddingTop + chartH}
              stroke="var(--border-muted)"
              strokeDasharray="2 2"
              opacity={showLabel ? 0.6 : 0.2}
            />

            {/* Data Point Circle */}
            <circle cx={pt.x} cy={pt.y} r="4.5" fill={color} stroke="var(--surface)" strokeWidth="2">
              <title>{`${pt.name}: ${pt.ms}ms (${pt.status})\nChecked: ${formatFullTimestamp(pt.time)}`}</title>
            </circle>

            {/* X-Axis Hour Label */}
            {showLabel && (
              <text
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="600"
                fontFamily="monospace"
              >
                {formatHourLabel(pt.time)}
              </text>
            )}
          </g>
        );
      })}

      {/* Baseline X-axis line */}
      <line x1={paddingX} y1={paddingTop + chartH} x2={width - paddingX} y2={paddingTop + chartH} stroke="var(--border)" strokeWidth="1" />
    </svg>
  );
}

function roundDecimal(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return 0;
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

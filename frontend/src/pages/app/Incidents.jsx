import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, RotateCcw, AlertCircle, Search, ArrowUpDown, X } from 'lucide-react';
import { incidentsApi } from '../../api/incidents';
import { monitorsApi } from '../../api/monitors';
import StatusBadge from '../../components/common/StatusBadge';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [monitorsMap, setMonitorsMap] = useState({});
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'duration'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncidentsData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [incidentsData, monitorsData] = await Promise.all([
        incidentsApi.getIncidents(),
        monitorsApi.getMonitors().catch(() => []),
      ]);

      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);

      const map = {};
      if (Array.isArray(monitorsData)) {
        monitorsData.forEach((m) => {
          map[m.id] = m;
        });
      }
      setMonitorsMap(map);
    } catch (err) {
      console.error('Failed to fetch incidents:', err.message);
      setError(err.message || 'Unable to load incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidentsData();
  }, [fetchIncidentsData]);

  // Filtered and Sorted Incidents
  const processedIncidents = useMemo(() => {
    let result = [...incidents];

    // 1. Status Filter
    if (filter === 'OPEN') {
      result = result.filter((i) => i.status === 'OPEN');
    } else if (filter === 'RESOLVED') {
      result = result.filter((i) => i.status === 'RESOLVED');
    }

    // 2. Search Query (Monitor name or incident reason)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((inc) => {
        const mon = monitorsMap[inc.monitor_id];
        const monName = mon?.name ? mon.name.toLowerCase() : '';
        const reason = inc.reason ? inc.reason.toLowerCase() : '';
        return monName.includes(q) || reason.includes(q);
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const tA = new Date(a.started_at || 0).getTime();
        const tB = new Date(b.started_at || 0).getTime();
        return tB - tA;
      }
      if (sortBy === 'oldest') {
        const tA = new Date(a.started_at || 0).getTime();
        const tB = new Date(b.started_at || 0).getTime();
        return tA - tB;
      }
      if (sortBy === 'duration') {
        const dA = a.duration ?? 0;
        const dB = b.duration ?? 0;
        return dB - dA;
      }
      return 0;
    });

    return result;
  }, [incidents, filter, searchQuery, sortBy, monitorsMap]);

  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

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
          <h1 className="heading-xl">Incidents</h1>
          <p className="page-desc">Track service downtime, root cause logs, and resolution timelines.</p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            backgroundColor: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'ALL' ? 'var(--surface)' : 'transparent',
              color: filter === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: filter === 'ALL' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            All ({incidents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('OPEN')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'OPEN' ? 'var(--surface)' : 'transparent',
              color: filter === 'OPEN' ? 'var(--danger)' : 'var(--text-secondary)',
              boxShadow: filter === 'OPEN' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: filter === 'RESOLVED' ? 'var(--surface)' : 'transparent',
              color: filter === 'RESOLVED' ? 'var(--success)' : 'var(--text-secondary)',
              boxShadow: filter === 'RESOLVED' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Sort */}
      {!loading && !error && incidents.length > 0 && (
        <div
          className="card"
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search by monitor name or root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: searchQuery ? '30px' : '10px', width: '100%', fontSize: '0.875rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
            >
              <option value="newest">Sort by Newest</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>Loading incidents...</p>
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="card"
              style={{
                height: '90px',
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
            onClick={fetchIncidentsData}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Zero Incidents Empty State */}
      {!loading && !error && incidents.length === 0 && (
        <div className="empty-state">
          <CheckCircle2 size={36} className="empty-state-icon" style={{ color: 'var(--success)' }} />
          <h2 className="empty-state-title">No Incidents Reported</h2>
          <p className="empty-state-desc">
            All monitored endpoints are performing within configured thresholds. Downtime incidents will automatically be logged here when consecutive failure thresholds are triggered.
          </p>
        </div>
      )}

      {/* Filtered Zero State */}
      {!loading && !error && incidents.length > 0 && processedIncidents.length === 0 && (
        <div className="card empty-state" style={{ padding: '2.5rem 1rem' }}>
          <AlertTriangle size={32} className="empty-state-icon" style={{ opacity: 0.5 }} />
          <h3 className="empty-state-title" style={{ fontSize: '1.125rem' }}>No matching incidents found</h3>
          <p className="empty-state-desc" style={{ fontSize: '0.875rem' }}>
            Try adjusting your search query or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('ALL');
              setSearchQuery('');
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.5rem' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Incidents List */}
      {!loading && !error && processedIncidents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {processedIncidents.map((incident) => {
            const monitor = monitorsMap[incident.monitor_id];
            const isOpen = incident.status === 'OPEN';
            const startDate = incident.started_at
              ? new Date(incident.started_at.endsWith('Z') ? incident.started_at : `${incident.started_at}Z`)
              : null;
            const endDate = incident.resolved_at
              ? new Date(incident.resolved_at.endsWith('Z') ? incident.resolved_at : `${incident.resolved_at}Z`)
              : null;

            return (
              <div
                key={incident.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderLeft: isOpen ? '4px solid var(--danger)' : '4px solid var(--success)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Incident #{incident.id}
                      </span>
                      {monitor && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-dark)' }}>
                          • {monitor.name}
                        </span>
                      )}
                    </div>
                    {monitor && (
                      <span className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        {monitor.url}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {monitor && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Monitor: <StatusBadge status={monitor.status} size="small" />
                      </span>
                    )}
                    <StatusBadge status={incident.status} />
                  </div>
                </div>

                <p className="body-text" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                  <strong>Root Cause:</strong> {incident.reason || 'Health check threshold exceeded'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-muted)',
                    paddingTop: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>Started: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{startDate ? startDate.toLocaleString() : 'N/A'}</strong></span>
                    {endDate && (
                      <span>Resolved: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{endDate.toLocaleString()}</strong></span>
                    )}
                    <span>Duration: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{incident.duration !== null ? `${incident.duration}s` : 'Ongoing'}</strong></span>
                  </div>

                  <Link to={`/incidents/${incident.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    View Full Incident Report
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

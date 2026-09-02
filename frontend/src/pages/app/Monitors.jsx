import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Plus, AlertCircle, RotateCcw, Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { monitorsApi } from '../../api/monitors';
import MonitorCard from '../../components/monitors/MonitorCard';

export default function Monitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchMonitors = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');

    try {
      const data = await monitorsApi.getMonitors();
      setMonitors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch monitors:', err.message);
      setError(err.message || 'Unable to load monitors. Please check your connection and try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // Periodic silent polling (Every 10s)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMonitors(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [fetchMonitors]);

  // Filter & Sort Logic
  const filteredAndSortedMonitors = useMemo(() => {
    let result = [...monitors];

    // 1. Search Query Filter (name or url)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.url && m.url.toLowerCase().includes(query))
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PAUSED') {
        result = result.filter((m) => !m.is_active || m.status === 'PAUSED');
      } else {
        result = result.filter((m) => m.status === statusFilter);
      }
    }

    // 3. Sorting
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortBy === 'status') {
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
      } else if (sortBy === 'interval') {
        valA = a.interval || 0;
        valB = b.interval || 0;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [monitors, searchQuery, statusFilter, sortBy, sortDir]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Toast Notification Banner */}
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

      {/* Toolbar: Search, Filters, Sorting */}
      {!loading && !error && monitors.length > 0 && (
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
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Search monitors by name or URL..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="UP">UP</option>
                <option value="DOWN">DOWN</option>
                <option value="DEGRADED">DEGRADED</option>
                <option value="PENDING">PENDING</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>

            {/* Sorting Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="interval">Sort by Interval</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                title={`Sort ${sortDir === 'asc' ? 'Descending' : 'Ascending'}`}
                style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}
              >
                {sortDir.toUpperCase()}
              </button>
            </div>

            {/* Clear Filters CTA */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.8125rem', color: 'var(--brand-dark)' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

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
            onClick={() => fetchMonitors()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Zero Monitors Base Empty State */}
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

      {/* Filtered Zero Results State */}
      {!loading && !error && monitors.length > 0 && filteredAndSortedMonitors.length === 0 && (
        <div className="card empty-state" style={{ padding: '2.5rem 1rem' }}>
          <Search size={32} className="empty-state-icon" style={{ opacity: 0.5 }} />
          <h3 className="empty-state-title" style={{ fontSize: '1.125rem' }}>No monitors match your filters</h3>
          <p className="empty-state-desc" style={{ fontSize: '0.875rem' }}>
            Try adjusting your search term or status filter criteria.
          </p>
          <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Real Monitor List Grid */}
      {!loading && !error && filteredAndSortedMonitors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {filteredAndSortedMonitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onRefresh={() => fetchMonitors(true)}
              showToast={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}

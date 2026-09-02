import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

/**
 * MonitorCard Component
 *
 * Renders a single monitor resource from the backend MonitorResponse schema.
 */
export default function MonitorCard({ monitor }) {
  if (!monitor) return null;

  const {
    id,
    name,
    url,
    method = 'GET',
    interval = 60,
    expected_status = 200,
    status = 'PENDING',
    is_active = true,
  } = monitor;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        transition: 'border-color var(--transition-fast)',
      }}
    >
      {/* Top Header Row: Name & Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </h3>
          <div
            className="font-mono"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Globe size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            <span>{url}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border-muted)', margin: '0.25rem 0' }} />

      {/* Bottom Metadata & View Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {method}
          </span>
          <span>•</span>
          <span>Every {interval}s</span>
          <span>•</span>
          <span>Expected {expected_status}</span>
          {!is_active && (
            <>
              <span>•</span>
              <span style={{ color: 'var(--warning)', fontWeight: 500 }}>PAUSED</span>
            </>
          )}
        </div>

        <Link
          to={`/monitors/${id}`}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            fontSize: '0.8125rem',
          }}
        >
          <span>View</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

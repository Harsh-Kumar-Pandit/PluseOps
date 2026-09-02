import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Play, Pause, Trash2, Edit, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { monitorsApi } from '../../api/monitors';

/**
 * MonitorCard Component
 *
 * Renders a single monitor resource from the backend MonitorResponse schema with Pause/Resume, Edit, and Delete actions.
 */
export default function MonitorCard({ monitor, onRefresh, showToast }) {
  const [actionPending, setActionPending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handlePauseResume = async () => {
    if (actionPending) return;
    setActionPending(true);
    try {
      if (is_active) {
        await monitorsApi.pauseMonitor(id);
        if (showToast) showToast(`Monitor "${name}" paused.`);
      } else {
        await monitorsApi.resumeMonitor(id);
        if (showToast) showToast(`Monitor "${name}" resumed.`);
      }
      if (onRefresh) await onRefresh();
    } catch (err) {
      if (showToast) showToast(`Failed to update monitor state: ${err.message || 'Unknown error'}`);
    } finally {
      setActionPending(false);
    }
  };

  const handleDelete = async () => {
    setActionPending(true);
    try {
      await monitorsApi.deleteMonitor(id);
      setShowDeleteModal(false);
      if (showToast) showToast(`Monitor "${name}" deleted.`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      if (showToast) showToast(`Failed to delete monitor: ${err.message}`);
    } finally {
      setActionPending(false);
    }
  };

  return (
    <>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            </div>
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

        {/* Bottom Metadata & Action Row */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Pause / Resume Action */}
            <button
              type="button"
              onClick={handlePauseResume}
              disabled={actionPending}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.625rem',
              }}
              title={is_active ? 'Pause health checking' : 'Resume health checking'}
            >
              {is_active ? <Pause size={13} /> : <Play size={13} />}
              <span>{is_active ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Edit Action */}
            <Link
              to={`/monitors/${id}/edit`}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.625rem',
                textDecoration: 'none',
              }}
              title="Edit monitor configuration"
            >
              <Edit size={13} />
              <span>Edit</span>
            </Link>

            {/* Delete Action */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={actionPending}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.625rem',
                color: 'var(--danger)',
              }}
              title="Delete monitor"
            >
              <Trash2 size={13} />
            </button>

            {/* View Details Action */}
            <Link
              to={`/monitors/${id}`}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.625rem',
                textDecoration: 'none',
              }}
            >
              <span>View</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Monitor"
          onClose={() => setShowDeleteModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="body-text" style={{ margin: 0 }}>
                  Are you sure you want to delete <strong>{name}</strong>?
                </p>
                <p className="body-text text-muted" style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                  This action will permanently delete all associated health check history and incident logs. This cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDelete}
                disabled={actionPending}
                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                {actionPending ? 'Deleting...' : 'Delete Monitor'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

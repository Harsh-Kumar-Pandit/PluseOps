import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Check, AlertCircle, CheckCircle2, AlertTriangle, RotateCcw, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const pageSize = 20;

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await notificationsApi.getNotifications({
        limit: pageSize,
        offset: page * pageSize,
        unread_only: tab === 'UNREAD',
      });
      setNotifications(res.items || []);
      setTotal(res.total || 0);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications page:', err.message);
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    try {
      await notificationsApi.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) {
      return;
    }
    setClearingAll(true);
    try {
      await notificationsApi.clearAll();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err.message);
    } finally {
      setClearingAll(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.incident_id) {
      navigate(`/incidents/${notif.incident_id}`);
    } else if (notif.monitor_id) {
      navigate(`/monitors/${notif.monitor_id}`);
    }
  };

  const getBadgeForType = (type) => {
    if (type === 'DOWN') {
      return (
        <span style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> DOWN
        </span>
      );
    }
    if (type === 'RECOVERY') {
      return (
        <span style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={12} /> RECOVERY
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <AlertTriangle size={12} /> DEGRADED
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
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
          <h1 className="heading-xl">Notifications</h1>
          <p className="page-desc">Real-time infrastructure alerts, incident logs, and service status updates.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Tab Filter */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => { setTab('ALL'); setPage(0); }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === 'ALL' ? 'var(--surface)' : 'transparent',
                color: tab === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => { setTab('UNREAD'); setPage(0); }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tab === 'UNREAD' ? 'var(--surface)' : 'transparent',
                color: tab === 'UNREAD' ? 'var(--brand-dark)' : 'var(--text-secondary)',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <button
              type="button"
              disabled={clearingAll}
              onClick={handleClearAllNotifications}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f85149' }}
            >
              <Trash2 size={14} /> {clearingAll ? 'Clearing...' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="body-text text-muted" style={{ fontSize: '0.875rem' }}>Loading notifications...</p>
          {[1, 2, 3].map((id) => (
            <div key={id} className="card" style={{ height: '70px', opacity: 0.6, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card" style={{ backgroundColor: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={fetchNotifications} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <Bell size={36} className="empty-state-icon" style={{ opacity: 0.5 }} />
          <h2 className="empty-state-title">
            {tab === 'UNREAD' ? "You're all caught up." : 'No notifications'}
          </h2>
          <p className="empty-state-desc">
            {tab === 'UNREAD'
              ? 'You have read all past infrastructure alert notifications.'
              : 'Alert notifications generated by state transitions will appear here.'}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-muted)',
                backgroundColor: notif.is_read ? 'transparent' : 'var(--surface-secondary)',
                cursor: notif.incident_id || notif.monitor_id ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                {getBadgeForType(notif.type)}
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: notif.is_read ? 500 : 700, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <p className="body-text" style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                    {new Date(notif.created_at.endsWith('Z') ? notif.created_at : `${notif.created_at}Z`).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!notif.is_read && (
                  <button
                    type="button"
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  >
                    <Check size={13} /> Mark read
                  </button>
                )}

                {/* Delete Notification Button */}
                <button
                  type="button"
                  title="Delete notification"
                  disabled={deletingId === notif.id}
                  onClick={(e) => handleDeleteNotification(notif.id, e)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#f85149';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Footer */}
          {total > pageSize && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', padding: '0.75rem 1.25rem', backgroundColor: 'var(--surface-secondary)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Page {page + 1} of {Math.ceil(total / pageSize)}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={(page + 1) * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

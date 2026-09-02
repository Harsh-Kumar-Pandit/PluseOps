import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, AlertCircle, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setError('');
      const res = await notificationsApi.getNotifications({ limit: 10 });
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
      setError(err.message || 'Unable to load notifications');
    }
  }, []);

  // Poll notifications every 15 seconds silently
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
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

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);

    if (notif.incident_id) {
      navigate(`/incidents/${notif.incident_id}`);
    } else if (notif.monitor_id) {
      navigate(`/monitors/${notif.monitor_id}`);
    } else {
      navigate('/notifications');
    }
  };

  const getIconForType = (type) => {
    if (type === 'DOWN') return <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
    if (type === 'RECOVERY') return <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />;
    return <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: 'var(--danger)',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 700,
              borderRadius: '9999px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '320px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Popover Header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--brand-dark)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    padding: '1px 6px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--brand-dark)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {error ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--danger)', fontSize: '0.8125rem' }}>
                <AlertCircle size={20} style={{ marginBottom: '6px' }} />
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={24} style={{ marginBottom: '6px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.8125rem' }}>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-muted)',
                    backgroundColor: notif.is_read ? 'transparent' : 'var(--surface-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {getIconForType(notif.type)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: notif.is_read ? 500 : 700,
                          fontSize: '0.8125rem',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark read"
                          style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      {new Date(notif.created_at.endsWith('Z') ? notif.created_at : `${notif.created_at}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div
            style={{
              padding: '0.5rem 1rem',
              borderTop: '1px solid var(--border-muted)',
              textAlign: 'center',
              backgroundColor: 'var(--surface-secondary)',
            }}
          >
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--brand-dark)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Notifications <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

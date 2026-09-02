import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, User, Mail, ShieldCheck, Bell, AlertTriangle, CheckCircle, Check, Edit3, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();

  // Load preferences state
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Preference update state
  const [savingKey, setSavingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const fetchPreferences = async () => {
    setLoadingPrefs(true);
    setLoadError(false);
    try {
      const updatedUser = await authApi.getCurrentUser();
      if (setUser) {
        setUser(updatedUser);
      }
      setNameInput(updatedUser?.name || '');
    } catch (err) {
      console.error('Failed to load preferences:', err.message);
      setLoadError(true);
    } finally {
      setLoadingPrefs(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const emailNotificationsEnabled = user?.email_notifications_enabled ?? true;
  const downAlertsEnabled = user?.down_alerts_enabled ?? true;
  const recoveryAlertsEnabled = user?.recovery_alerts_enabled ?? true;

  const handleUpdatePref = async (key, currentValue) => {
    const newValue = !currentValue;
    setSavingKey(key);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = { [key]: newValue };
      const updatedUser = await authApi.updatePreferences(payload);
      if (setUser) {
        setUser(updatedUser);
      }

      // Generate specific success toast message per requirement 12
      let toastText = 'Preference updated successfully.';
      if (key === 'email_notifications_enabled') {
        toastText = newValue ? 'Email notifications enabled.' : 'Email notifications disabled.';
      } else if (key === 'down_alerts_enabled') {
        toastText = newValue ? 'DOWN email alerts enabled.' : 'DOWN email alerts disabled.';
      } else if (key === 'recovery_alerts_enabled') {
        toastText = newValue ? 'Recovery email alerts enabled.' : 'Recovery email alerts disabled.';
      }

      setSuccessMsg(toastText);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update preference:', err.message);
      setErrorMsg(err.message || 'Failed to update preference.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSavingKey(null);
    }
  };

  const handleStartEditProfile = () => {
    setNameInput(user?.name || '');
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setNameInput(user?.name || '');
    setProfileError('');
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (trimmed.length > 100) {
      setProfileError('Name must not exceed 100 characters.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updatedUser = await authApi.updateProfile({ name: trimmed });
      if (setUser) {
        setUser(updatedUser);
      }
      setIsEditingProfile(false);
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err.message);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', desc: 'Default clean light interface', icon: Sun },
    { value: 'dark', label: 'Dark', desc: 'Low-light infrastructure dark theme', icon: Moon },
    { value: 'system', label: 'System', desc: 'Sync with operating system preference', icon: Monitor },
  ];

  return (
    <div style={{ maxWidth: '800px', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl">Settings</h1>
          <p className="page-desc">Manage your account profile and application preferences.</p>
        </div>
        {successMsg && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Check size={16} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(248, 81, 73, 0.15)', color: '#f85149', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Appearance & Theme Section */}
        <div className="card">
          <h2 className="heading-md" style={{ marginBottom: '0.25rem' }}>Appearance & Theme</h2>
          <p className="body-text text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Customize how PulseOps looks on your device. Selections are saved automatically.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--brand-soft)' : 'var(--surface-secondary)',
                    border: isSelected ? '2px solid var(--brand-dark)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Icon size={18} style={{ color: isSelected ? 'var(--brand-dark)' : 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: isSelected ? 'var(--brand-dark)' : 'var(--text-primary)' }}>
                      {opt.label}
                    </span>
                  </div>
                  <span className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Alert Delivery Preferences */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 className="heading-md">Email Alert Delivery</h2>
            {!loadingPrefs && !loadError && !emailNotificationsEnabled && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                Email delivery is currently disabled.
              </span>
            )}
          </div>
          <p className="body-text text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Control which operational alerts are delivered to your registered email address.
          </p>

          {loadError ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p className="body-text text-muted" style={{ marginBottom: '1rem', color: '#f85149', fontWeight: 600 }}>
                Unable to load notification preferences
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fetchPreferences}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : loadingPrefs && !user ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading settings...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Master Email Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={20} style={{ color: 'var(--brand-dark)' }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'block' }}>
                      Master Email Notifications
                    </span>
                    <span className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
                      Enable or disable all operational email alerts.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingKey === 'email_notifications_enabled'}
                  onClick={() => handleUpdatePref('email_notifications_enabled', emailNotificationsEnabled)}
                  className={emailNotificationsEnabled ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ minWidth: '90px' }}
                >
                  {savingKey === 'email_notifications_enabled' ? 'Saving...' : emailNotificationsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Granular Down Alerts Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  opacity: emailNotificationsEnabled ? 1 : 0.5,
                  pointerEvents: emailNotificationsEnabled ? 'auto' : 'none',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(248, 81, 73, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={20} style={{ color: '#f85149' }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'block' }}>
                      DOWN Incident Alerts
                    </span>
                    <span className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
                      Receive an email when a monitored service is confirmed down.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingKey === 'down_alerts_enabled' || !emailNotificationsEnabled}
                  onClick={() => handleUpdatePref('down_alerts_enabled', downAlertsEnabled)}
                  className={downAlertsEnabled && emailNotificationsEnabled ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ minWidth: '90px' }}
                >
                  {savingKey === 'down_alerts_enabled' ? 'Saving...' : downAlertsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Granular Recovery Alerts Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  opacity: emailNotificationsEnabled ? 1 : 0.5,
                  pointerEvents: emailNotificationsEnabled ? 'auto' : 'none',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(46, 160, 67, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={20} style={{ color: '#3fb950' }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'block' }}>
                      Recovery Alerts
                    </span>
                    <span className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
                      Receive an email when an incident is resolved and the service recovers.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingKey === 'recovery_alerts_enabled' || !emailNotificationsEnabled}
                  onClick={() => handleUpdatePref('recovery_alerts_enabled', recoveryAlertsEnabled)}
                  className={recoveryAlertsEnabled && emailNotificationsEnabled ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ minWidth: '90px' }}
                >
                  {savingKey === 'recovery_alerts_enabled' ? 'Saving...' : recoveryAlertsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Profile Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h2 className="heading-md">Account Profile</h2>
            {!isEditingProfile && user && (
              <button
                type="button"
                onClick={handleStartEditProfile}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', padding: '6px 12px' }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>
          <p className="body-text text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Your authenticated PulseOps user profile details.
          </p>

          {user ? (
            isEditingProfile ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {profileError && (
                  <div style={{ fontSize: '0.8125rem', color: '#f85149', fontWeight: 600 }}>
                    {profileError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  {/* Full Name Edit Input */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter full name"
                      disabled={savingProfile}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                    />
                  </div>

                  {/* Registered Email (Read-only) */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Email Address (Read-only)
                    </label>
                    <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', fontSize: '0.875rem' }} className="font-mono text-muted">
                      {user.email}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Registered alert destination
                    </span>
                  </div>

                  {/* Account ID (Read-only) */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Account ID (Read-only)
                    </label>
                    <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', fontSize: '0.875rem' }} className="font-mono text-muted">
                      #{user.id}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCancelEditProfile}
                    disabled={savingProfile}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary"
                  >
                    {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} style={{ color: 'var(--brand-dark)' }} />
                  </div>
                  <div>
                    <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Full Name</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{user.name}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--info-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} style={{ color: 'var(--info)' }} />
                  </div>
                  <div>
                    <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Email Address</span>
                    <span className="font-mono" style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.email}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Registered alert destination</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
                  </div>
                  <div>
                    <span className="body-text text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Account ID</span>
                    <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>#{user.id}</span>
                  </div>
                </div>
              </div>
            )
          ) : (
            <p className="body-text text-muted">No authenticated user session found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

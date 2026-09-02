import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', desc: 'Default clean light interface', icon: Sun },
    { value: 'dark', label: 'Dark', desc: 'Low-light infrastructure dark theme', icon: Moon },
    { value: 'system', label: 'System', desc: 'Sync with operating system preference', icon: Monitor },
  ];

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="heading-xl">Settings</h1>
        <p className="page-desc">Manage your account and application preferences.</p>
      </div>

      {/* Real Theme Preferences Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
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

      {/* Account Settings Section Shell */}
      <div className="card">
        <h2 className="heading-md" style={{ marginBottom: '0.25rem' }}>Account Information</h2>
        <p className="body-text text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          Account profile and credential management will be configured here after authentication integration.
        </p>
      </div>
    </div>
  );
}

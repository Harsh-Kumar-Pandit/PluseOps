import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher() {
  const { effectiveTheme, setTheme } = useTheme();

  const isDark = effectiveTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <>
          <Moon size={14} style={{ color: 'var(--brand-dark)' }} />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun size={14} style={{ color: 'var(--brand-dark)' }} />
          <span>Light</span>
        </>
      )}
    </button>
  );
}

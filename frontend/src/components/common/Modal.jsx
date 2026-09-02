import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Dialog Component
 */
export default function Modal({ title, onClose, children }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '1.5rem',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="heading-md" style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

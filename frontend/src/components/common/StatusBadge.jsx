import React from 'react';

/**
 * StatusBadge Component
 *
 * Renders status indicators for UP, DOWN, DEGRADED, PAUSED, PENDING
 * using design system semantic tokens. Works in both light and dark mode.
 */
export default function StatusBadge({ status = 'PENDING', size = 'normal' }) {
  const statusUpper = status.toUpperCase();

  const statusConfig = {
    UP: {
      bg: 'var(--success-soft)',
      color: 'var(--success)',
      dotColor: 'var(--success)',
      label: 'UP',
    },
    DOWN: {
      bg: 'var(--danger-soft)',
      color: 'var(--danger)',
      dotColor: 'var(--danger)',
      label: 'DOWN',
    },
    DEGRADED: {
      bg: 'var(--warning-soft)',
      color: 'var(--warning)',
      dotColor: 'var(--warning)',
      label: 'DEGRADED',
    },
    PAUSED: {
      bg: 'var(--neutral-status-soft)',
      color: 'var(--neutral-status)',
      dotColor: 'var(--neutral-status)',
      label: 'PAUSED',
    },
    PENDING: {
      bg: 'var(--info-soft)',
      color: 'var(--info)',
      dotColor: 'var(--info)',
      label: 'PENDING',
    },
  };

  const config = statusConfig[statusUpper] || statusConfig.PENDING;

  const isSmall = size === 'small';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '20px',
        backgroundColor: config.bg,
        color: config.color,
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-sans)',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '8px',
          height: isSmall ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
        }}
      />
      {config.label}
    </span>
  );
}

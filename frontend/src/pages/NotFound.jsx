import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 1.5rem' }}>
        <h1
          style={{
            fontSize: '4.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: 'var(--brand-dark)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          404
        </h1>
        <h2 className="heading-lg" style={{ marginBottom: '0.5rem' }}>
          Page not found.
        </h2>
        <p className="body-text text-muted" style={{ marginBottom: '1.75rem', fontSize: '0.875rem' }}>
          The requested page could not be located on PulseOps infrastructure.
        </p>
        <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
          Back to PulseOps
        </Link>
      </div>
    </div>
  );
}

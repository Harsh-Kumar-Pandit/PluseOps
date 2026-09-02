import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function WhyPulseOps() {
  const points = [
    'Clear monitor configuration',
    'Automatic background health checks',
    'Persistent health history',
    'Incident tracking',
    'Response-time visibility',
    'Simple uptime statistics',
  ];

  return (
    <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-muted)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="heading-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Built for developers who care about reliability.
          </h2>
          <p className="body-text text-muted" style={{ maxWidth: '540px', margin: '0 auto' }}>
            Engineering-grade monitoring stripped of bloat and artificial complexity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '1rem 1.25rem',
              }}
            >
              <CheckCircle2 size={18} style={{ color: 'var(--brand-dark)', flexShrink: 0 }} />
              <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {pt}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

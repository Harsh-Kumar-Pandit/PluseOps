import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Step 1: Add a monitor',
      desc: 'Configure the endpoint, HTTP method, interval, timeout, expected status, and failure threshold.',
    },
    {
      step: '02',
      title: 'Step 2: PulseOps checks it',
      desc: 'Background workers perform health checks and record response status and timing.',
    },
    {
      step: '03',
      title: 'Step 3: See what happened',
      desc: 'Review monitor status, uptime statistics, health checks, and incidents.',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-muted)', scrollMarginTop: 'var(--header-height)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="heading-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            From endpoint to incident in three steps.
          </h2>
          <p className="body-text text-muted" style={{ maxWidth: '540px', margin: '0 auto' }}>
            Automated monitoring lifecycle operating seamlessly in the background.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {steps.map((item, index) => (
            <div key={index} className="card" style={{ position: 'relative', padding: '1.75rem 1.5rem' }}>
              <div
                className="font-mono"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--brand-dark)',
                  backgroundColor: 'var(--brand-soft)',
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                }}
              >
                STEP {item.step}
              </div>
              <h3 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '1.0625rem' }}>
                {item.title}
              </h3>
              <p className="body-text" style={{ fontSize: '0.875rem' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

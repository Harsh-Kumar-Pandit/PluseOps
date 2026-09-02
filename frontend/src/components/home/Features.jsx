import React from 'react';
import { Clock, Gauge, AlertTriangle, BarChart2 } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Clock,
      title: '1. Continuous Health Checks',
      desc: 'Automatically check configured endpoints at their selected interval.',
    },
    {
      icon: Gauge,
      title: '2. Response Time Tracking',
      desc: 'Track response latency and identify degraded performance.',
    },
    {
      icon: AlertTriangle,
      title: '3. Automatic Incident Detection',
      desc: 'Detect consecutive failures and create incidents automatically.',
    },
    {
      icon: BarChart2,
      title: '4. Uptime Statistics',
      desc: 'Review uptime, successful checks, failed checks, degraded checks, and response-time statistics.',
    },
  ];

  return (
    <section id="features" style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-muted)', scrollMarginTop: 'var(--header-height)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="heading-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Everything you need to understand service health.
          </h2>
          <p className="body-text text-muted" style={{ maxWidth: '580px', margin: '0 auto' }}>
            Core infrastructure observability features designed strictly around reliability and performance verification.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="card" style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--brand-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {item.title}
                </h3>
                <p className="body-text" style={{ fontSize: '0.875rem' }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

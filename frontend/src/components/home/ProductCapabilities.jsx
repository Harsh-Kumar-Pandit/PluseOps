import React from 'react';
import { Globe, Code, Server } from 'lucide-react';

export default function ProductCapabilities() {
  const capabilities = [
    {
      icon: Globe,
      title: 'Websites',
      desc: 'Monitor public websites and endpoints for availability and response time.',
    },
    {
      icon: Code,
      title: 'APIs',
      desc: 'Track HTTP endpoints and expected response status codes.',
    },
    {
      icon: Server,
      title: 'Infrastructure Health',
      desc: 'Detect failures, degraded performance, and incidents automatically.',
    },
  ];

  return (
    <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-muted)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="heading-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Monitor what matters.
          </h2>
          <p className="body-text text-muted" style={{ maxWidth: '540px', margin: '0 auto' }}>
            Essential observability capabilities tailored for modern web applications and microservices.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="card" style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--brand-soft)',
                    color: 'var(--brand-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
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

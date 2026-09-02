import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';

export default function ArchitectureSection() {
  const nodes = [
    { title: 'Monitor Config', desc: 'URL & Thresholds' },
    { title: 'Scheduled Checks', desc: 'Periodic Trigger' },
    { title: 'Celery Worker', desc: 'Task Processing' },
    { title: 'HTTP Ping', desc: 'Request Execution' },
    { title: 'Health Log', desc: 'Response Parsing' },
    { title: 'PostgreSQL', desc: 'Data Retention' },
    { title: 'Incidents & Stats', desc: 'Lifecycle & Metrics' },
  ];

  return (
    <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border-muted)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="heading-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Under the Hood Architecture
          </h2>
          <p className="body-text text-muted" style={{ maxWidth: '580px', margin: '0 auto' }}>
            High-concurrency monitoring pipeline built with Python, FastAPI, Celery, and PostgreSQL.
          </p>
        </div>

        {/* Pipeline Cards Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {nodes.map((node, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  minWidth: '130px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  {node.title}
                </div>
                <div className="font-mono text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  {node.desc}
                </div>
              </div>
              {index < nodes.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-dark)' }}>
                  <ArrowRight size={16} className="desktop-arrow" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

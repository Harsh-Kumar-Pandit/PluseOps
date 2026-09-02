import React, { useState } from 'react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'monitors', label: 'Monitors' },
    { id: 'health-checks', label: 'Health Checks' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'api-reference', label: 'API Reference' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem' }}>
        {/* Docs Sidebar Navigation */}
        <aside style={{ borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
            Documentation
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sections.map((sec) => (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: activeSection === sec.id ? 600 : 400,
                    backgroundColor: activeSection === sec.id ? 'var(--brand-soft)' : 'transparent',
                    color: activeSection === sec.id ? 'var(--brand-dark)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {sec.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Docs Content Body */}
        <main>
          {activeSection === 'introduction' ? (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Introduction</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Overview of the PulseOps infrastructure monitoring platform architecture and capabilities.
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="heading-md" style={{ marginBottom: '0.75rem' }}>What is PulseOps?</h2>
                <p className="body-text" style={{ marginBottom: '1rem' }}>
                  PulseOps is a developer-focused uptime and infrastructure monitoring platform. It continuously checks HTTP endpoints and websites, measures latency, records health check history, and automatically creates and resolves incidents based on configurable failure thresholds.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Automated Pings</div>
                    <div className="body-text" style={{ fontSize: '0.8125rem' }}>Configurable 60-second health checks executed via background workers.</div>
                  </div>
                  <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Incident Lifecycle</div>
                    <div className="body-text" style={{ fontSize: '0.8125rem' }}>Automatic open/resolve state transitions with failure & recovery thresholds.</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>
                {sections.find((s) => s.id === activeSection)?.label}
              </h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Detailed documentation for {sections.find((s) => s.id === activeSection)?.label}.
              </p>
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="body-text text-muted">
                  Documentation section for <strong>{sections.find((s) => s.id === activeSection)?.label}</strong> will be populated in subsequent implementation phases.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

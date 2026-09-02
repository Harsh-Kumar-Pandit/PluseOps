import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section style={{ padding: '4.5rem 0 5rem', backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h2 className="heading-xl" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          Start monitoring your services.
        </h2>
        <p className="body-text text-muted" style={{ fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
          Know when something breaks before your users report it.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.625rem 1.375rem', fontSize: '0.9375rem' }}>
            Start Monitoring <ArrowRight size={16} />
          </Link>
          <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.625rem 1.375rem', fontSize: '0.9375rem' }}>
            Read the Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}

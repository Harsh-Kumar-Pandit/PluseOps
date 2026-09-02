import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import MonitoringVisual from './MonitoringVisual';

export default function Hero() {
  return (
    <section style={{ padding: '3.5rem 0 4rem', borderBottom: '1px solid var(--border-muted)' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Hero Text Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              <ShieldCheck size={14} />
              <span>Developer-Focused Observability</span>
            </div>

            <h1 className="heading-xl" style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.25rem', fontWeight: 700 }}>
              Know when your services go down.{' '}
              <span style={{ color: 'var(--brand-dark)', display: 'block', marginTop: '4px' }}>
                Before your users do.
              </span>
            </h1>

            <p className="body-text" style={{ fontSize: '1.0625rem', marginBottom: '2rem', maxWidth: '520px' }}>
              PulseOps continuously monitors your websites and APIs, tracks uptime and response time, and automatically detects failures and incidents.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }}>
                Start Monitoring <ArrowRight size={16} />
              </Link>
              <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }}>
                Read the Docs
              </Link>
            </div>

            <p className="body-text text-muted" style={{ fontSize: '0.8125rem' }}>
              Built for developers. Designed for reliability.
            </p>
          </div>

          {/* Right Hero Visual Column */}
          <div>
            <MonitoringVisual />
          </div>

        </div>
      </div>
    </section>
  );
}

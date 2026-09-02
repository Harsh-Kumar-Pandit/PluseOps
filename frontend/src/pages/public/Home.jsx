import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function Home() {
  return (
    <div style={{ padding: '4rem 1.5rem', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 className="heading-xl" style={{ fontSize: '2.5rem', maxWidth: '780px', margin: '0 auto 1rem', fontWeight: 700 }}>
          Know when your services go down. Before your users do.
        </h1>
        <p className="body-text" style={{ fontSize: '1.0625rem', maxWidth: '640px', margin: '0 auto 2rem' }}>
          PulseOps continuously monitors your websites and APIs, tracks uptime and response time, and automatically detects failures and incidents.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }}>
            Start Monitoring
          </Link>
          <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem' }}>
            Read the Docs
          </Link>
        </div>
      </div>

      {/* Restrained Infrastructure Signal Visual Element */}
      <div
        className="card"
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '1.5rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--brand)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Infrastructure Signal Monitoring</span>
          </div>
          <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>PULSEOPS-ENGINE-v1</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>API Endpoint</span>
              <StatusBadge status="UP" size="small" />
            </div>
            <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>https://api.pulseops.io</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem' }}>
              <span className="text-muted">Latency</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>142ms</span>
            </div>
          </div>

          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Database Worker</span>
              <StatusBadge status="DEGRADED" size="small" />
            </div>
            <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>db-primary.pulseops.internal</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem' }}>
              <span className="text-muted">Latency</span>
              <span className="font-mono" style={{ fontWeight: 600, color: 'var(--warning)' }}>2150ms</span>
            </div>
          </div>

          <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Auth Gateway</span>
              <StatusBadge status="DOWN" size="small" />
            </div>
            <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>auth.pulseops.io</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem' }}>
              <span className="text-muted">Status</span>
              <span className="font-mono" style={{ fontWeight: 600, color: 'var(--danger)' }}>503 Service Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

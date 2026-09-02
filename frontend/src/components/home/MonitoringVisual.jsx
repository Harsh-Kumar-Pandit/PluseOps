import React from 'react';
import { Activity, Server, Database, Globe, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function MonitoringVisual() {
  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Visual Concept Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--brand)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Live Monitoring Visual
          </span>
        </div>
        <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
          INTERVAL: 60s
        </span>
      </div>

      {/* Network Nodes Diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Node 1 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={18} style={{ color: 'var(--brand-dark)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Web Application</div>
              <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>https://app.pulseops.io</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status="UP" size="small" />
            <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>42ms</div>
          </div>
        </div>

        {/* Connection Line Visual */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0', opacity: 0.5 }}>
          <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Node 2 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server size={18} style={{ color: 'var(--info)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>API Gateway</div>
              <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>POST /v1/health-check</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status="UP" size="small" />
            <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>118ms</div>
          </div>
        </div>

        {/* Connection Line Visual */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0', opacity: 0.5 }}>
          <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Node 3 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={18} style={{ color: 'var(--warning)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>PostgreSQL Worker</div>
              <div className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>db-primary.internal</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StatusBadge status="DEGRADED" size="small" />
            <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', marginTop: '2px' }}>2150ms</div>
          </div>
        </div>
      </div>

      {/* Latency Pulse Sparkline SVG */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.75rem' }}>
          <span className="text-muted">Response Latency Pulse</span>
          <span className="font-mono" style={{ color: 'var(--brand-dark)', fontWeight: 600 }}>AVG 135ms</span>
        </div>

        <svg viewBox="0 0 300 40" style={{ width: '100%', height: '40px', overflow: 'visible' }}>
          <path
            d="M0 25 L40 25 L50 10 L60 32 L70 25 L120 25 L130 5 L140 35 L150 25 L200 25 L210 18 L220 25 L300 25"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Shield, Key, Radio, Activity, BarChart2, AlertTriangle, Cpu, BookOpen, Layers, Bell, Check, Copy } from 'lucide-react';
import CodeBlock from '../../components/common/CodeBlock';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavClick = (id) => {
    setActiveSection(id);
    window.location.hash = `#${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const docGroups = [
    {
      title: 'GETTING STARTED',
      items: [
        { id: 'introduction', label: 'Introduction', icon: BookOpen },
        { id: 'quick-start', label: 'Quick Start', icon: Layers },
        { id: 'authentication', label: 'Authentication', icon: Key },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'monitors', label: 'Monitors API', icon: Radio },
        { id: 'health-checks', label: 'Health Checks', icon: Activity },
        { id: 'statistics', label: 'Statistics', icon: BarChart2 },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
        { id: 'notifications', label: 'Notifications', icon: Bell },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'architecture', label: 'Architecture', icon: Cpu },
        { id: 'api-reference', label: 'API Reference', icon: Shield },
      ],
    },
  ];

  // Flattened array for mobile dropdown navigation
  const allSections = docGroups.flatMap((g) => g.items);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 180px', width: '100%' }}>
      
      {/* Mobile Compact Topic Selector */}
      <div className="mobile-only" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="docs-topic-select" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          Select Documentation Topic
        </label>
        <select
          id="docs-topic-select"
          value={activeSection}
          onChange={(e) => handleNavClick(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {docGroups.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.items.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="docs-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(210px, 240px) 1fr', gap: '2.5rem' }}>
        
        {/* Sticky Desktop Navigation Sidebar */}
        <aside className="docs-sidebar-nav" style={{ position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)', alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-dark)', marginBottom: '1rem', letterSpacing: '0.06em' }}>
            API Documentation
          </div>

          <nav aria-label="Documentation Sidebar Navigation">
            {docGroups.map((group) => (
              <div key={group.title} style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem', letterSpacing: '0.05em' }}>
                  {group.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map((sec) => {
                    const Icon = sec.icon;
                    const isSelected = activeSection === sec.id;
                    return (
                      <li key={sec.id}>
                        <button
                          type="button"
                          onClick={() => handleNavClick(sec.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            fontWeight: isSelected ? 600 : 500,
                            backgroundColor: isSelected ? 'var(--brand-soft)' : 'transparent',
                            color: isSelected ? 'var(--brand-dark)' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <Icon size={16} style={{ color: isSelected ? 'var(--brand-dark)' : 'var(--text-muted)' }} />
                          <span>{sec.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Documentation Content Viewport */}
        <main style={{ minWidth: 0 }}>
          
          {/* SECTION: INTRODUCTION */}
          {activeSection === 'introduction' && (
            <section id="introduction">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>PulseOps API Overview</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                RESTful API documentation for managing uptime monitors, querying health check history, retrieving uptime statistics, tracking downtime incidents, and configuring alert preferences.
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Base Server URL</h2>
                <p className="body-text" style={{ marginBottom: '0.75rem' }}>
                  All API requests in local development must be directed to the FastAPI backend instance:
                </p>
                <CodeBlock code="http://localhost:8000" language="http" />
              </div>

              <div className="card">
                <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Core Capabilities</h2>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.875rem' }}>
                  <li><strong>JWT Authentication:</strong> User registration, login token generation, token refresh, and identity verification.</li>
                  <li><strong>Monitor Management:</strong> Create, inspect, update, delete, pause, and resume HTTP/HEAD monitors.</li>
                  <li><strong>Health Check History:</strong> Paginated logs of executed pings, status codes, response time latency measurements, and timestamp details.</li>
                  <li><strong>Aggregated Uptime Statistics:</strong> Response time averages and uptime percentage calculations over 1–30 day periods.</li>
                  <li><strong>Automated Incident Lifecycle:</strong> Real-time tracking of OPEN and RESOLVED downtime incidents based on configurable failure/recovery thresholds.</li>
                  <li><strong>Notifications & Alert Delivery:</strong> User notification inbox and configurable email alert delivery settings.</li>
                </ul>
              </div>
            </section>
          )}

          {/* SECTION: QUICK START */}
          {activeSection === 'quick-start' && (
            <section id="quick-start">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Quick Start Integration Guide</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Follow this step-by-step workflow to authenticate, register an HTTP uptime monitor, inspect health pings, and track incidents.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>1. Create an Account</h2>
                  <CodeBlock
                    code={`curl -X POST http://localhost:8000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Dev Engineer", "email": "dev@pulseops.io", "password": "SecurePassword123!"}'`}
                    language="bash"
                  />
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>2. Authenticate & Obtain Access Token</h2>
                  <CodeBlock
                    code={`curl -X POST http://localhost:8000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dev@pulseops.io", "password": "SecurePassword123!"}'`}
                    language="bash"
                  />
                  <p className="body-text text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                    Response returns <code>access_token</code> and <code>refresh_token</code>. Include the access token in the <code>Authorization: Bearer &lt;access_token&gt;</code> header.
                  </p>
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>3. Create an HTTP Uptime Monitor</h2>
                  <CodeBlock
                    code={`curl -X POST http://localhost:8000/api/monitors \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production API Gateway",
    "url": "https://api.pulseops.io",
    "method": "GET",
    "interval": 60,
    "timeout": 10,
    "expected_status": 200,
    "failure_threshold": 2,
    "degraded_threshold": 2000,
    "recovery_threshold": 2
  }'`}
                    language="bash"
                  />
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>4. Query Health Checks</h2>
                  <CodeBlock
                    code={`curl -X GET "http://localhost:8000/api/monitors/1/health?limit=20&hours=1" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`}
                    language="bash"
                  />
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>5. Inspect Uptime Statistics</h2>
                  <CodeBlock
                    code={`curl -X GET "http://localhost:8000/api/monitors/1/stats?days=7" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`}
                    language="bash"
                  />
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>6. Track Incidents</h2>
                  <CodeBlock
                    code={`curl -X GET "http://localhost:8000/api/incidents/" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`}
                    language="bash"
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECTION: AUTHENTICATION */}
          {activeSection === 'authentication' && (
            <section id="authentication">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Authentication API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                PulseOps relies on JWT Bearer Tokens for securing endpoints. Pass the access token in the HTTP Authorization header:
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="font-mono" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem' }}>
                  Authorization: Bearer &lt;access_token&gt;
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Register Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700, fontSize: '0.75rem' }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/register</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Register a new user account.</p>
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Request Body</h3>
                  <CodeBlock
                    code={`{\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "password": "SecurePassword123!"\n}`}
                    language="json"
                  />
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', margin: '0.75rem 0 0.375rem' }}>Response (201 Created)</h3>
                  <CodeBlock code={`{\n  "id": 1,\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}`} language="json" />
                </div>

                {/* Login Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700, fontSize: '0.75rem' }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/login</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Authenticate credentials and issue JWT access and refresh tokens.</p>
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Request Body</h3>
                  <CodeBlock code={`{\n  "email": "jane@example.com",\n  "password": "SecurePassword123!"\n}`} language="json" />
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', margin: '0.75rem 0 0.375rem' }}>Response (200 OK)</h3>
                  <CodeBlock code={`{\n  "access_token": "eyJhbGciOi...",\n  "refresh_token": "eyJhbGciOi...",\n  "token_type": "bearer"\n}`} language="json" />
                </div>

                {/* Refresh Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700, fontSize: '0.75rem' }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/refresh?refresh_token=&lt;TOKEN&gt;</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Exchange a valid, unrevoked refresh token for a fresh access token.</p>
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Response (200 OK)</h3>
                  <CodeBlock code={`{\n  "access_token": "eyJhbGciOi...",\n  "refresh_token": "eyJhbGciOi...",\n  "token_type": "bearer"\n}`} language="json" />
                </div>

                {/* Get Me Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/me</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Retrieve profile metadata and notification preferences for the current authenticated user.</p>
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Response (200 OK)</h3>
                  <CodeBlock code={`{\n  "id": 1,\n  "name": "Jane Doe",\n  "email": "jane@example.com",\n  "email_notifications_enabled": true,\n  "down_alerts_enabled": true,\n  "recovery_alerts_enabled": true\n}`} language="json" />
                </div>
              </div>
            </section>
          )}

          {/* SECTION: MONITORS */}
          {activeSection === 'monitors' && (
            <section id="monitors">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Monitors API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Endpoints for creating, listing, retrieving, updating, pausing, resuming, and deleting HTTP uptime monitors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Create Monitor */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700, fontSize: '0.75rem' }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Create a new monitor target for background health checking.</p>
                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Request Body</h3>
                  <CodeBlock
                    code={`{
  "name": "Production API Gateway",
  "url": "https://api.example.com/health",
  "method": "GET",
  "interval": 60,
  "timeout": 10,
  "expected_status": 200,
  "failure_threshold": 2,
  "degraded_threshold": 2000,
  "recovery_threshold": 2
}`}
                    language="json"
                  />
                </div>

                {/* List Monitors */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text">Retrieve all active and paused monitors owned by the authenticated user.</p>
                </div>

                {/* Monitor Response Schema */}
                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Monitor Object Schema</h3>
                  <CodeBlock
                    code={`{
  "id": 1,
  "name": "Production API Gateway",
  "url": "https://api.example.com/health",
  "method": "GET",
  "interval": 60,
  "timeout": 10,
  "expected_status": 200,
  "failure_threshold": 2,
  "consecutive_failures": 0,
  "consecutive_successes": 14,
  "degraded_threshold": 2000,
  "recovery_threshold": 2,
  "status": "UP",
  "is_active": true
}`}
                    language="json"
                  />
                </div>

                {/* Additional Operations */}
                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>Operations Summary</h3>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--info)' }}>GET</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Get monitor by ID.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--warning)' }}>PATCH</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Update monitor config.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--danger)' }}>DELETE</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Delete monitor (204 No Content).</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/monitors/&#123;monitor_id&#125;/pause</code> — Pause health checking.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/monitors/&#123;monitor_id&#125;/resume</code> — Resume health checking.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* SECTION: HEALTH CHECKS */}
          {activeSection === 'health-checks' && (
            <section id="health-checks">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Health Checks API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Query execution history logs for a specific monitor including status codes, latency measurements, and timestamp details.
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors/&#123;monitor_id&#125;/health</span>
                </div>
                <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                <p className="body-text" style={{ marginBottom: '0.75rem' }}>
                  Returns a paginated list of health check execution records.
                </p>

                <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Query Parameters</h3>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  <li><code>limit</code> (int, default: 50, min: 1, max: 1000) — Number of records to return.</li>
                  <li><code>offset</code> (int, default: 0, min: 0) — Offset index for pagination.</li>
                  <li><code>hours</code> (int, optional, min: 1, max: 720) — Filter health checks performed within the last <em>N</em> hours.</li>
                </ul>

                <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Response Schema</h3>
                <CodeBlock
                  code={`{
  "items": [
    {
      "id": 1042,
      "user_id": 1,
      "monitor_id": 1,
      "status": "UP",
      "status_code": 200,
      "response_time": 142,
      "error": null,
      "checked_at": "2026-09-02T11:45:00.000Z"
    }
  ],
  "total": 450,
  "limit": 50,
  "offset": 0
}`}
                  language="json"
                />
              </div>
            </section>
          )}

          {/* SECTION: STATISTICS */}
          {activeSection === 'statistics' && (
            <section id="statistics">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Uptime Statistics API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Query aggregate uptime percentages, total checks, failed/degraded counts, and average response times.
              </p>

              <div className="card">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors/&#123;monitor_id&#125;/stats?days=30</span>
                </div>
                <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                <p className="body-text" style={{ marginBottom: '0.75rem' }}>
                  Calculates aggregate statistics over the requested number of days.
                </p>

                <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Query Parameter</h3>
                <p className="body-text" style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                  <code>days</code> (int, default: 30, min: 1, max: 30).
                </p>

                <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Response Schema</h3>
                <CodeBlock
                  code={`{
  "monitor_id": 1,
  "period_days": 30,
  "uptime_percentage": 99.85,
  "total_checks": 43200,
  "successful_checks": 43135,
  "failed_checks": 50,
  "degraded_checks": 15,
  "average_response_time": 138.45,
  "max_response_time": 2450
}`}
                  language="json"
                />

                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Uptime Calculation Semantics</h4>
                  <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                    <code>uptime_percentage = (successful_checks / total_checks) * 100</code>. Only checks with status <code>UP</code> are counted as successful.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SECTION: INCIDENTS */}
          {activeSection === 'incidents' && (
            <section id="incidents">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Incidents API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Track downtime incidents automatically created and resolved by the monitoring engine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/incidents/</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text">Retrieve all incidents across user monitors, ordered by start time descending.</p>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/incidents/&#123;incident_id&#125;</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Retrieve incident detail report by ID.</p>

                  <h3 className="heading-md" style={{ fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Incident Object Schema</h3>
                  <CodeBlock
                    code={`{
  "id": 14,
  "monitor_id": 1,
  "status": "RESOLVED",
  "reason": "HTTP status 503 Service Unavailable (consecutive_failures >= 2)",
  "started_at": "2026-09-02T10:15:00.000Z",
  "resolved_at": "2026-09-02T10:19:30.000Z",
  "duration": 270
}`}
                    language="json"
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECTION: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <section id="notifications">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Notifications API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Endpoints for retrieving user notification logs, marking alerts as read, clearing notifications, and managing email notification preferences.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700, fontSize: '0.75rem' }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/notifications</span>
                  </div>
                  <h3 className="heading-md" style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>Purpose</h3>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Fetch paginated notifications list and unread count for current user.</p>
                  <CodeBlock
                    code={`{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "monitor_id": 1,
      "type": "DOWN",
      "title": "Monitor Failure: harsh",
      "message": "Monitor 'harsh' is DOWN. Connection error: [Errno -5] No address associated with hostname",
      "is_read": false,
      "created_at": "2026-09-03T00:54:55.000Z"
    }
  ],
  "total": 1,
  "unread_count": 1
}`}
                    language="json"
                  />
                </div>

                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>Management & Preference Operations</h3>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/notifications/&#123;id&#125;/read</code> — Mark specific notification as read.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/notifications/read-all</code> — Mark all notifications as read.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--danger)' }}>DELETE</span> <code>/api/notifications/&#123;id&#125;</code> — Delete single notification.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--danger)' }}>DELETE</span> <code>/api/notifications/clear-all</code> — Clear all notifications.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--info)' }}>GET</span> <code>/api/notifications/preferences</code> — Retrieve user alert email preferences.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--warning)' }}>PATCH</span> <code>/api/notifications/preferences</code> — Update email notifications ON/OFF, down alerts ON/OFF, and recovery alerts ON/OFF.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* SECTION: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <section id="architecture">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>System Architecture</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Technical architecture overview of the PulseOps monitoring system.
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <CodeBlock
                  code={`+--------------------+      HTTP / REST API     +--------------------+
|  React Frontend    |  --------------------->  |  FastAPI Backend   |
+--------------------+                          +--------------------+
                                                           |
                                                           v
                                                 +--------------------+
                                                 |  PostgreSQL DB     |
                                                 | (Persistent Store) |
                                                 +--------------------+

Background Monitoring Engine:
+--------------------+    Message Queue    +--------------------+
|    Celery Beat     |  ---------------->  |    Redis Broker    |
| (Periodic Scheduler|                     +--------------------+
+--------------------+                               |
                                                     v
                                           +--------------------+
                                           |   Celery Worker    |
                                           | (HTTP Ping Engine) |
                                           +--------------------+
                                                     |
                                                     v
                                           +--------------------+
                                           |   Target Web/API   |
                                           +--------------------+`}
                  language="text"
                />
              </div>

              <div className="card">
                <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Component Responsibilities</h3>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li><strong>FastAPI Backend:</strong> Serves REST endpoints for authentication, monitors, health checks, stats, incidents, and notifications.</li>
                  <li><strong>PostgreSQL Database:</strong> Stores relational entities (Users, Monitors, HealthChecks, Incidents, Notifications).</li>
                  <li><strong>Celery Beat:</strong> Schedules health checks according to each monitor's configured interval.</li>
                  <li><strong>Redis:</strong> In-memory broker for queuing Celery tasks.</li>
                  <li><strong>Celery Worker:</strong> Executes asynchronous HTTP/HEAD requests against target URLs, updates monitor status, logs health check entries, triggers email alerts, and manages incident lifecycles.</li>
                </ul>
              </div>
            </section>
          )}

          {/* SECTION: API REFERENCE */}
          {activeSection === 'api-reference' && (
            <section id="api-reference">
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>API Reference & Status Codes</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Complete HTTP endpoint directory and API status code reference.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--surface-secondary)', borderBottom: '1px solid var(--border-muted)' }}>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Method</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Endpoint</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>POST</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/auth/register</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Register new user account</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>POST</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/auth/login</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Authenticate & obtain JWT tokens</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/auth/me</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Get authenticated user profile</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/monitors</td>
                          <td style={{ padding: '0.625rem 1rem' }}>List all user monitors</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>POST</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/monitors</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Create new uptime monitor</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/monitors/&#123;id&#125;/health</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Query health check history</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/monitors/&#123;id&#125;/stats</td>
                          <td style={{ padding: '0.625rem 1rem' }}>Get uptime percentage & stats</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/incidents/</td>
                          <td style={{ padding: '0.625rem 1rem' }}>List downtime incidents</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          <td style={{ padding: '0.625rem 1rem' }}><span className="font-mono" style={{ fontWeight: 700, color: 'var(--info)' }}>GET</span></td>
                          <td className="font-mono" style={{ padding: '0.625rem 1rem' }}>/api/notifications</td>
                          <td style={{ padding: '0.625rem 1rem' }}>List notification alerts</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>HTTP Status Code Reference</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>200 OK</span>
                    <span>Request processed successfully.</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>201</span>
                    <span>Resource created successfully.</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>204</span>
                    <span>Resource deleted successfully (No Content).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--warning)' }}>400</span>
                    <span>Bad Request (e.g. email already registered).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--danger)' }}>401</span>
                    <span>Unauthorized (Missing/invalid Bearer token).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--danger)' }}>404</span>
                    <span>Not Found (Target monitor or resource does not exist).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--warning)' }}>422</span>
                    <span>Unprocessable Entity (Field validation failed).</span>
                  </div>
                </div>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

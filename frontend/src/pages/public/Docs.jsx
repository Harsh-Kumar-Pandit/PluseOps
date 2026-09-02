import React, { useState, useEffect } from 'react';
import { Shield, Key, Radio, Activity, BarChart2, AlertTriangle, Cpu, BookOpen, Layers } from 'lucide-react';
import CodeBlock from '../../components/common/CodeBlock';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
    }
  }, []);

  const handleNavClick = (id) => {
    setActiveSection(id);
    window.location.hash = `#${id}`;
  };

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: BookOpen },
    { id: 'quick-start', label: 'Quick Start', icon: Layers },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'monitors', label: 'Monitors API', icon: Radio },
    { id: 'health-checks', label: 'Health Checks', icon: Activity },
    { id: 'statistics', label: 'Statistics', icon: BarChart2 },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'api-reference', label: 'API Reference', icon: Shield },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '2.5rem' }}>
        
        {/* Sticky Desktop Navigation Sidebar */}
        <aside style={{ position: 'sticky', top: 'calc(var(--header-height) + 1.5rem)', alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            API Documentation
          </h3>
          <nav aria-label="Documentation Sidebar Navigation">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sections.map((sec) => {
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
                      <Icon size={16} />
                      <span>{sec.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Documentation Content Viewport */}
        <main style={{ minWidth: 0 }}>
          
          {/* SECTION: INTRODUCTION */}
          {activeSection === 'introduction' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>PulseOps API Overview</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                RESTful API documentation for managing uptime monitors, querying health check history, retrieving uptime statistics, and tracking downtime incidents.
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
                  <li><strong>Health Check History:</strong> Paginated logs of executed pings, status codes, and latency measurements.</li>
                  <li><strong>Aggregated Uptime Statistics:</strong> Response time latency averages and uptime percentage over 1–30 day periods.</li>
                  <li><strong>Automated Incident Lifecycle:</strong> Real-time tracking of OPEN and RESOLVED downtime incidents.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION: QUICK START */}
          {activeSection === 'quick-start' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Quick Start Integration Guide</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Follow this step-by-step workflow to authenticate and create your first active monitor using cURL.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>1. Register a User Account</h2>
                  <CodeBlock
                    code={`curl -X POST http://localhost:8000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Dev Engineer", "email": "dev@pulseops.io", "password": "SecurePassword123!"}'`}
                    language="bash"
                  />
                </div>

                <div className="card">
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>2. Authenticate & Obtain Bearer Token</h2>
                  <CodeBlock
                    code={`curl -X POST http://localhost:8000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dev@pulseops.io", "password": "SecurePassword123!"}'`}
                    language="bash"
                  />
                  <p className="body-text text-muted" style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                    Response returns <code>access_token</code> and <code>refresh_token</code>. Use the <code>access_token</code> for subsequent requests.
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
                  <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>4. Query Health History & Uptime Stats</h2>
                  <CodeBlock
                    code={`curl -X GET "http://localhost:8000/api/monitors/1/stats?days=7" \\
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"`}
                    language="bash"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AUTHENTICATION */}
          {activeSection === 'authentication' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Authentication API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                PulseOps relies on JWT Bearer Tokens for securing endpoints. Pass the access token in the standard HTTP header:
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="font-mono" style={{ padding: '0.5rem', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                  Authorization: Bearer &lt;access_token&gt;
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Register Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700 }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/register</span>
                  </div>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Register a new user account.</p>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Request Body Schema (RegisterRequest)</h4>
                  <CodeBlock
                    code={`{
  "name": "string (min: 2, max: 100)",
  "email": "user@example.com (EmailStr)",
  "password": "string (min: 8, max: 100)"
}`}
                    language="json"
                  />
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: '0.75rem 0 0.375rem' }}>Response (201 Created)</h4>
                  <CodeBlock code={`{\n  "id": 1,\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}`} language="json" />
                </div>

                {/* Login Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700 }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/login</span>
                  </div>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Authenticate credentials and issue JWT access and refresh tokens.</p>
                  <CodeBlock code={`{\n  "email": "user@example.com",\n  "password": "user_password"\n}`} language="json" />
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, margin: '0.75rem 0 0.375rem' }}>Response (200 OK - TokenResponse)</h4>
                  <CodeBlock code={`{\n  "access_token": "eyJhbGciOi...",\n  "refresh_token": "eyJhbGciOi...",\n  "token_type": "bearer"\n}`} language="json" />
                </div>

                {/* Refresh Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700 }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/refresh?refresh_token=&lt;TOKEN&gt;</span>
                  </div>
                  <p className="body-text">Exchange a valid, unrevoked refresh token for a fresh access token.</p>
                </div>

                {/* Get Me Endpoint */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/auth/me</span>
                  </div>
                  <p className="body-text">Retrieve profile metadata for the authenticated user.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MONITORS */}
          {activeSection === 'monitors' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Monitors API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Endpoints for creating, listing, inspecting, updating, pausing, resuming, and deleting HTTP uptime monitors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Create Monitor */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--brand-soft)', color: 'var(--brand-dark)', fontWeight: 700 }}>POST</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors</span>
                  </div>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Create a new monitor for the authenticated user.</p>
                  <CodeBlock
                    code={`{
  "name": "string (min: 1, max: 100)",
  "url": "https://api.example.com/health (HttpUrl)",
  "method": "GET | HEAD (default: GET)",
  "interval": 60 (int, ge: 10 seconds),
  "timeout": 10 (int, ge: 1, le: 60 seconds),
  "expected_status": 200 (int, ge: 100, le: 599),
  "failure_threshold": 2 (int, ge: 1, le: 10 failures to trigger DOWN),
  "degraded_threshold": 2000 (int, ge: 500, le: 10000 ms to trigger DEGRADED),
  "recovery_threshold": 2 (int, ge: 1, le: 10 successes to trigger UP)
}`}
                    language="json"
                  />
                </div>

                {/* List Monitors */}
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors</span>
                  </div>
                  <p className="body-text">Retrieve all active and paused monitors owned by the authenticated user, ordered by creation date descending.</p>
                </div>

                {/* Monitor Response Schema */}
                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>MonitorResponse Schema</h3>
                  <CodeBlock
                    code={`{
  "id": 1,
  "name": "Production API Gateway",
  "url": "https://api.example.com",
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

                {/* Additional Endpoints */}
                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>Control & Management Operations</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--info)' }}>GET</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Retrieve monitor details by ID.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--warning)' }}>PATCH</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Update configuration fields (name, url, method, interval, thresholds).</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--danger)' }}>DELETE</span> <code>/api/monitors/&#123;monitor_id&#125;</code> — Delete monitor (Returns 204 No Content).</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/monitors/&#123;monitor_id&#125;/pause</code> — Set monitor to PAUSED state.</li>
                    <li><span className="font-mono" style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>POST</span> <code>/api/monitors/&#123;monitor_id&#125;/resume</code> — Resume health checks (Sets status to PENDING).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: HEALTH CHECKS */}
          {activeSection === 'health-checks' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Health Checks API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Query health check execution logs for a specific monitor.
              </p>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors/&#123;monitor_id&#125;/health</span>
                </div>
                <p className="body-text" style={{ marginBottom: '0.75rem' }}>
                  Returns a paginated list of executed health checks.
                </p>

                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Query Parameters</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <li><code>limit</code> (int, default: 50, min: 1, max: 100) — Number of records to return.</li>
                  <li><code>offset</code> (int, default: 0, min: 0) — Pagination offset.</li>
                </ul>

                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Response Schema</h4>
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
            </div>
          )}

          {/* SECTION: STATISTICS */}
          {activeSection === 'statistics' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Uptime Statistics API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Aggregate uptime percentage, status check counts, and latency statistics for a monitor.
              </p>

              <div className="card">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>/api/monitors/&#123;monitor_id&#125;/stats?days=30</span>
                </div>
                <p className="body-text" style={{ marginBottom: '0.75rem' }}>
                  Calculates metrics over the requested period.
                </p>

                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Query Parameter</h4>
                <p className="body-text" style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                  <code>days</code> (int, default: 30, min: 1, max: 30). Intended values: 1, 7, 30.
                </p>

                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Response Schema</h4>
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
                  <h5 style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Uptime Calculation Semantics</h5>
                  <p className="body-text" style={{ fontSize: '0.8125rem' }}>
                    <code>uptime_percentage = (successful_checks / total_checks) * 100</code>. Only checks with status <code>UP</code> are counted as successful. Checks marked <code>DEGRADED</code> or <code>DOWN</code> are not counted as successful checks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: INCIDENTS */}
          {activeSection === 'incidents' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>Incidents API</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Track downtime incidents automatically generated by the background monitoring engine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/incidents/</span>
                  </div>
                  <p className="body-text">Retrieve all incidents across monitors owned by the authenticated user, ordered by start time descending.</p>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="font-mono" style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--info-soft)', color: 'var(--info)', fontWeight: 700 }}>GET</span>
                    <span className="font-mono" style={{ fontWeight: 600 }}>/api/incidents/&#123;incident_id&#125;</span>
                  </div>
                  <p className="body-text" style={{ marginBottom: '0.75rem' }}>Retrieve detailed incident report by ID.</p>
                  
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Incident Object Schema</h4>
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

                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Incident Lifecycle Rule</h3>
                  <p className="body-text" style={{ fontSize: '0.875rem' }}>
                    Incidents are managed entirely by background task evaluations. When consecutive failed health checks reach <code>failure_threshold</code>, an incident is created with status <code>OPEN</code>. When consecutive successful checks reach <code>recovery_threshold</code>, status transitions to <code>RESOLVED</code> and <code>duration</code> (in seconds) is calculated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>System Architecture</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                Technical flow and data persistence separation in the PulseOps stack.
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
                <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Data Store Roles</h3>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li><strong>PostgreSQL:</strong> Primary relational database storing user accounts, monitor configurations, health check history logs, and incident records.</li>
                  <li><strong>Redis:</strong> In-memory broker for Celery task queuing and result transport. Redis does not store primary application state.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION: API REFERENCE */}
          {activeSection === 'api-reference' && (
            <div>
              <h1 className="heading-xl" style={{ marginBottom: '0.5rem' }}>API Reference & Status Codes</h1>
              <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
                HTTP status codes and exception responses returned by the PulseOps FastAPI application.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.75rem' }}>HTTP Status Codes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>200 OK</span>
                    <span>Request processed successfully.</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>201</span>
                    <span>Resource created successfully (e.g. user registration, monitor creation).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>204</span>
                    <span>Resource deleted successfully (No Content returned).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--warning)' }}>400</span>
                    <span>Bad Request (e.g. email already registered).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--danger)' }}>401</span>
                    <span>Unauthorized (Invalid/expired token, invalid credentials, or missing Bearer header).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--danger)' }}>404</span>
                    <span>Not Found (Target monitor or incident ID does not exist or belongs to another user).</span>

                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--warning)' }}>422</span>
                    <span>Unprocessable Entity (Pydantic field validation failed, e.g. invalid URL format or out-of-range interval).</span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Resource Authorization Isolation</h3>
                  <p className="body-text" style={{ fontSize: '0.875rem' }}>
                    All monitor, health check, and incident endpoints strictly isolate data by user ownership. Requesting a resource ID that belongs to another user returns a <code>404 Not Found</code> error.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

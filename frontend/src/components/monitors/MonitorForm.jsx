import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MonitorForm Component
 *
 * Reusable form for creating and editing HTTP monitors with validation matching FastAPI Pydantic rules.
 */
export default function MonitorForm({
  initialValues = {},
  onSubmit,
  submitText = 'Create Monitor',
  submittingText = 'Saving...',
  onCancel,
}) {
  const [name, setName] = useState(initialValues.name || '');
  const [url, setUrl] = useState(initialValues.url || '');
  const [method, setMethod] = useState(initialValues.method || 'GET');
  const [interval, setInterval] = useState(initialValues.interval ?? 60);
  const [timeout, setTimeoutVal] = useState(initialValues.timeout ?? 10);
  const [expectedStatus, setExpectedStatus] = useState(initialValues.expected_status ?? 200);
  const [failureThreshold, setFailureThreshold] = useState(initialValues.failure_threshold ?? 2);
  const [degradedThreshold, setDegradedThreshold] = useState(initialValues.degraded_threshold ?? 2000);
  const [recoveryThreshold, setRecoveryThreshold] = useState(initialValues.recovery_threshold ?? 2);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation matching backend rules
    if (!name.trim()) {
      setError('Monitor name is required.');
      return;
    }

    if (!url.trim()) {
      setError('Target URL is required.');
      return;
    }

    if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    const intervalNum = Number(interval);
    if (isNaN(intervalNum) || intervalNum < 10) {
      setError('Interval must be at least 10 seconds.');
      return;
    }

    const timeoutNum = Number(timeout);
    if (isNaN(timeoutNum) || timeoutNum < 1 || timeoutNum > 60) {
      setError('Timeout must be between 1 and 60 seconds.');
      return;
    }

    const statusNum = Number(expectedStatus);
    if (isNaN(statusNum) || statusNum < 100 || statusNum > 599) {
      setError('Expected HTTP status code must be between 100 and 599.');
      return;
    }

    const failureNum = Number(failureThreshold);
    if (isNaN(failureNum) || failureNum < 1 || failureNum > 10) {
      setError('Failure threshold must be between 1 and 10.');
      return;
    }

    const degradedNum = Number(degradedThreshold);
    if (isNaN(degradedNum) || degradedNum < 500 || degradedNum > 10000) {
      setError('Degraded latency threshold must be between 500 and 10000 ms.');
      return;
    }

    const recoveryNum = Number(recoveryThreshold);
    if (isNaN(recoveryNum) || recoveryNum < 1 || recoveryNum > 10) {
      setError('Recovery threshold must be between 1 and 10.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      url: url.trim(),
      method,
      interval: intervalNum,
      timeout: timeoutNum,
      expected_status: statusNum,
      failure_threshold: failureNum,
      degraded_threshold: degradedNum,
      recovery_threshold: recoveryNum,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || 'An error occurred while saving the monitor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: BASIC CONFIGURATION */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="heading-md" style={{ margin: 0 }}>Basic Configuration</h3>

        <div>
          <label className="form-label" htmlFor="monitor-name">Name</label>
          <input
            id="monitor-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production API Gateway"
            required
            disabled={submitting}
          />
          <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            Monitor name used to identify the service.
          </p>
        </div>

        <div>
          <label className="form-label" htmlFor="monitor-url">URL</label>
          <input
            id="monitor-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/health"
            required
            disabled={submitting}
          />
          <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            HTTP endpoint to monitor (must begin with http:// or https://).
          </p>
        </div>

        <div>
          <label className="form-label" htmlFor="monitor-method">Method</label>
          <select
            id="monitor-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          >
            <option value="GET">GET</option>
            <option value="HEAD">HEAD</option>
          </select>
          <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
            HTTP method used for health check requests.
          </p>
        </div>
      </div>

      {/* SECTION 2: MONITORING CONFIGURATION */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="heading-md" style={{ margin: 0 }}>Monitoring Configuration</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" htmlFor="monitor-interval">Check Interval (seconds)</label>
            <input
              id="monitor-interval"
              type="number"
              min={10}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              How often PulseOps checks the endpoint (min: 10s).
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="monitor-timeout">Request Timeout (seconds)</label>
            <input
              id="monitor-timeout"
              type="number"
              min={1}
              max={60}
              value={timeout}
              onChange={(e) => setTimeoutVal(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Maximum time allowed for request (1–60s).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" htmlFor="monitor-expected-status">Expected HTTP Status</label>
            <input
              id="monitor-expected-status"
              type="number"
              min={100}
              max={599}
              value={expectedStatus}
              onChange={(e) => setExpectedStatus(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              HTTP status code considered successful (e.g. 200).
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="monitor-failure-threshold">Failure Threshold</label>
            <input
              id="monitor-failure-threshold"
              type="number"
              min={1}
              max={10}
              value={failureThreshold}
              onChange={(e) => setFailureThreshold(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Consecutive failures before status becomes DOWN.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: ADVANCED SETTINGS TOGGLE */}
      <div className="card">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>Advanced Settings</span>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-muted)' }}>
            <div>
              <label className="form-label" htmlFor="monitor-degraded-threshold">Degraded Threshold (ms)</label>
              <input
                id="monitor-degraded-threshold"
                type="number"
                min={500}
                max={10000}
                value={degradedThreshold}
                onChange={(e) => setDegradedThreshold(e.target.value)}
                disabled={submitting}
              />
              <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Latency in ms to trigger DEGRADED status (500–10000 ms).
              </p>
            </div>

            <div>
              <label className="form-label" htmlFor="monitor-recovery-threshold">Recovery Threshold</label>
              <input
                id="monitor-recovery-threshold"
                type="number"
                min={1}
                max={10}
                value={recoveryThreshold}
                onChange={(e) => setRecoveryThreshold(e.target.value)}
                disabled={submitting}
              />
              <p className="body-text text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                Consecutive successful checks required for recovery to UP.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FORM ACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? submittingText : submitText}
        </button>
      </div>
    </form>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem', width: '100%' }}>
      <div className="card">
        <h1 className="heading-lg" style={{ marginBottom: '0.375rem', textAlign: 'center' }}>
          Sign In to PulseOps
        </h1>
        <p className="body-text text-muted" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Enter your credentials to access your control panel.
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 500 }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

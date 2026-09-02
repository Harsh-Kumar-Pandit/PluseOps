import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem', width: '100%' }}>
      <div className="card">
        <h1 className="heading-lg" style={{ marginBottom: '0.375rem', textAlign: 'center' }}>
          Create your PulseOps account
        </h1>
        <p className="body-text text-muted" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Start monitoring your websites and infrastructure endpoints.
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
            Create Account
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 500 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

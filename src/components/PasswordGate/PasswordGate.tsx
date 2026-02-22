import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import './PasswordGate.css';

const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'demo2024';
const AUTH_KEY = 'ivt_authenticated';

interface PasswordGateProps {
  children: ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem(AUTH_KEY);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="password-gate">
        <div className="password-gate-loading">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="password-gate">
      <div className="password-gate-container">
        <div className="password-gate-header">
          <h1>Investigative Visualization Tool</h1>
          <p>Demo Access Required</p>
        </div>
        <form onSubmit={handleSubmit} className="password-gate-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn">
            Access Demo
          </button>
        </form>
        <div className="password-gate-footer">
          <p>Contact your administrator for access credentials.</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';

const LoginView = ({ onLoginSuccess, apiUrl }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the passcode input immediately on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the security passcode.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // essential for HttpOnly cookie storage
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      } else {
        setError(data.message || 'Access Denied: Invalid admin passcode.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure: Unable to reach security node.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view-container">
      <div className="login-card-wrapper animate-scale-in">
        
        {/* Card Header */}
        <div className="login-card-header">
          <div className="brand-logo-section">
            <img src="/logo.jpg" alt="Gigiman Logo" className="login-logo" />
          </div>
          <h2>Gigiman Lead System</h2>
          <p>Secure administrative access node. Authentication required.</p>
        </div>

        {/* Success or Form State */}
        {success ? (
          <div className="login-success-state animate-fade-in">
            <div className="success-icon-shield">
              <CheckCircle size={48} className="success-shield-svg" />
            </div>
            <h4>Authentication Successful</h4>
            <p>Decrypting records and synchronizing lead database...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-card-form">
            {error && (
              <div className="login-error-banner animate-fade-in">
                <ShieldAlert size={16} className="error-alert-svg" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="passcode" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                System Password / Passcode
              </label>
              <div className="password-input-wrapper">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  id="passcode"
                  placeholder="Enter system passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Lock size={16} className="loading-lock" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="login-card-footer">
          <span>Protected by Gigiman Security protocols</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

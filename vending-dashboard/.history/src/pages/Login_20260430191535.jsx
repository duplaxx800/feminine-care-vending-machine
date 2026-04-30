import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Icons = {
  eye: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  lock: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  mail: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  alert: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  machine: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><rect x="8" y="10" width="8" height="6" rx="1"/><line x1="10" y1="19" x2="14" y2="19"/></svg>,
};

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-not-found': 'No admin account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many failed attempts. Account temporarily locked. Try again later.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/user-disabled': 'This account has been disabled.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Auth state change in App.jsx will automatically redirect
    } catch (err) {
      const msg = ERROR_MESSAGES[err.code] || 'Login failed. Please try again.';
      setError(msg);
      triggerShake();
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }

        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #1e0a3c 0%, #3b0764 40%, #7c3aed 80%, #a855f7 100%);
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -100px; right: -100px;
        }
        .login-left::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          bottom: -80px; left: -80px;
        }

        .brand-icon {
          width: 72px; height: 72px;
          background: rgba(255,255,255,0.15);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          margin-bottom: 24px;
          animation: float 4s ease-in-out infinite;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .login-right {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #fff;
        }

        .login-card {
          width: 100%;
          animation: fadeUp 0.5s ease;
        }

        .input-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex; align-items: center;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .login-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .login-input.error-input {
          border-color: #ef4444;
          background: #fff5f5;
        }
        .login-input.error-input:focus {
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .toggle-pw {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #94a3b8; padding: 4px;
          display: flex; align-items: center;
          transition: color 0.18s;
          border-radius: 6px;
        }
        .toggle-pw:hover { color: #7c3aed; }

        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .error-box {
          background: #fef2f2;
          border: 1.5px solid #fca5a5;
          border-left: 4px solid #ef4444;
          border-radius: 10px;
          padding: 12px 14px;
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 18px;
          animation: fadeUp 0.3s ease;
        }

        .shake { animation: shake 0.5s ease; }

        .dot-spin {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; }
        }
      `}</style>

      <div className="login-page">
        {/* Left Panel */}
        <div className="login-left">
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '340px' }}>
            <div className="brand-icon" style={{ margin: '0 auto 24px' }}>
              {Icons.machine}
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              CTU FemCare<br />Vending System
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: '1.7' }}>
              Secure admin dashboard for monitoring and managing feminine care vending machines at Cebu Technological University.
            </p>

            <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '📦', text: 'Real-time inventory monitoring' },
                { icon: '⚠️', text: 'Instant low stock alerts' },
                { icon: '✏️', text: 'Full CRUD management' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '18px' }}>{f.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right">
          <div className={`login-card ${shake ? 'shake' : ''}`}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ede9fe', borderRadius: '99px', padding: '5px 12px', marginBottom: '20px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Access</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '6px' }}>Welcome back</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} noValidate>
              {/* Error Box */}
              {error && (
                <div className="error-box">
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>{Icons.alert}</span>
                  <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500', lineHeight: '1.5' }}>{error}</span>
                </div>
              )}

              {/* Email */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <div className="input-wrap">
                <span className="input-icon">{Icons.mail}</span>
                <input
                  className={`login-input ${error ? 'error-input' : ''}`}
                  type="email"
                  placeholder="admin@ctu.edu.ph"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div className="input-wrap">
                <span className="input-icon">{Icons.lock}</span>
                <input
                  className={`login-input ${error ? 'error-input' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><div className="dot-spin" /> Signing in...</> : <>{Icons.lock} Sign In</>}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '28px', lineHeight: '1.6' }}>
              🔒 Access restricted to authorized administrators only.<br />
              Contact your system administrator for access.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const EyeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const AlertIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'Email login not enabled in Firebase.',
  'auth/configuration-not-found': 'Firebase config error. Contact admin.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState('');

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); triggerShake(); return; }
    if (!password) { setError('Please enter your password.'); triggerShake(); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    } catch (err) {
      console.error('Auth error:', err.code);
      setError(ERROR_MESSAGES[err.code] || `Error: ${err.code}`);
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-10px)} 30%{transform:translateX(10px)} 45%{transform:translateX(-7px)} 60%{transform:translateX(7px)} 75%{transform:translateX(-4px)} 90%{transform:translateX(4px)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes drift1    { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(30px,-20px) rotate(120deg)} 66%{transform:translate(-20px,30px) rotate(240deg)} }
        @keyframes drift2    { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(-25px,35px) rotate(-120deg)} 66%{transform:translate(35px,-25px) rotate(-240deg)} }
        @keyframes drift3    { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .login-root {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100vw;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0a0a0f;
          overflow: hidden;
          position: relative;
        }

        /* ══════════════════════════════
           LEFT — VISUAL SIDE
        ══════════════════════════════ */
        .login-visual {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 56px;
          overflow: hidden;
          background: linear-gradient(145deg, #0d0621 0%, #150d2e 40%, #1a0a3a 100%);
        }

        /* Animated blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .blob-1 { width:420px; height:420px; background:rgba(139,92,246,.25); top:-80px; left:-80px; animation:drift1 18s ease-in-out infinite; }
        .blob-2 { width:350px; height:350px; background:rgba(236,72,153,.18); bottom:-60px; right:-60px; animation:drift2 22s ease-in-out infinite; }
        .blob-3 { width:250px; height:250px; background:rgba(59,130,246,.15); top:50%; left:50%; transform:translate(-50%,-50%); animation:drift3 14s ease-in-out infinite; }

        /* Grid texture overlay */
        .login-visual::before {
          content:'';
          position:absolute; inset:0;
          background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events:none;
        }

        .visual-content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: fadeUp .7s cubic-bezier(.4,0,.2,1) .1s both;
        }

        .logo-ring {
          width: 88px; height: 88px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(139,92,246,.3), rgba(236,72,153,.3));
          border: 1px solid rgba(255,255,255,.15);
          backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
          box-shadow: 0 0 60px rgba(139,92,246,.3), inset 0 1px 0 rgba(255,255,255,.1);
        }

        .logo-ring svg { width:40px; height:40px; color:#e2d9f3; }

        .visual-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 3.5vw, 48px);
          color: #fff;
          line-height: 1.15;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .visual-title em {
          font-style: italic;
          background: linear-gradient(135deg, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .visual-sub {
          font-size: 15px;
          color: rgba(255,255,255,.5);
          line-height: 1.75;
          max-width: 320px;
          margin: 0 auto 48px;
        }

        .feature-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(10px);
          text-align: left;
          transition: background .2s, border-color .2s;
        }
        .feature-card:hover {
          background: rgba(255,255,255,.08);
          border-color: rgba(255,255,255,.14);
        }

        .feature-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }

        .feature-text { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.8); }
        .feature-desc { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px; }

        /* Bottom badge */
        .visual-badge {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 99px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          font-size: 11px;
          color: rgba(255,255,255,.45);
          white-space: nowrap;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        /* ══════════════════════════════
           RIGHT — FORM SIDE
        ══════════════════════════════ */
        .login-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: #fafafa;
          overflow-y: auto;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .login-form-wrap {
          width: 100%;
          max-width: 400px;
          animation: fadeUp .6s cubic-bezier(.4,0,.2,1) .2s both;
        }
        .login-form-wrap.shake { animation: shake .6s ease; }

        .form-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px;
          border-radius: 99px;
          background: #f3e8ff;
          border: 1px solid #e9d5ff;
          margin-bottom: 24px;
        }
        .form-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#9333ea; animation:pulse 2s infinite; }
        .form-eyebrow-text { font-size:11px; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:.08em; }

        .form-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 3vw, 38px);
          color: #0a0a0f;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .form-sub { font-size: 14px; color: #94a3b8; margin-bottom: 36px; }

        /* Input fields */
        .field-group { margin-bottom: 20px; }
        .field-label {
          display: block;
          font-size: 12px; font-weight: 700;
          color: #374151;
          text-transform: uppercase; letter-spacing: .06em;
          margin-bottom: 8px;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          color: #111827;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          -webkit-appearance: none;
        }
        .field-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139,92,246,.1);
          background: #fdfcff;
        }
        .field-input.err { border-color: #f87171; background: #fff5f5; }
        .field-input.err:focus { box-shadow: 0 0 0 4px rgba(248,113,113,.1); }
        .field-input::placeholder { color: #9ca3af; }

        /* font-size 16px prevents iOS zoom */
        @media (max-width: 640px) { .field-input { font-size: 16px; } }

        .field-icon {
          position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          display: flex; align-items: center;
          pointer-events: none;
          transition: color .2s;
        }
        .field-wrap:focus-within .field-icon { color: #8b5cf6; }

        .pw-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 4px;
          display: flex; align-items: center;
          border-radius: 8px;
          transition: color .18s, background .18s;
        }
        .pw-btn:hover { color: #8b5cf6; background: rgba(139,92,246,.08); }

        /* Error */
        .error-box {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 13px 16px;
          border-radius: 12px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-left: 4px solid #ef4444;
          margin-bottom: 22px;
          animation: fadeIn .3s ease;
        }
        .error-icon { color: #ef4444; flex-shrink: 0; margin-top: 1px; }
        .error-text { font-size: 13px; font-weight: 500; color: #991b1b; line-height: 1.5; }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all .22s;
          letter-spacing: .01em;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(124,58,237,.35);
        }
        .submit-btn::before {
          content:'';
          position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
          opacity:0; transition:opacity .2s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity:1; }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,58,237,.5);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .65; cursor: not-allowed; box-shadow: none; }

        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
          flex-shrink: 0;
        }

        .form-footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.7;
        }

        /* ══════════════════════════════
           RESPONSIVE
        ══════════════════════════════ */

        /* Tablet */
        @media (max-width: 1024px) {
          .login-root { grid-template-columns: 1fr 1.2fr; }
          .login-visual { padding: 48px 40px; }
          .login-form-side { padding: 48px 40px; }
        }

        /* Mobile — stack vertically */
        @media (max-width: 768px) {
          body { overflow: auto; }
          .login-root {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            min-height: 100dvh;
          }

          .login-visual {
            padding: 36px 24px 32px;
            min-height: unset;
          }

          .logo-ring { width:60px; height:60px; border-radius:18px; margin-bottom:20px; }
          .logo-ring svg { width:28px; height:28px; }
          .visual-title { font-size: 26px; margin-bottom: 10px; }
          .visual-sub { font-size: 13px; margin-bottom: 28px; }
          .feature-cards { gap: 8px; max-width: 100%; }
          .feature-card { padding: 11px 14px; }
          .visual-badge { display: none; }

          .login-form-side {
            padding: 36px 24px 48px;
            min-height: unset;
            align-items: flex-start;
          }

          .form-title { font-size: 28px; }
          .form-sub { margin-bottom: 28px; }
        }

        @media (max-width: 400px) {
          .login-visual { padding: 28px 20px 24px; }
          .login-form-side { padding: 28px 20px 40px; }
          .feature-card { padding: 10px 12px; }
        }
      `}</style>

      <div className="login-root">

        {/* ══ LEFT — VISUAL ══ */}
        <div className="login-visual">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

          <div className="visual-content">
            <div className="logo-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/>
                <rect x="8" y="10" width="8" height="6" rx="1"/>
                <line x1="10" y1="19" x2="14" y2="19"/>
              </svg>
            </div>

            <h1 className="visual-title">
              CTU <em>FemCare</em><br/>Vending System
            </h1>
            <p className="visual-sub">
              Secure admin dashboard for monitoring and managing feminine care vending machines at Cebu Technological University.
            </p>

            <div className="feature-cards">
              {[
                { icon: '📦', color: 'rgba(139,92,246,.2)', text: 'Real-time Inventory', desc: 'Live stock monitoring across all slots' },
                { icon: '⚠️', color: 'rgba(251,146,60,.2)', text: 'Instant Alerts', desc: 'Notified when items run low' },
                { icon: '✏️', color: 'rgba(34,197,94,.2)', text: 'Full Management', desc: 'Add, edit, restock, and remove items' },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                  <div>
                    <div className="feature-text">{f.text}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="visual-badge">
            <div className="live-dot" />
            System Active · CTU Main Campus
          </div>
        </div>

        {/* ══ RIGHT — FORM ══ */}
        <div className="login-form-side">
          <div className={`login-form-wrap ${shake ? 'shake' : ''}`}>

            <div className="form-eyebrow">
              <div className="form-eyebrow-dot" />
              <span className="form-eyebrow-text">Admin Access Only</span>
            </div>

            <h2 className="form-title">Welcome back</h2>
            <p className="form-sub">Sign in to access the admin dashboard</p>

            <form onSubmit={handleLogin} noValidate>
              {error && (
                <div className="error-box" role="alert">
                  <span className="error-icon"><AlertIcon /></span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="field-group">
                <label className="field-label" htmlFor="email">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input
                    id="email"
                    className={`field-input ${error ? 'err' : ''}`}
                    type="email" inputMode="email"
                    autoComplete="email" autoCapitalize="none"
                    placeholder="admin@ctu.edu.ph"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group" style={{ marginBottom: '28px' }}>
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    id="password"
                    className={`field-input ${error ? 'err' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    disabled={loading}
                    style={{ paddingRight: '48px' }}
                  />
                  <button type="button" className="pw-btn" onClick={() => setShowPw(p => !p)} tabIndex={-1} aria-label="Toggle password">
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Signing in...</>
                ) : (
                  <>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              🔒 Restricted to authorized administrators only.<br/>
              Contact your system administrator for access.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
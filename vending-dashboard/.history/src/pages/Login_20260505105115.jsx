import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/configuration-not-found': 'Firebase config error. Contact admin.',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

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
      setError(ERROR_MESSAGES[err.code] || `Login failed (${err.code})`);
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { height: 100%; height: -webkit-fill-available; }
        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #f6f5f8;
        }
        #root { min-height: 100vh; min-height: 100dvh; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

        /* DESKTOP */
        .page {
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }

        .panel-left {
          background: linear-gradient(160deg, #1a0533 0%, #2d0f5e 45%, #1e0a45 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 48px;
          position: relative;
          overflow: hidden;
        }
        .panel-left::after {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(167,139,250,.2) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 70%, rgba(236,72,153,.15) 0%, transparent 70%);
          pointer-events:none;
        }
        .panel-left::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events:none;
        }

        .left-content { position:relative; z-index:1; width:100%; max-width:360px; }

        .brand-mark {
          width:72px; height:72px; border-radius:22px;
          background:rgba(255,255,255,.1);
          border:1px solid rgba(255,255,255,.18);
          backdrop-filter:blur(16px);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:32px;
          animation:float 4s ease-in-out infinite;
          box-shadow:0 0 48px rgba(167,139,250,.25);
        }

        .left-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(28px,2.8vw,40px);
          color:#fff; line-height:1.18;
          margin-bottom:14px; letter-spacing:-.3px;
        }
        .left-title span { font-style:italic; color:#c4b5fd; }
        .left-sub { font-size:14px; color:rgba(255,255,255,.5); line-height:1.8; margin-bottom:44px; }

        .features { display:flex; flex-direction:column; gap:10px; }
        .feat {
          display:flex; align-items:center; gap:12px;
          padding:13px 16px; border-radius:12px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.09);
          transition:background .2s;
        }
        .feat:hover { background:rgba(255,255,255,.1); }
        .feat-icon { font-size:18px; flex-shrink:0; }
        .feat-label { font-size:13px; font-weight:600; color:rgba(255,255,255,.85); }
        .feat-desc { font-size:11px; color:rgba(255,255,255,.4); margin-top:1px; }

        .live-pill {
          position:absolute; bottom:28px; left:50%; transform:translateX(-50%);
          display:flex; align-items:center; gap:8px;
          padding:7px 16px; border-radius:99px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
          font-size:11px; color:rgba(255,255,255,.45);
          white-space:nowrap; z-index:1;
        }
        .live-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; animation:pulse 2s infinite; }

        .panel-right {
          background:#f6f5f8;
          display:flex; align-items:center; justify-content:center;
          padding:48px 56px;
          overflow-y:auto;
        }

        .form-box {
          width:100%; max-width:380px;
          animation:fadeUp .5s cubic-bezier(.4,0,.2,1) .15s both;
        }
        .form-box.shake { animation:shake .5s ease; }

        .eyebrow {
          display:inline-flex; align-items:center; gap:7px;
          padding:5px 13px; border-radius:99px;
          background:#ede9fe; border:1px solid #ddd6fe;
          margin-bottom:20px;
        }
        .eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#7c3aed; animation:pulse 2s infinite; }
        .eyebrow-text { font-size:11px; font-weight:700; color:#6d28d9; text-transform:uppercase; letter-spacing:.08em; }

        .form-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(26px,2.5vw,36px);
          color:#0f0a1e; letter-spacing:-.3px;
          margin-bottom:6px; line-height:1.15;
        }
        .form-sub { font-size:14px; color:#94a3b8; margin-bottom:32px; }

        .field { margin-bottom:18px; }
        .field-label {
          display:block; font-size:11px; font-weight:700;
          color:#4b5563; text-transform:uppercase; letter-spacing:.07em;
          margin-bottom:7px;
        }
        .field-wrap { position:relative; }
        .field-icon {
          position:absolute; left:15px; top:50%;
          transform:translateY(-50%);
          color:#a0aec0; pointer-events:none;
          display:flex; align-items:center; transition:color .2s;
        }
        .field-wrap:focus-within .field-icon { color:#7c3aed; }

        .field-input {
          width:100%;
          padding:13px 14px 13px 46px;
          border-radius:12px;
          border:1.5px solid #e2e8f0;
          background:#fff;
          font-family:'DM Sans',sans-serif;
          font-size:16px;
          color:#1a1a2e; outline:none;
          transition:border-color .2s, box-shadow .2s;
          -webkit-appearance:none;
        }
        .field-input:focus {
          border-color:#7c3aed;
          box-shadow:0 0 0 3px rgba(124,58,237,.12);
        }
        .field-input.err { border-color:#f87171; }
        .field-input.err:focus { box-shadow:0 0 0 3px rgba(248,113,113,.1); }
        .field-input::placeholder { color:#cbd5e1; }

        .pw-toggle {
          position:absolute; right:13px; top:50%;
          transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:#94a3b8; padding:5px;
          display:flex; align-items:center;
          border-radius:8px; transition:color .18s;
        }
        .pw-toggle:hover { color:#7c3aed; }

        .err-box {
          display:flex; align-items:flex-start; gap:9px;
          padding:12px 14px; border-radius:11px;
          background:#fef2f2;
          border:1.5px solid #fecaca;
          border-left:4px solid #ef4444;
          margin-bottom:20px;
          animation:fadeIn .3s ease;
        }
        .err-icon { color:#ef4444; flex-shrink:0; margin-top:1px; }
        .err-msg { font-size:13px; font-weight:500; color:#991b1b; line-height:1.5; }

        .submit {
          width:100%; padding:14px;
          border-radius:12px; border:none;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff;
          font-family:'DM Sans',sans-serif;
          font-size:15px; font-weight:700;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:all .2s;
          box-shadow:0 4px 20px rgba(109,40,217,.3);
          margin-top:6px;
          -webkit-appearance:none;
        }
        .submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(109,40,217,.45); }
        .submit:active:not(:disabled) { transform:translateY(0); }
        .submit:disabled { opacity:.65; cursor:not-allowed; }

        .spinner {
          width:17px; height:17px;
          border:2.5px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin .7s linear infinite;
        }

        .form-note { text-align:center; margin-top:28px; font-size:12px; color:#94a3b8; line-height:1.7; }

        .mobile-brand { display:none; }

        /* MOBILE */
        @media (max-width: 768px) {
          .page {
            display: block;
            height: auto;
            min-height: 100dvh;
            overflow: visible;
          }

          .panel-left { display: none; }

          .panel-right {
            display: block;
            min-height: 100dvh;
            padding: 0;
            overflow: visible;
          }

          .form-box {
            max-width: 100%;
            padding: 52px 24px 48px;
          }

          .mobile-brand {
            display: flex !important;
            align-items: center; gap: 12px;
            margin-bottom: 36px;
          }
          .mobile-brand-icon {
            width:46px; height:46px; border-radius:14px;
            background:linear-gradient(135deg,#7c3aed,#6d28d9);
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0;
            box-shadow:0 4px 16px rgba(109,40,217,.3);
          }
          .mobile-brand-name { font-size:14px; font-weight:700; color:#1a0a3a; }
          .mobile-brand-sub  { font-size:11px; color:#94a3b8; margin-top:2px; }

          .form-title { font-size:30px; }

          .field-input { padding:14px 14px 14px 46px; }
          .submit { padding:15px; font-size:16px; }
        }

        @media (max-width: 400px) {
          .form-box { padding:44px 20px 44px; }
        }
      `}</style>

      <div className="page">

        {/* LEFT PANEL - desktop only */}
        <div className="panel-left">
          <div className="left-content">
            <div className="brand-mark">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <line x1="8" y1="6" x2="16" y2="6"/>
                <rect x="8" y="10" width="8" height="6" rx="1"/>
                <line x1="10" y1="19" x2="14" y2="19"/>
              </svg>
            </div>
            <h1 className="left-title">CTU <span>FemCare</span><br/>Vending System</h1>
            <p className="left-sub">Secure admin dashboard for monitoring and managing feminine care vending machines at Cebu Technological University.</p>
            <div className="features">
              {[
                { icon:'📦', label:'Real-time Inventory', desc:'Live stock monitoring across all slots' },
                { icon:'🔔', label:'Instant Low Stock Alerts', desc:'Get notified before items run out' },
                { icon:'✏️', label:'Full CRUD Management', desc:'Add, edit, restock and remove items' },
              ].map((f,i) => (
                <div key={i} className="feat">
                  <span className="feat-icon">{f.icon}</span>
                  <div><div className="feat-label">{f.label}</div><div className="feat-desc">{f.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="live-pill"><div className="live-dot"/>System Active · CTU Main Campus</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel-right">
          <div className={`form-box ${shake ? 'shake' : ''}`}>

            {/* Mobile brand header */}
            <div className="mobile-brand">
              <div className="mobile-brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <line x1="8" y1="6" x2="16" y2="6"/>
                  <rect x="8" y="10" width="8" height="6" rx="1"/>
                  <line x1="10" y1="19" x2="14" y2="19"/>
                </svg>
              </div>
              <div>
                <div className="mobile-brand-name">CTU FemCare Vending</div>
                <div className="mobile-brand-sub">Admin Dashboard · CTU Main Campus</div>
              </div>
            </div>

            <div className="eyebrow">
              <div className="eyebrow-dot"/>
              <span className="eyebrow-text">Admin Access Only</span>
            </div>

            <h2 className="form-title">Welcome back</h2>
            <p className="form-sub">Sign in to manage the vending system</p>

            <form onSubmit={handleLogin} noValidate>
              {error && (
                <div className="err-box" role="alert">
                  <span className="err-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </span>
                  <span className="err-msg">{error}</span>
                </div>
              )}

              <div className="field">
                <label className="field-label" htmlFor="login-email">Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input
                    id="login-email"
                    className={`field-input ${error ? 'err' : ''}`}
                    type="email" inputMode="email"
                    autoComplete="email" autoCapitalize="none" autoCorrect="off"
                    placeholder="admin@ctu.edu.ph"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    disabled={loading}
                    enterKeyHint="next"
                  />
                </div>
              </div>

              <div className="field" style={{marginBottom:'26px'}}>
                <label className="field-label" htmlFor="login-password">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    id="login-password"
                    className={`field-input ${error ? 'err' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    disabled={loading}
                    style={{paddingRight:'46px'}}
                    enterKeyHint="done"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="submit" disabled={loading}>
                {loading
                  ? <><div className="spinner"/> Signing in...</>
                  : <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Sign In
                    </>
                }
              </button>
            </form>

            <p className="form-note">🔒 Restricted to authorized administrators only.<br/>Contact your system administrator for access.</p>
          </div>
        </div>
      </div>
    </>
  );
}
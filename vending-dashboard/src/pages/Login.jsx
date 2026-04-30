import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Icons = {
  eye: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  lock: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  mail: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  alert: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  machine: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><rect x="8" y="10" width="8" height="6" rx="1"/><line x1="10" y1="19" x2="14" y2="19"/></svg>,
};

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password. Please check and try again.',
  'auth/too-many-requests': 'Too many failed attempts. Account temporarily locked. Try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/user-disabled': 'This account has been disabled. Contact your administrator.',
  'auth/operation-not-allowed': 'Email/password login is not enabled. Enable it in Firebase Console → Authentication.',
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

    if (!email.trim()) { setError('Please enter your email address.'); triggerShake(); return; }
    if (!password) { setError('Please enter your password.'); triggerShake(); return; }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      console.log('Login successful:', result.user.email);
      // onAuthStateChanged in App.jsx handles the redirect automatically
    } catch (err) {
      console.error('Login error code:', err.code, err.message);
      const msg = ERROR_MESSAGES[err.code] || `Login failed (${err.code}). Please try again.`;
      setError(msg);
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body { font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes spin     { to { transform:rotate(360deg) } }
        @keyframes gradShift{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }

        .login-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          background: #f8fafc;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          flex: 1;
          background: linear-gradient(135deg,#1e0a3c 0%,#3b0764 35%,#7c3aed 75%,#a855f7 100%);
          background-size: 220% 220%;
          animation: gradShift 9s ease infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content:''; position:absolute;
          width:420px; height:420px; border-radius:50%;
          background:rgba(255,255,255,.05);
          top:-110px; right:-110px; pointer-events:none;
        }
        .login-left::after {
          content:''; position:absolute;
          width:300px; height:300px; border-radius:50%;
          background:rgba(255,255,255,.04);
          bottom:-80px; left:-80px; pointer-events:none;
        }

        .brand-icon {
          width:76px; height:76px;
          background:rgba(255,255,255,.14);
          border-radius:22px;
          border:1px solid rgba(255,255,255,.22);
          backdrop-filter:blur(12px);
          display:flex; align-items:center; justify-content:center;
          color:#fff;
          margin:0 auto 26px;
          animation:float 4s ease-in-out infinite;
        }

        .feature-pill {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.12);
          border-radius:14px;
          padding:13px 18px;
          backdrop-filter:blur(10px);
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          background: #fff;
          overflow-y: auto;
        }

        .login-card {
          width: 100%;
          animation: fadeUp .5s cubic-bezier(.4,0,.2,1);
        }
        .login-card.shake { animation: shake .5s ease; }

        /* ── INPUTS ── */
        .field-label {
          display:block;
          font-size:11px; font-weight:700;
          color:#475569;
          text-transform:uppercase; letter-spacing:.06em;
          margin-bottom:7px;
        }
        .input-wrap { position:relative; margin-bottom:18px; }
        .input-icon {
          position:absolute; left:14px; top:50%;
          transform:translateY(-50%);
          color:#94a3b8; display:flex; align-items:center;
          pointer-events:none;
        }
        .login-input {
          width:100%;
          padding:13px 14px 13px 44px;
          border-radius:12px;
          border:1.5px solid #e2e8f0;
          font-family:'Sora',sans-serif;
          font-size:14px; color:#1e293b;
          background:#f8fafc;
          outline:none;
          transition:border-color .2s,box-shadow .2s,background .2s;
          -webkit-appearance:none;
        }
        .login-input:focus {
          border-color:#7c3aed;
          background:#fff;
          box-shadow:0 0 0 3px rgba(124,58,237,.12);
        }
        .login-input.has-error { border-color:#ef4444; background:#fff5f5; }
        .login-input.has-error:focus { box-shadow:0 0 0 3px rgba(239,68,68,.12); }

        .pw-toggle {
          position:absolute; right:12px; top:50%;
          transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:#94a3b8; padding:5px;
          display:flex; align-items:center;
          border-radius:7px;
          transition:color .18s, background .18s;
        }
        .pw-toggle:hover { color:#7c3aed; background:rgba(124,58,237,.08); }

        /* ── BUTTON ── */
        .login-btn {
          width:100%;
          padding:14px;
          border-radius:12px; border:none;
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff;
          font-family:'Sora',sans-serif;
          font-weight:700; font-size:15px;
          cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:all .22s;
          letter-spacing:.01em;
          margin-top:6px;
          -webkit-appearance:none;
        }
        .login-btn:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 8px 26px rgba(124,58,237,.42);
        }
        .login-btn:active:not(:disabled) { transform:translateY(0); box-shadow:none; }
        .login-btn:disabled { opacity:.65; cursor:not-allowed; }

        .spinner {
          width:18px; height:18px;
          border:2.5px solid rgba(255,255,255,.3);
          border-top-color:#fff;
          border-radius:50%;
          animation:spin .7s linear infinite;
          flex-shrink:0;
        }

        /* ── ERROR BOX ── */
        .error-box {
          background:#fef2f2;
          border:1.5px solid #fca5a5;
          border-left:4px solid #ef4444;
          border-radius:11px;
          padding:12px 14px;
          display:flex; align-items:flex-start; gap:9px;
          margin-bottom:20px;
          animation:fadeIn .3s ease;
        }

        /* ── RESPONSIVE: TABLET ── */
        @media (max-width: 900px) {
          .login-left { padding: 48px 32px; }
          .login-right { width: 420px; padding: 40px 32px; }
        }

        /* ── RESPONSIVE: MOBILE ── */
        @media (max-width: 640px) {
          .login-root { flex-direction: column; }

          .login-left {
            flex: none;
            padding: 36px 24px 32px;
          }
          .login-left-inner { flex-direction:row; gap:14px; text-align:left; }

          .brand-icon {
            width:52px; height:52px; border-radius:16px;
            margin:0; flex-shrink:0;
            animation:none;
          }

          .left-title  { font-size:20px !important; margin-bottom:4px !important; }
          .left-sub    { font-size:13px !important; }
          .feature-list { display:none !important; }

          .login-right {
            width:100%;
            flex:1;
            padding:32px 20px 40px;
            align-items:flex-start;
          }

          .login-card { animation: fadeUp .4s ease; }

          .login-input { font-size:16px; /* prevents iOS zoom */ }
          .login-btn   { font-size:15px; padding:14px; }
        }

        @media (max-width: 380px) {
          .login-right { padding: 28px 16px 36px; }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left-inner" style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:'340px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div className="brand-icon">{Icons.machine}</div>

            <div>
              <h1 className="left-title" style={{ fontSize:'30px', fontWeight:'800', color:'#fff', marginBottom:'12px', letterSpacing:'-0.5px', lineHeight:1.25 }}>
                CTU FemCare<br/>Vending System
              </h1>
              <p className="left-sub" style={{ color:'rgba(255,255,255,.65)', fontSize:'14px', lineHeight:'1.75' }}>
                Secure admin dashboard for monitoring and managing feminine care vending machines at Cebu Technological University.
              </p>
            </div>

            <div className="feature-list" style={{ marginTop:'36px', display:'flex', flexDirection:'column', gap:'12px', width:'100%' }}>
              {[
                { icon:'📦', text:'Real-time inventory monitoring' },
                { icon:'⚠️', text:'Instant low stock alerts' },
                { icon:'✏️', text:'Full CRUD management' },
              ].map((f,i) => (
                <div key={i} className="feature-pill">
                  <span style={{ fontSize:'18px', flexShrink:0 }}>{f.icon}</span>
                  <span style={{ color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:'500' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className={`login-card ${shake ? 'shake' : ''}`}>

            {/* Header */}
            <div style={{ marginBottom:'30px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', background:'#ede9fe', borderRadius:'99px', padding:'5px 13px', marginBottom:'18px' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#7c3aed', animation:'pulse 2s infinite' }} />
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#7c3aed', textTransform:'uppercase', letterSpacing:'.08em' }}>Admin Access Only</span>
              </div>
              <h2 style={{ fontSize:'26px', fontWeight:'800', color:'#0f172a', letterSpacing:'-0.5px', marginBottom:'6px' }}>Welcome back</h2>
              <p style={{ color:'#94a3b8', fontSize:'14px' }}>Sign in to access the admin dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate>

              {/* Error */}
              {error && (
                <div className="error-box" role="alert">
                  <span style={{ color:'#ef4444', flexShrink:0, marginTop:'1px' }}>{Icons.alert}</span>
                  <span style={{ fontSize:'13px', color:'#991b1b', fontWeight:'500', lineHeight:'1.55' }}>{error}</span>
                </div>
              )}

              {/* Email */}
              <label className="field-label" htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">{Icons.mail}</span>
                <input
                  id="email"
                  className={`login-input ${error ? 'has-error' : ''}`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholder="admin@ctu.edu.ph"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap" style={{ marginBottom:'24px' }}>
                <span className="input-icon">{Icons.lock}</span>
                <input
                  id="password"
                  className={`login-input ${error ? 'has-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  style={{ paddingRight:'46px' }}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(p => !p)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>

              {/* Submit */}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading
                  ? <><div className="spinner" /> Signing in...</>
                  : <>{Icons.lock} Sign In</>
                }
              </button>
            </form>

            {/* Footer note */}
            <p style={{ textAlign:'center', fontSize:'12px', color:'#94a3b8', marginTop:'28px', lineHeight:'1.7' }}>
              🔒 Restricted to authorized administrators only.<br/>
              Contact your system administrator for access.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
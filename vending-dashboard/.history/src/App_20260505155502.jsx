import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { database, auth } from './firebase';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Login from './pages/Login';

const LOW_STOCK_THRESHOLD = 3;

const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  alerts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  machine: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><rect x="8" y="10" width="8" height="6" rx="1"/><line x1="10" y1="19" x2="14" y2="19"/></svg>,
  logout: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{Icons.machine}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [page, setPage] = useState('dashboard');
  const [inventory, setInventory] = useState({});
  const [stats, setStats] = useState({ revenue: 0, totalDispenses: 0 });
  const [time, setTime] = useState(new Date());
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const invRef = ref(database, 'vendingMachine/inventory');
    const statsRef = ref(database, 'vendingMachine/stats');
    const u1 = onValue(invRef, snap => { if (snap.val()) setInventory(snap.val()); });
    const u2 = onValue(statsRef, snap => { if (snap.val()) setStats(snap.val()); });
    return () => { u1(); u2(); };
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut(auth);
    setLoggingOut(false);
    setPage('dashboard');
    setInventory({});
    setStats({ revenue: 0, totalDispenses: 0 });
  };

  const navigateTo = (p) => {
    setPage(p);
    setSidebarOpen(false);
  };

  if (user === undefined) return <LoadingScreen />;
  if (!user) return <Login />;

  const lowStockCount = Object.values(inventory).filter(i => i.stock <= LOW_STOCK_THRESHOLD).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'inventory', label: 'Inventory', icon: Icons.inventory },
    { id: 'alerts', label: 'Alerts', icon: Icons.alerts, badge: lowStockCount },
  ];

  const fmt = time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = time.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0 8px 20px', borderBottom:'1px solid #f1f5f9', marginBottom:'8px' }}>
        <div style={{ width:'38px', height:'38px', background:'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>{Icons.machine}</div>
        <div>
          <div style={{ fontWeight:'800', fontSize:'14px', color:'#0f172a', letterSpacing:'-0.3px' }}>FemCare</div>
          <div style={{ fontSize:'10px', color:'#94a3b8', fontWeight:'500' }}>CTU Main Campus</div>
        </div>
      </div>

      <div style={{ fontSize:'10px', fontWeight:'700', color:'#cbd5e1', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0 10px', marginBottom:'4px' }}>Navigation</div>

      {navItems.map(item => (
        <button key={item.id} onClick={() => navigateTo(item.id)}
          style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'10px', border:'none', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:'14px', fontWeight: page === item.id ? '700' : '500', background: page === item.id ? '#ede9fe' : 'transparent', color: page === item.id ? '#7c3aed' : '#64748b', transition:'all 0.18s ease', textAlign:'left', width:'100%', minHeight: '48px' }}
          onMouseEnter={e => { if(page !== item.id){ e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.color='#1e293b'; }}}
          onMouseLeave={e => { if(page !== item.id){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; }}}
        >
          <span style={{ opacity: page === item.id ? 1 : 0.7 }}>{item.icon}</span>
          {item.label}
          {item.badge > 0 && (
            <span style={{ marginLeft:'auto', background:'#ef4444', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'99px' }}>{item.badge}</span>
          )}
        </button>
      ))}

      {/* Bottom section */}
      <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:'12px' }}>
        <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'12px', border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg,#7c3aed,#ec4899)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>{Icons.user}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Administrator</div>
              <div style={{ fontSize:'10px', color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:'0 2px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
            <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', flexShrink:0, animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:'11px', color:'#22c55e', fontWeight:'600' }}>System Online</span>
          </div>
          <div className="mono" style={{ fontSize:'17px', fontWeight:'600', color:'#0f172a', letterSpacing:'-0.5px' }}>{fmt}</div>
          <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>{fmtDate}</div>
        </div>

        <button onClick={handleLogout} disabled={loggingOut}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 14px', borderRadius:'10px', border:'1.5px solid #fee2e2', background:'#fff', color:'#ef4444', fontFamily:"'Sora',sans-serif", fontSize:'14px', fontWeight:'600', cursor:'pointer', transition:'all 0.18s', width:'100%', minHeight:'48px' }}
          onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; }}
          onMouseLeave={e => { e.currentTarget.style.background='#fff'; }}
        >
          {Icons.logout}
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#f8fafc; font-family:'Sora',sans-serif; -webkit-font-smoothing:antialiased; }
        #root { display:flex; min-height:100vh; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
        .mono { font-family:'JetBrains Mono',monospace; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }

        /* Desktop sidebar */
        .desktop-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1.5px solid #e2e8f0;
          padding: 24px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          overflow-y: auto;
        }

        /* Mobile top bar */
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #fff;
          border-bottom: 1.5px solid #e2e8f0;
          z-index: 200;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        /* Mobile drawer overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.5);
          z-index: 300;
          backdropFilter: blur(4px);
        }

        /* Mobile drawer */
        .mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #fff;
          z-index: 400;
          padding: 24px 14px;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          animation: slideInLeft 0.25s ease;
        }

        .main-content {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          padding: 36px;
          background: #f8fafc;
        }

        /* Bottom nav bar for mobile */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #fff;
          border-top: 1.5px solid #e2e8f0;
          z-index: 200;
          align-items: center;
          justify-content: space-around;
          padding: 0 8px;
        }

        .mobile-bottom-nav button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          padding: 8px 4px;
          border-radius: 8px;
          transition: all 0.18s;
          position: relative;
        }

        .mobile-bottom-nav button.active {
          color: #7c3aed;
        }

        .mobile-bottom-nav button.active svg {
          stroke: #7c3aed;
        }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 76px !important;
            padding-bottom: 80px !important;
          }
        }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', background:'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>{Icons.machine}</div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'13px', color:'#0f172a' }}>FemCare</div>
            <div style={{ fontSize:'9px', color:'#94a3b8' }}>CTU Main Campus</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {lowStockCount > 0 && (
            <span style={{ background:'#ef4444', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'99px' }}>{lowStockCount} alert{lowStockCount > 1 ? 's' : ''}</span>
          )}
          <button onClick={() => setSidebarOpen(true)} style={{ width:'40px', height:'40px', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#475569' }}>
            {Icons.menu}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {sidebarOpen && (
        <div className="mobile-overlay" style={{ display:'block' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* MOBILE DRAWER */}
      {sidebarOpen && (
        <aside className="mobile-drawer" style={{ display:'flex' }}>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'8px' }}>
            <button onClick={() => setSidebarOpen(false)} style={{ width:'36px', height:'36px', borderRadius:'9px', border:'1.5px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b' }}>
              {Icons.close}
            </button>
          </div>
          <SidebarContent />
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        {page === 'dashboard' && <Dashboard inventory={inventory} stats={stats} lowStockCount={lowStockCount} setPage={navigateTo} />}
        {page === 'inventory' && <Inventory inventory={inventory} />}
        {page === 'alerts' && <Alerts inventory={inventory} lowStockThreshold={LOW_STOCK_THRESHOLD} />}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        {navItems.map(item => (
          <button key={item.id} onClick={() => navigateTo(item.id)} className={page === item.id ? 'active' : ''}>
            <span style={{ position:'relative' }}>
              {item.icon}
              {item.badge > 0 && (
                <span style={{ position:'absolute', top:'-4px', right:'-6px', width:'14px', height:'14px', background:'#ef4444', borderRadius:'50%', fontSize:'8px', fontWeight:'700', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{item.badge}</span>
              )}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from './firebase';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';

const LOW_STOCK_THRESHOLD = 3;

const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  alerts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  machine: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><rect x="8" y="10" width="8" height="6" rx="1"/><line x1="10" y1="19" x2="14" y2="19"/></svg>,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [inventory, setInventory] = useState({});
  const [stats, setStats] = useState({ revenue: 0, totalDispenses: 0 });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const invRef = ref(database, 'vendingMachine/inventory');
    const statsRef = ref(database, 'vendingMachine/stats');
    const u1 = onValue(invRef, snap => { if (snap.val()) setInventory(snap.val()); });
    const u2 = onValue(statsRef, snap => { if (snap.val()) setStats(snap.val()); });
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const lowStockCount = Object.values(inventory).filter(i => i.stock <= LOW_STOCK_THRESHOLD).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'inventory', label: 'Inventory', icon: Icons.inventory },
    { id: 'alerts', label: 'Alerts', icon: Icons.alerts, badge: lowStockCount },
  ];

  const fmt = time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = time.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }
        #root { display: flex; min-height: 100vh; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .fade-up { animation: fadeUp 0.45s cubic-bezier(.4,0,.2,1) both; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, background: '#fff',
        borderRight: '1.5px solid #e2e8f0', padding: '24px 14px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 20px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            {Icons.machine}
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', letterSpacing: '-0.3px' }}>FemCare</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>CTU Main Campus</div>
          </div>
        </div>

        <div style={{ fontSize: '10px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: '4px' }}>Navigation</div>

        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontFamily: "'Sora', sans-serif", fontSize: '13px', fontWeight: page === item.id ? '700' : '500',
            background: page === item.id ? '#ede9fe' : 'transparent',
            color: page === item.id ? '#7c3aed' : '#64748b',
            transition: 'all 0.18s ease', textAlign: 'left', width: '100%',
            position: 'relative'
          }}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; }}
            onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
          >
            <span style={{ opacity: page === item.id ? 1 : 0.7 }}>{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '99px', minWidth: '20px', textAlign: 'center' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Clock */}
        <div style={{ marginTop: 'auto', padding: '16px 10px 0', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>System Online</span>
          </div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', letterSpacing: '-0.5px' }}>{fmt}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{fmtDate}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', padding: '36px', background: '#f8fafc' }}>
        {page === 'dashboard' && <Dashboard inventory={inventory} stats={stats} lowStockCount={lowStockCount} setPage={setPage} />}
        {page === 'inventory' && <Inventory inventory={inventory} />}
        {page === 'alerts' && <Alerts inventory={inventory} lowStockThreshold={LOW_STOCK_THRESHOLD} />}
      </main>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from "firebase/database";
import { database } from './firebase';

const LOW_STOCK_THRESHOLD = 3;

const icons = {
  napkin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  wipes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  peso: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h8a4 4 0 0 1 0 8H6z"/><path d="M6 11h8"/><path d="M6 3v18"/>
    </svg>
  ),
  dispense: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  alert: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  restock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  ),
  machine: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/>
      <rect x="8" y="10" width="8" height="6" rx="1"/><line x1="10" y1="19" x2="14" y2="19"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// Mock data for when Firebase isn't connected yet
const MOCK_INVENTORY = {
  slot1: { name: "Sanitary Napkin (Regular)", price: 5, stock: 2, capacity: 10 },
  slot2: { name: "Sanitary Napkin (Overnight)", price: 10, stock: 7, capacity: 10 },
  slot3: { name: "Wet Wipes (Pack)", price: 5, stock: 4, capacity: 15 },
  slot4: { name: "Panty Liner", price: 5, stock: 1, capacity: 12 },
};
const MOCK_STATS = { revenue: 385, totalDispenses: 62 };

function StockBar({ stock, capacity }) {
  const pct = Math.max(0, Math.min(100, (stock / capacity) * 100));
  const color = pct <= 30 ? '#ef4444' : pct <= 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ position: 'relative', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%',
        width: `${pct}%`, background: color,
        borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
      }} />
    </div>
  );
}

function Toast({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px' }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: '#fff', border: '1.5px solid #fecaca', borderLeft: '4px solid #ef4444',
          borderRadius: '12px', padding: '14px 16px', boxShadow: '0 8px 32px rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          animation: 'slideIn 0.3s cubic-bezier(0.4,0,0.2,1)'
        }}>
          <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }}>{icons.alert}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', fontFamily: "'Sora', sans-serif" }}>Low Stock Alert</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{a.name} — only {a.stock} left</div>
          </div>
          <button onClick={() => onDismiss(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0', lineHeight: 1 }}>{icons.close}</button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [stats, setStats] = useState(MOCK_STATS);
  const [alerts, setAlerts] = useState([]);
  const [restocked, setRestocked] = useState({});
  const [time, setTime] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const invRef = ref(database, 'vendingMachine/inventory');
      const statsRef = ref(database, 'vendingMachine/stats');
      onValue(invRef, (snapshot) => { const d = snapshot.val(); if (d) setInventory(d); });
      onValue(statsRef, (snapshot) => { const d = snapshot.val(); if (d) setStats(d); });
    } catch (e) {
      // Using mock data
    }
  }, []);

  useEffect(() => {
    const newAlerts = Object.entries(inventory)
      .filter(([, item]) => item.stock <= LOW_STOCK_THRESHOLD)
      .map(([, item]) => ({ name: item.name, stock: item.stock }))
      .filter((_, i) => !dismissedAlerts.includes(i));
    setAlerts(newAlerts);
  }, [inventory]);

  const handleRestock = (slotId, maxCap) => {
    try {
      update(ref(database, `vendingMachine/inventory/${slotId}`), { stock: maxCap });
    } catch (e) {
      setInventory(prev => ({ ...prev, [slotId]: { ...prev[slotId], stock: maxCap } }));
    }
    setRestocked(prev => ({ ...prev, [slotId]: true }));
    setTimeout(() => setRestocked(prev => ({ ...prev, [slotId]: false })), 2000);
  };

  const totalItems = Object.values(inventory).reduce((s, i) => s + i.stock, 0);
  const lowStockCount = Object.values(inventory).filter(i => i.stock <= LOW_STOCK_THRESHOLD).length;

  const fmt = time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = time.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #f8fafc; font-family: 'Sora', sans-serif; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stat-card {
          background: #fff;
          border-radius: 20px;
          padding: 28px;
          border: 1.5px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          animation: fadeUp 0.5s ease both;
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.08);
          border-color: #c7d2fe;
        }

        .inv-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          border: 1.5px solid #e2e8f0;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation: fadeUp 0.5s ease both;
          position: relative;
          overflow: hidden;
        }
        .inv-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .inv-card.low-stock {
          border-color: #fca5a5;
          background: linear-gradient(135deg, #fff 60%, #fff5f5 100%);
        }
        .inv-card.low-stock:hover {
          border-color: #ef4444;
          box-shadow: 0 20px 60px rgba(239,68,68,0.12);
        }

        .restock-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.2s ease;
          margin-top: 18px;
        }
        .restock-btn.normal {
          background: #1e293b;
          color: #fff;
        }
        .restock-btn.normal:hover {
          background: #0f172a;
          transform: scale(1.02);
          box-shadow: 0 4px 16px rgba(30,41,59,0.25);
        }
        .restock-btn.success {
          background: #10b981;
          color: #fff;
        }
        .restock-btn:active { transform: scale(0.98); }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .badge.online { background: #dcfce7; color: #166534; }
        .badge.alert { background: #fee2e2; color: #991b1b; }

        .mono { font-family: 'JetBrains Mono', monospace; }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .sidebar-link:hover, .sidebar-link.active {
          background: #f1f5f9;
          color: #1e293b;
        }
        .sidebar-link.active { background: #ede9fe; color: #7c3aed; font-weight: 600; }
      `}</style>

      <Toast alerts={alerts} onDismiss={(i) => {
        setDismissedAlerts(prev => [...prev, i]);
        setAlerts(prev => prev.filter((_, idx) => idx !== i));
      }} />

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <aside style={{
          width: '240px', flexShrink: 0,
          background: '#fff', borderRight: '1.5px solid #e2e8f0',
          padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '6px',
          position: 'sticky', top: 0, height: '100vh'
        }}>
          <div style={{ padding: '0 8px 24px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                {icons.machine}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>FemCare</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>CTU Main Campus</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '4px' }}>Main</div>
          <a className="sidebar-link active">{icons.dispense} Dashboard</a>
          <a className="sidebar-link">{icons.restock} Inventory</a>
          <a className="sidebar-link">{icons.bell} Alerts {lowStockCount > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '99px' }}>{lowStockCount}</span>}</a>

          <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Current Time</div>
            <div className="mono" style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>{fmt}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{fmtDate}</div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                Inventory Dashboard
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                Monitor and manage your vending machine in real time
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {lowStockCount > 0 && (
                <span className="badge alert">{icons.alert} {lowStockCount} Low Stock</span>
              )}
              <span className="badge online">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                System Online
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {[
              {
                label: 'Total Revenue',
                value: `₱${stats.revenue.toLocaleString()}`,
                sub: 'All transactions',
                icon: icons.peso,
                color: '#7c3aed',
                bg: '#ede9fe',
                delay: '0s'
              },
              {
                label: 'Total Dispenses',
                value: stats.totalDispenses,
                sub: 'Products dispensed',
                icon: icons.dispense,
                color: '#0ea5e9',
                bg: '#e0f2fe',
                delay: '0.08s'
              },
              {
                label: 'Items in Stock',
                value: totalItems,
                sub: `${lowStockCount} slot(s) low`,
                icon: lowStockCount > 0 ? icons.alert : icons.check,
                color: lowStockCount > 0 ? '#ef4444' : '#10b981',
                bg: lowStockCount > 0 ? '#fee2e2' : '#dcfce7',
                delay: '0.16s'
              },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: s.delay }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                    <div className="mono" style={{ fontSize: '32px', fontWeight: '700', color: '#0f172a', marginTop: '8px', letterSpacing: '-1px' }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{s.sub}</div>
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Low Stock Banner */}
          {lowStockCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fff5f5, #fff)',
              border: '1.5px solid #fca5a5',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'fadeUp 0.4s ease'
            }}>
              <div style={{ width: '36px', height: '36px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                {icons.alert}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>Restock Required</div>
                <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '2px' }}>
                  {Object.entries(inventory).filter(([, i]) => i.stock <= LOW_STOCK_THRESHOLD).map(([, i]) => i.name).join(' · ')}
                </div>
              </div>
            </div>
          )}

          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Slot Overview</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{Object.keys(inventory).length} slots total</span>
          </div>

          {/* Inventory Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Object.entries(inventory).map(([id, item], idx) => {
              const pct = Math.round((item.stock / item.capacity) * 100);
              const isLow = item.stock <= LOW_STOCK_THRESHOLD;
              const isEmpty = item.stock === 0;
              const isRestocked = restocked[id];

              return (
                <div
                  key={id}
                  className={`inv-card ${isLow ? 'low-stock' : ''}`}
                  style={{ animationDelay: `${0.1 + idx * 0.07}s` }}
                  onMouseEnter={() => setHoveredCard(id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Corner accent */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '60px', height: '60px',
                    background: isLow ? 'rgba(239,68,68,0.06)' : 'rgba(124,58,237,0.04)',
                    borderRadius: '0 20px 0 60px'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                        {id.replace('slot', 'Slot ')}
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', lineHeight: '1.3' }}>{item.name}</div>
                    </div>
                    <div style={{
                      background: isLow ? '#fee2e2' : '#f1f5f9',
                      color: isLow ? '#ef4444' : '#7c3aed',
                      fontWeight: '800', fontSize: '15px',
                      padding: '6px 12px', borderRadius: '8px',
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0
                    }}>
                      ₱{item.price}
                    </div>
                  </div>

                  {/* Stock info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span className="mono" style={{ fontSize: '28px', fontWeight: '700', color: isLow ? '#ef4444' : '#0f172a', letterSpacing: '-1px' }}>
                        {item.stock}
                      </span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ {item.capacity}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontSize: '18px', fontWeight: '700', color: isLow ? '#ef4444' : '#10b981' }}>{pct}%</div>
                      {isLow && !isEmpty && (
                        <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {icons.alert} Low
                        </div>
                      )}
                      {isEmpty && (
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>EMPTY</div>
                      )}
                    </div>
                  </div>

                  <StockBar stock={item.stock} capacity={item.capacity} />

                  <button
                    className={`restock-btn ${isRestocked ? 'success' : 'normal'}`}
                    onClick={() => handleRestock(id, item.capacity)}
                  >
                    {isRestocked ? (
                      <><span>{icons.check}</span> Restocked!</>
                    ) : (
                      <><span>{icons.restock}</span> Restock to Full</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
            <span>CTU Feminine Care Vending Machine · Web Inventory System</span>
            <span className="mono">v1.0.0</span>
          </div>
        </main>
      </div>
    </>
  );
}
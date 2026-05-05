import React from 'react';

const LOW = 3;

const Icons = {
  peso: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8a4 4 0 0 1 0 8H6z"/><path d="M6 11h8"/><path d="M6 3v18"/></svg>,
  box: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

function StockBar({ stock, capacity }) {
  const pct = Math.max(0, Math.min(100, (stock / capacity) * 100));
  const color = pct <= 30 ? '#ef4444' : pct <= 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

export default function Dashboard({ inventory, stats, lowStockCount, setPage }) {
  const totalItems = Object.values(inventory).reduce((s, i) => s + (i.stock || 0), 0);
  const slots = Object.entries(inventory);

  const statCards = [
    { label: 'Total Revenue', value: `₱${(stats.revenue || 0).toLocaleString()}`, icon: Icons.peso, color: '#7c3aed', bg: '#ede9fe', delay: '0s' },
    { label: 'Total Dispenses', value: stats.totalDispenses || 0, icon: Icons.box, color: '#0ea5e9', bg: '#e0f2fe', delay: '0.07s' },
    { label: 'Items in Stock', value: totalItems, icon: lowStockCount > 0 ? Icons.alert : Icons.check, color: lowStockCount > 0 ? '#ef4444' : '#10b981', bg: lowStockCount > 0 ? '#fee2e2' : '#dcfce7', delay: '0.14s' },
    { label: 'Low Stock Slots', value: lowStockCount, icon: Icons.alert, color: lowStockCount > 0 ? '#f59e0b' : '#10b981', bg: lowStockCount > 0 ? '#fef3c7' : '#dcfce7', delay: '0.21s' },
  ];

  return (
    <div>
      <style>{`
        .stat-card { background:#fff; border-radius:18px; padding:20px; border:1.5px solid #e2e8f0; transition:transform .2s,box-shadow .2s,border-color .2s; animation:fadeUp .45s ease both; cursor:default; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.08); border-color:#c7d2fe; }
        .slot-row { background:#fff; border-radius:14px; padding:14px 16px; border:1.5px solid #e2e8f0; display:flex; align-items:center; gap:12px; transition:all .2s; animation:fadeUp .45s ease both; }
        .slot-row:hover { border-color:#a5b4fc; box-shadow:0 8px 24px rgba(0,0,0,.06); }
        .slot-row.low { border-color:#fca5a5; background:linear-gradient(90deg,#fff 70%,#fff5f5); }
        .view-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:8px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; background:#f1f5f9; color:#475569; transition:all .18s; min-height:42px; }
        .view-btn:hover { background:#ede9fe; color:#7c3aed; }
        .view-btn:active { transform:scale(0.97); }

        /* Responsive stat grid */
        .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px; }
        @media (max-width:768px) {
          .stat-grid { grid-template-columns:repeat(2,1fr); gap:12px; margin-bottom:20px; }
          .stat-card { padding:16px; border-radius:14px; }
          .stat-card .stat-value { font-size:24px !important; }
          .slot-row { padding:12px 14px; }
          .view-btn { padding:10px 14px; font-size:12px; }
          .dash-header { margin-bottom:20px !important; }
          .dash-header h1 { font-size:22px !important; }
          .banner-text { font-size:12px !important; }
          .banner-names { font-size:11px !important; }
          .slot-id { width:32px !important; height:32px !important; font-size:11px !important; }
          .slot-name { font-size:12px !important; }
          .slot-count { font-size:12px !important; }
          .slot-price { font-size:12px !important; }
          .section-header { flex-direction:column; align-items:flex-start !important; gap:10px; }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header" style={{ marginBottom: '28px', animation: 'fadeUp .4s ease' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Real-time overview of your vending machine</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: s.delay }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: '1.3' }}>{s.label}</div>
                <div className="mono stat-value" style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginTop: '6px', letterSpacing: '-1px' }}>{s.value}</div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0, marginLeft: '8px' }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <div style={{ background: 'linear-gradient(90deg,#fff5f5,#fff)', border: '1.5px solid #fca5a5', borderLeft: '4px solid #ef4444', borderRadius: '14px', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'fadeUp .4s ease', flexWrap: 'wrap' }}>
          <div style={{ width: '34px', height: '34px', background: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>{Icons.alert}</div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '13px' }}>⚠ Restock Required</div>
            <div className="banner-names" style={{ color: '#dc2626', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>
              {Object.values(inventory).filter(i => i.stock <= LOW).map(i => i.name).join(' · ')}
            </div>
          </div>
          <button onClick={() => setPage('inventory')} className="view-btn" style={{ background: '#fee2e2', color: '#ef4444', flexShrink: 0 }}>
            Manage {Icons.arrow}
          </button>
        </div>
      )}

      {/* Slot list header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Slot Overview</h2>
        <button onClick={() => setPage('inventory')} className="view-btn">View All {Icons.arrow}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {slots.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8', background: '#fff', borderRadius: '14px', border: '1.5px dashed #e2e8f0' }}>
            No inventory data yet. Add items in the Inventory page.
          </div>
        )}
        {slots.map(([id, item], idx) => {
          const isLow = item.stock <= LOW;
          const pct = Math.round((item.stock / item.capacity) * 100);
          return (
            <div key={id} className={`slot-row ${isLow ? 'low' : ''}`} style={{ animationDelay: `${idx * 0.06}s` }}>
              <div className="slot-id" style={{ width: '36px', height: '36px', borderRadius: '10px', background: isLow ? '#fee2e2' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLow ? '#ef4444' : '#7c3aed', fontWeight: '800', fontSize: '11px', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>
                {id.replace('slot', 'S')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="slot-name" style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <StockBar stock={item.stock} capacity={item.capacity} />
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="mono slot-count" style={{ fontSize: '13px', fontWeight: '700', color: isLow ? '#ef4444' : '#1e293b' }}>{item.stock}/{item.capacity}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{pct}%</div>
              </div>
              <div className="mono slot-price" style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed', fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>₱{item.price}</div>
              {isLow && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
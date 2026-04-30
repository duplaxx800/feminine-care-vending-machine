import React, { useState } from 'react';
import { ref, update } from "firebase/database";
import { database } from '../firebase';

const Icons = {
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  restock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
  empty: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

function StockBar({ stock, capacity }) {
  const pct = Math.max(0, Math.min(100, (stock / capacity) * 100));
  const color = pct === 0 ? '#dc2626' : pct <= 30 ? '#ef4444' : '#f59e0b';
  return (
    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width .6s ease' }} />
    </div>
  );
}

export default function Alerts({ inventory, lowStockThreshold }) {
  const [restoring, setRestoring] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const lowItems = Object.entries(inventory).filter(([, item]) => item.stock <= lowStockThreshold);
  const emptyItems = lowItems.filter(([, item]) => item.stock === 0);
  const criticalItems = lowItems.filter(([, item]) => item.stock > 0 && item.stock <= lowStockThreshold);

  const handleRestoreFull = async (id) => {
    const item = inventory[id];
    setRestoring(prev => ({ ...prev, [id]: true }));
    try {
      await update(ref(database, `vendingMachine/inventory/${id}`), { stock: item.capacity });
      showToast(`✓ ${item.name} restocked to full (${item.capacity} units)`);
    } catch { showToast('Failed to restock.'); }
    setRestoring(prev => ({ ...prev, [id]: false }));
  };

  const handleRestoreAll = async () => {
    const updates = {};
    lowItems.forEach(([id, item]) => { updates[`vendingMachine/inventory/${id}/stock`] = item.capacity; });
    try {
      await update(ref(database), updates);
      showToast(`✓ All ${lowItems.length} items restocked to full capacity`);
    } catch { showToast('Failed to restock all.'); }
  };

  return (
    <div>
      <style>{`
        .alert-card { background:#fff; border-radius:16px; padding:20px; border:1.5px solid; transition:transform .2s,box-shadow .2s; animation:fadeUp .4s ease both; }
        .alert-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,.08); }
        .restock-full-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:9px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:12px; font-weight:700; transition:all .18s; flex-shrink:0; }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', fontWeight: '600', color: '#166534', animation: 'slideIn .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.1)' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', animation: 'fadeUp .4s ease' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Alerts</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Monitor and respond to low stock warnings</p>
        </div>
        {lowItems.length > 0 && (
          <button onClick={handleRestoreAll} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            {Icons.restock} Restock All ({lowItems.length})
          </button>
        )}
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Alerts', value: lowItems.length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Empty Slots', value: emptyItems.length, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Low Stock', value: criticalItems.length, color: '#f59e0b', bg: '#fef3c7' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1.5px solid #e2e8f0', animation: `fadeUp .4s ease ${i * 0.07}s both` }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: s.value > 0 ? s.color : '#10b981', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '-1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {lowItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 20px', background: '#fff', borderRadius: '18px', border: '1.5px solid #e2e8f0', animation: 'fadeUp .4s ease' }}>
          <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 16px' }}>{Icons.check}</div>
          <div style={{ fontWeight: '800', fontSize: '18px', color: '#1e293b', marginBottom: '6px' }}>All Good!</div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>All inventory slots are sufficiently stocked.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {emptyItems.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>🔴 Empty Slots</div>
          )}
          {emptyItems.map(([id, item], idx) => (
            <div key={id} className="alert-card" style={{ borderColor: '#fca5a5', background: 'linear-gradient(135deg,#fff,#fff5f5)', animationDelay: `${idx * 0.06}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>{Icons.alert}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StockBar stock={item.stock} capacity={item.capacity} />
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', flexShrink: 0 }}>0/{item.capacity}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block', letterSpacing: '0.05em' }}>EMPTY — NEEDS IMMEDIATE RESTOCK</span>
                </div>
                <button className="restock-full-btn" onClick={() => handleRestoreFull(id)} disabled={restoring[id]} style={{ background: '#ef4444', color: '#fff' }}>
                  {restoring[id] ? 'Restocking...' : <>{Icons.restock} Restock Full</>}
                </button>
              </div>
            </div>
          ))}

          {criticalItems.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>🟡 Low Stock</div>
          )}
          {criticalItems.map(([id, item], idx) => (
            <div key={id} className="alert-card" style={{ borderColor: '#fde68a', background: 'linear-gradient(135deg,#fff,#fffbeb)', animationDelay: `${(emptyItems.length + idx) * 0.06}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>{Icons.alert}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StockBar stock={item.stock} capacity={item.capacity} />
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', flexShrink: 0 }}>{item.stock}/{item.capacity}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>Only {item.stock} unit{item.stock !== 1 ? 's' : ''} remaining</span>
                </div>
                <button className="restock-full-btn" onClick={() => handleRestoreFull(id)} disabled={restoring[id]} style={{ background: '#f59e0b', color: '#fff' }}>
                  {restoring[id] ? 'Restocking...' : <>{Icons.restock} Restock Full</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
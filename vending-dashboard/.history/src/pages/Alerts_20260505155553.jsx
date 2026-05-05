import React, { useState } from 'react';
import { ref, update } from "firebase/database";
import { database } from '../firebase';

const Icons = {
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  restock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
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
        .alert-card { background:#fff; border-radius:16px; padding:18px; border:1.5px solid; transition:transform .2s,box-shadow .2s; animation:fadeUp .4s ease both; }
        .alert-card:hover { transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,0,0,.08); }

        .restock-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border-radius:10px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-weight:700; transition:all .18s; }
        .restock-btn:active { transform:scale(0.97); }

        /* Summary grid */
        .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px; }

        /* Alert card layout */
        .alert-inner { display:flex; align-items:center; gap:14px; }
        .alert-actions { flex-shrink:0; }

        @media (max-width:768px) {
          .alerts-header { flex-direction:column !important; align-items:stretch !important; gap:12px !important; }
          .alerts-header h1 { font-size:22px !important; }
          .restock-all-btn { width:100% !important; justify-content:center !important; min-height:48px !important; }
          .summary-grid { gap:10px; margin-bottom:20px; }
          .summary-grid > div { padding:14px !important; border-radius:12px !important; }
          .summary-value { font-size:26px !important; }
          .alert-inner { flex-wrap:wrap; gap:12px; }
          .alert-actions { width:100% !important; }
          .alert-actions button { width:100% !important; min-height:46px !important; font-size:13px !important; padding:12px 16px !important; }
          .alert-card { padding:14px; }
          .alert-icon { width:38px !important; height:38px !important; }
          .alert-name { font-size:13px !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px 18px', fontSize: '13px', fontWeight: '600', color: '#166534', animation: 'slideIn .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.1)', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 32px)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="alerts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', animation: 'fadeUp .4s ease' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Alerts</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Monitor and respond to low stock warnings</p>
        </div>
        {lowItems.length > 0 && (
          <button className="restock-all-btn restock-btn" onClick={handleRestoreAll}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            {Icons.restock} Restock All ({lowItems.length})
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="summary-grid">
        {[
          { label: 'Total Alerts', value: lowItems.length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Empty Slots', value: emptyItems.length, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Low Stock', value: criticalItems.length, color: '#f59e0b', bg: '#fef3c7' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1.5px solid #e2e8f0', animation: `fadeUp .4s ease ${i * 0.07}s both` }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', lineHeight: '1.3' }}>{s.label}</div>
            <div className="summary-value mono" style={{ fontSize: '30px', fontWeight: '800', color: s.value > 0 ? s.color : '#10b981', letterSpacing: '-1px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      {lowItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: '18px', border: '1.5px solid #e2e8f0', animation: 'fadeUp .4s ease' }}>
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
              <div className="alert-inner">
                <div className="alert-icon" style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>{Icons.alert}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="alert-name" style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StockBar stock={item.stock} capacity={item.capacity} />
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', flexShrink: 0 }}>0/{item.capacity}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block', letterSpacing: '0.04em' }}>EMPTY — NEEDS IMMEDIATE RESTOCK</span>
                </div>
                <div className="alert-actions">
                  <button className="restock-btn" onClick={() => handleRestoreFull(id)} disabled={restoring[id]}
                    style={{ padding: '10px 16px', fontSize: '12px', background: '#ef4444', color: '#fff' }}>
                    {restoring[id] ? 'Restocking...' : <>{Icons.restock} Restock Full</>}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {criticalItems.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 4px' }}>🟡 Low Stock</div>
          )}
          {criticalItems.map(([id, item], idx) => (
            <div key={id} className="alert-card" style={{ borderColor: '#fde68a', background: 'linear-gradient(135deg,#fff,#fffbeb)', animationDelay: `${(emptyItems.length + idx) * 0.06}s` }}>
              <div className="alert-inner">
                <div className="alert-icon" style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>{Icons.alert}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="alert-name" style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StockBar stock={item.stock} capacity={item.capacity} />
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', flexShrink: 0 }}>{item.stock}/{item.capacity}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block' }}>Only {item.stock} unit{item.stock !== 1 ? 's' : ''} remaining</span>
                </div>
                <div className="alert-actions">
                  <button className="restock-btn" onClick={() => handleRestoreFull(id)} disabled={restoring[id]}
                    style={{ padding: '10px 16px', fontSize: '12px', background: '#f59e0b', color: '#fff' }}>
                    {restoring[id] ? 'Restocking...' : <>{Icons.restock} Restock Full</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { ref, update, remove, push, set } from "firebase/database";
import { database } from '../firebase';

const Icons = {
  add: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  delete: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  restock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const EMPTY_FORM = { name: '', price: '', stock: '', capacity: '' };

function StockBar({ stock, capacity }) {
  const pct = Math.max(0, Math.min(100, (stock / capacity) * 100));
  const color = pct <= 30 ? '#ef4444' : pct <= 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width .6s ease' }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', backdropFilter: 'blur(4px)', animation: 'fadeIn .2s ease' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px', padding: '28px 24px', boxShadow: '0 -8px 40px rgba(0,0,0,.15)', animation: 'slideUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '99px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '9px', border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.close}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text', min, placeholder, required }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}</label>
      <input
        type={type} name={name} value={value} onChange={onChange} min={min} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontFamily: "'Sora',sans-serif", fontSize: '16px', color: '#1e293b', background: '#f8fafc', outline: 'none', transition: 'border-color .18s', WebkitAppearance: 'none' }}
        onFocus={e => e.target.style.borderColor = '#7c3aed'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontFamily: "'Sora',sans-serif", fontWeight: '600', fontSize: '14px', cursor: 'pointer', minHeight: '48px' }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '48px' }}>{Icons.delete} Delete</button>
      </div>
    </Modal>
  );
}

export default function Inventory({ inventory }) {
  const [modal, setModal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (id) => {
    const item = inventory[id];
    setForm({ name: item.name, price: item.price, stock: item.stock, capacity: item.capacity });
    setSelectedId(id);
    setModal('edit');
  };
  const openRestock = (id) => { setSelectedId(id); setRestockQty(''); setModal('restock'); };
  const openDelete = (id) => { setSelectedId(id); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelectedId(null); };

  const handleFormChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newRef = push(ref(database, 'vendingMachine/inventory'));
      await set(newRef, {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        capacity: Number(form.capacity),
        createdAt: Date.now()
      });
      showToast(`"${form.name}" added successfully!`);
      closeModal();
    } catch { showToast('Failed to add item. Check Firebase connection.', 'error'); }
    setSaving(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(ref(database, `vendingMachine/inventory/${selectedId}`), {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        capacity: Number(form.capacity),
      });
      showToast(`"${form.name}" updated!`);
      closeModal();
    } catch { showToast('Failed to update item.', 'error'); }
    setSaving(false);
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const item = inventory[selectedId];
    const qty = Number(restockQty);
    const space = item.capacity - item.stock;
    if (qty <= 0 || qty > space) return showToast(`Enter a valid quantity (1–${space}).`, 'error');
    setSaving(true);
    try {
      await update(ref(database, `vendingMachine/inventory/${selectedId}`), { stock: item.stock + qty });
      showToast(`Added ${qty} units to "${item.name}"`);
      closeModal();
    } catch { showToast('Failed to restock.', 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    const name = inventory[selectedId]?.name;
    try {
      await remove(ref(database, `vendingMachine/inventory/${selectedId}`));
      showToast(`"${name}" deleted.`);
      closeModal();
    } catch { showToast('Failed to delete item.', 'error'); }
  };

  const slots = Object.entries(inventory).filter(([, item]) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

        .inv-card { background:#fff; border-radius:16px; padding:16px; border:1.5px solid #e2e8f0; transition:all .2s; animation:fadeUp .4s ease both; }
        .inv-card:hover { border-color:#a5b4fc; box-shadow:0 8px 24px rgba(0,0,0,.06); }
        .inv-card.low { border-color:#fca5a5; background:linear-gradient(135deg,#fff,#fff5f5); }

        /* Desktop table */
        .inv-table { background:#fff; border-radius:18px; overflow:hidden; border:1.5px solid #e2e8f0; }
        .inv-table-row { display:grid; grid-template-columns:1fr 80px 120px 90px 165px; gap:16px; padding:14px 20px; border-top:1px solid #f1f5f9; align-items:center; animation:fadeUp .4s ease both; transition:background .15s; }
        .inv-table-row:hover { background:#fafbff; }
        .action-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 12px; border-radius:8px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:12px; font-weight:600; transition:all .18s; min-height:34px; }
        .btn-edit { background:#ede9fe; color:#7c3aed; }
        .btn-edit:hover { background:#ddd6fe; }
        .btn-restock { background:#dcfce7; color:#16a34a; }
        .btn-restock:hover { background:#bbf7d0; }
        .btn-delete { background:#fee2e2; color:#ef4444; }
        .btn-delete:hover { background:#fecaca; }
        .btn-save { width:100%; padding:14px; border-radius:12px; border:none; background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; fontFamily:"'Sora',sans-serif"; font-size:14px; font-weight:700; cursor:pointer; margin-top:8px; transition:all .2s; min-height:50px; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,.3); }
        .btn-save:disabled { opacity:0.6; cursor:not-allowed; }

        /* Mobile card actions */
        .mobile-action-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:10px 14px; border-radius:10px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; transition:all .18s; min-height:44px; flex:1; }
        .mobile-action-btn:active { transform:scale(0.97); }

        /* Show/hide based on screen */
        .desktop-table { display:block; }
        .mobile-cards { display:none; }

        @media (max-width:768px) {
          .desktop-table { display:none !important; }
          .mobile-cards { display:flex !important; flex-direction:column; gap:12px; }
          .inv-header { flex-direction:column !important; align-items:stretch !important; gap:12px !important; }
          .inv-header h1 { font-size:22px !important; }
          .add-btn { width:100% !important; justify-content:center !important; min-height:48px !important; }
          .search-wrap { width:100% !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1.5px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`, borderRadius: '12px', padding: '12px 18px', fontSize: '13px', fontWeight: '600', color: toast.type === 'error' ? '#991b1b' : '#166534', animation: 'slideUp .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.1)', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="inv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', animation: 'fadeUp .4s ease', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Inventory</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>{Object.keys(inventory).length} items · {Object.values(inventory).reduce((s, i) => s + i.stock, 0)} units total</p>
        </div>
        <button className="add-btn" onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 20px', borderRadius: '11px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}>
          {Icons.add} Add New Item
        </button>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ position: 'relative', marginBottom: '20px', animation: 'fadeUp .4s ease .05s both' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>{Icons.search}</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontFamily: "'Sora',sans-serif", fontSize: '14px', color: '#1e293b', background: '#fff', outline: 'none', transition: 'border-color .18s' }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* DESKTOP TABLE */}
      <div className="desktop-table">
        <div className="inv-table">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 90px 165px', gap: '16px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {['Product Name', 'Price', 'Stock', 'Capacity', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
            ))}
          </div>
          {slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: '#64748b', marginBottom: '4px' }}>{search ? 'No items match your search' : 'No items yet'}</div>
              <div style={{ fontSize: '13px' }}>{!search && 'Click "Add New Item" to get started'}</div>
            </div>
          ) : (
            slots.map(([id, item], idx) => {
              const isLow = item.stock <= 3;
              const isEmpty = item.stock === 0;
              const pct = Math.round((item.stock / item.capacity) * 100);
              return (
                <div key={id} className="inv-table-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StockBar stock={item.stock} capacity={item.capacity} />
                      <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>{pct}%</span>
                    </div>
                    {isEmpty && <span style={{ fontSize: '10px', fontWeight: '700', color: '#ef4444', background: '#fee2e2', padding: '1px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>EMPTY</span>}
                    {isLow && !isEmpty && <span style={{ fontSize: '10px', fontWeight: '700', color: '#f59e0b', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>LOW STOCK</span>}
                  </div>
                  <div className="mono" style={{ fontWeight: '700', color: '#7c3aed', fontSize: '14px' }}>₱{item.price}</div>
                  <div className="mono" style={{ fontWeight: '700', color: isLow ? '#ef4444' : '#1e293b', fontSize: '14px' }}>{item.stock} <span style={{ color: '#94a3b8', fontWeight: '400' }}>units</span></div>
                  <div className="mono" style={{ fontWeight: '600', color: '#64748b', fontSize: '14px' }}>{item.capacity}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="action-btn btn-edit" onClick={() => openEdit(id)}>{Icons.edit} Edit</button>
                    <button className="action-btn btn-restock" onClick={() => openRestock(id)}>{Icons.restock} Restock</button>
                    <button className="action-btn btn-delete" onClick={() => openDelete(id)}>{Icons.delete}</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="mobile-cards">
        {slots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
            <div style={{ fontWeight: '600', fontSize: '15px', color: '#64748b', marginBottom: '4px' }}>{search ? 'No items match your search' : 'No items yet'}</div>
            <div style={{ fontSize: '13px' }}>{!search && 'Tap "Add New Item" to get started'}</div>
          </div>
        ) : (
          slots.map(([id, item], idx) => {
            const isLow = item.stock <= 3;
            const isEmpty = item.stock === 0;
            const pct = Math.round((item.stock / item.capacity) * 100);
            return (
              <div key={id} className={`inv-card ${isLow ? 'low' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {isEmpty && <span style={{ fontSize: '10px', fontWeight: '700', color: '#ef4444', background: '#fee2e2', padding: '2px 7px', borderRadius: '4px' }}>EMPTY</span>}
                      {isLow && !isEmpty && <span style={{ fontSize: '10px', fontWeight: '700', color: '#f59e0b', background: '#fef3c7', padding: '2px 7px', borderRadius: '4px' }}>LOW STOCK</span>}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: '16px', fontWeight: '800', color: '#7c3aed', marginLeft: '12px', flexShrink: 0 }}>₱{item.price}</div>
                </div>

                {/* Stock bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Stock Level</span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: isLow ? '#ef4444' : '#1e293b' }}>{item.stock}/{item.capacity} ({pct}%)</span>
                  </div>
                  <StockBar stock={item.stock} capacity={item.capacity} />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="mobile-action-btn" onClick={() => openEdit(id)} style={{ background: '#ede9fe', color: '#7c3aed' }}>{Icons.edit} Edit</button>
                  <button className="mobile-action-btn" onClick={() => openRestock(id)} style={{ background: '#dcfce7', color: '#16a34a' }}>{Icons.restock} Restock</button>
                  <button className="mobile-action-btn" onClick={() => openDelete(id)} style={{ background: '#fee2e2', color: '#ef4444', flex: 'none', padding: '10px 14px' }}>{Icons.delete}</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD MODAL */}
      {modal === 'add' && (
        <Modal title="Add New Item" onClose={closeModal}>
          <form onSubmit={handleAdd}>
            <FormField label="Product Name" name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Sanitary Napkin (Regular)" required />
            <FormField label="Price (₱)" name="price" type="number" min="1" value={form.price} onChange={handleFormChange} placeholder="e.g. 5" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Initial Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} placeholder="e.g. 10" required />
              <FormField label="Max Capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handleFormChange} placeholder="e.g. 15" required />
            </div>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Saving...' : <>{Icons.check} Add Item</>}</button>
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {modal === 'edit' && selectedId && (
        <Modal title="Edit Item" onClose={closeModal}>
          <form onSubmit={handleEdit}>
            <FormField label="Product Name" name="name" value={form.name} onChange={handleFormChange} placeholder="Product name" required />
            <FormField label="Price (₱)" name="price" type="number" min="1" value={form.price} onChange={handleFormChange} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="Current Stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} required />
              <FormField label="Max Capacity" name="capacity" type="number" min="1" value={form.capacity} onChange={handleFormChange} required />
            </div>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Saving...' : <>{Icons.check} Save Changes</>}</button>
          </form>
        </Modal>
      )}

      {/* RESTOCK MODAL */}
      {modal === 'restock' && selectedId && (() => {
        const item = inventory[selectedId];
        const space = item.capacity - item.stock;
        return (
          <Modal title="Restock Item" onClose={closeModal}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', marginBottom: '10px' }}>{item.name}</div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div><div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Current</div><div className="mono" style={{ fontWeight: '700', color: '#ef4444', fontSize: '18px' }}>{item.stock}</div></div>
                <div><div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Capacity</div><div className="mono" style={{ fontWeight: '700', color: '#1e293b', fontSize: '18px' }}>{item.capacity}</div></div>
                <div><div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Space Left</div><div className="mono" style={{ fontWeight: '700', color: '#10b981', fontSize: '18px' }}>{space}</div></div>
              </div>
            </div>
            <form onSubmit={handleRestock}>
              <FormField label={`Add Quantity (max ${space})`} name="restockQty" type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder={`Enter amount (max ${space})`} required />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[Math.ceil(space / 4), Math.ceil(space / 2), space].filter(v => v > 0).map(v => (
                  <button key={v} type="button" onClick={() => setRestockQty(String(v))} style={{ padding: '10px 16px', borderRadius: '9px', border: '1.5px solid #e2e8f0', background: restockQty == v ? '#ede9fe' : '#f8fafc', color: restockQty == v ? '#7c3aed' : '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Sora',sans-serif", minHeight: '44px', flex: 1 }}>
                    +{v}{v === space ? ' (Full)' : ''}
                  </button>
                ))}
              </div>
              <button type="submit" className="btn-save" disabled={saving || !restockQty || Number(restockQty) <= 0}>{saving ? 'Restocking...' : <>{Icons.restock} Confirm Restock</>}</button>
            </form>
          </Modal>
        );
      })()}

      {/* DELETE CONFIRM */}
      {modal === 'delete' && selectedId && (
        <ConfirmModal
          message={`Are you sure you want to delete "${inventory[selectedId]?.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
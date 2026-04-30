import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from "firebase/database";
import { database } from './firebase';

const LOW_STOCK_THRESHOLD = 3;

// --- Icons Component ---
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  inventory: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"/><path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  napkin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  wipes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  peso: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 18h-7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7"/><path d="M12 12V8m0 8v-4"/>
    </svg>
  ),
  package: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/>
    </svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // State for routing
  const [inventory, setInventory] = useState({});
  const [stats, setStats] = useState({ revenue: 0, totalDispenses: 0 });
  const [restockStatus, setRestockStatus] = useState({});

  useEffect(() => {
    const invRef = ref(database, 'vendingMachine/inventory');
    const statsRef = ref(database, 'vendingMachine/stats');

    onValue(invRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setInventory(data);
    });

    onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStats(data);
    });
  }, []);

  const handleRestock = (id, capacity) => {
    update(ref(database, `vendingMachine/inventory/${id}`), { stock: capacity })
      .then(() => {
        setRestockStatus(prev => ({ ...prev, [id]: true }));
        setTimeout(() => setRestockStatus(prev => ({ ...prev, [id]: false })), 2000);
      });
  };

  // --- Sub-Components ---
  const SidebarItem = ({ id, label, icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`sidebar-item ${activeTab === id ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const StockBar = ({ stock, capacity }) => {
    const percentage = (stock / capacity) * 100;
    const barColor = percentage <= 20 ? '#ef4444' : percentage <= 50 ? '#f59e0b' : '#3b82f6';
    return (
      <div className="stock-bar-container">
        <div className="stock-bar-fill" style={{ width: `${percentage}%`, backgroundColor: barColor }} />
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">CTU</div>
          <h2>VendingPro</h2>
        </div>
        <nav className="sidebar-nav">
          <SidebarItem id="dashboard" label="Dashboard" icon={icons.dashboard} />
          <SidebarItem id="inventory" label="Inventory Management" icon={icons.inventory} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <h1>{activeTab === 'dashboard' ? 'System Overview' : 'Inventory Management'}</h1>
          <div className="system-badge">
            <span className="dot"></span> Online
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          /* DASHBOARD VIEW */
          <div className="view-container animate-fade">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">{icons.peso}</div>
                <div>
                  <p className="stat-label">Total Revenue</p>
                  <h3 className="stat-number">₱{stats.revenue}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper green">{icons.package}</div>
                <div>
                  <p className="stat-label">Total Dispensed</p>
                  <h3 className="stat-number">{stats.totalDispenses} <span className="unit">pcs</span></h3>
                </div>
              </div>
            </div>

            <div className="section-header">
              <h2>Quick Status</h2>
            </div>
            <div className="inventory-grid">
              {Object.entries(inventory).map(([id, item]) => (
                <div key={id} className="status-card">
                  <div className="card-top">
                    <div className="product-icon">{item.name.toLowerCase().includes('wipe') ? icons.wipes : icons.napkin}</div>
                    <div className={`badge ${item.stock <= LOW_STOCK_THRESHOLD ? 'warn' : 'ok'}`}>
                      {item.stock <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'Good'}
                    </div>
                  </div>
                  <h3>{item.name}</h3>
                  <div className="stock-detail">
                    <span>{item.stock} units left</span>
                    <span className="price-tag">₱{item.price}</span>
                  </div>
                  <StockBar stock={item.stock} capacity={item.capacity} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* INVENTORY VIEW */
          <div className="view-container animate-fade">
            <div className="inventory-table-container">
              <div className="table-header">
                <h2>Product Stock Levels</h2>
                <p>Monitor and refill machine slots</p>
              </div>
              <div className="inventory-list">
                {Object.entries(inventory).map(([id, item]) => (
                  <div key={id} className="inventory-row">
                    <div className="row-info">
                      <div className="product-avatar">
                        {item.name.toLowerCase().includes('wipe') ? icons.wipes : icons.napkin}
                      </div>
                      <div>
                        <h4>{item.name}</h4>
                        <p>Capacity: {item.capacity} units</p>
                      </div>
                    </div>
                    <div className="row-stock">
                      <div className="stock-text">
                        <span className={item.stock <= LOW_STOCK_THRESHOLD ? 'text-danger' : ''}>
                          {item.stock} / {item.capacity}
                        </span>
                      </div>
                      <StockBar stock={item.stock} capacity={item.capacity} />
                    </div>
                    <div className="row-action">
                      <button 
                        className={`action-btn ${restockStatus[id] ? 'success' : ''}`}
                        onClick={() => handleRestock(id, item.capacity)}
                        disabled={item.stock === item.capacity}
                      >
                        {restockStatus[id] ? 'Done!' : 'Refill Slot'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
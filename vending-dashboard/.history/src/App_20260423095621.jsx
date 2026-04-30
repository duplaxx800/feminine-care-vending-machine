import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from "firebase/database";
import { database } from './firebase';
import { Package, AlertCircle, CheckCircle2, PhilippinePeso } from 'lucide-react';

export default function App() {
  const [inventory, setInventory] = useState({});
  const [stats, setStats] = useState({ revenue: 0, totalDispenses: 0 });

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

  const handleRestock = (slotId, maxCap) => {
    update(ref(database, `vendingMachine/inventory/${slotId}`), { stock: maxCap });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ color: '#1f2937' }}>CTU Feminine Care Vending Monitor</h1>
          <div style={{ color: '#059669', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={20} /> System Online
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#6b7280', margin: 0 }}>Total Revenue</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <PhilippinePeso /> {stats.revenue}
            </div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#6b7280', margin: 0 }}>Total Dispenses</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package /> {stats.totalDispenses}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {Object.entries(inventory).map(([id, item]) => (
            <div key={id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: item.stock <= 3 ? '2px solid #ef4444' : 'none' }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>{item.name}</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>₱{item.price}</span>
                <span style={{ color: item.stock <= 3 ? '#ef4444' : '#6b7280' }}>Stock: {item.stock}/{item.capacity}</span>
              </div>
              <progress value={item.stock} max={item.capacity} style={{ width: '100%', height: '8px' }}></progress>
              <button 
                onClick={() => handleRestock(id, item.capacity)}
                style={{ width: '100%', marginTop: '15px', padding: '10px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
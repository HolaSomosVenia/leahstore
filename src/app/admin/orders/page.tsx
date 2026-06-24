'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Order {
  id: string;
  user: { name: string; email: string };
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  items: any[];
  createdAt: string;
}

const NAV = [
  { href: '/admin/dashboard',  label: '📊 Dashboard' },
  { href: '/admin/products',   label: '👗 Productos' },
  { href: '/admin/inventario', label: '📦 Inventario' },
  { href: '/admin/orders',     label: '🛍️ Órdenes', active: true },
  { href: '/admin/users',      label: '👤 Usuarios' },
  { href: '/admin/config',     label: '⚙️ Configuración' },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PAID:       { bg: '#e8f5e9', color: '#2e7d32' },
  PENDING:    { bg: '#fffde7', color: '#f57f17' },
  PROCESSING: { bg: '#e3f2fd', color: '#1565c0' },
  SHIPPED:    { bg: '#f3e5f5', color: '#6a1b9a' },
  DELIVERED:  { bg: '#e0f2f1', color: '#00695c' },
  CANCELLED:  { bg: '#ffebee', color: '#c62828' },
};

export default function AdminOrders() {
  const router = useRouter();
  const checkAuth = useAuth(s => s.checkAuth);
  const user = useAuth(s => s.user);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { checkAuth().finally(() => setAuthReady(true)); }, [checkAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    api.get('/admin/orders').then(r => setOrders(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [authReady, user]);

  const updateStatus = async () => {
    if (!selected || !newStatus) return;
    try {
      const r = await api.put(`/admin/orders/${selected.id}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === selected.id ? r.data : o));
      setSelected(r.data);
      setNewStatus('');
    } catch { alert('Error actualizando estado'); }
  };

  const confirmPayment = async (orderId: string) => {
    try {
      const r = await api.put(`/admin/orders/${orderId}/confirm-payment`);
      setOrders(prev => prev.map(o => o.id === orderId ? r.data.order : o));
      if (selected?.id === orderId) setSelected(r.data.order);
    } catch { alert('Error confirmando pago'); }
  };

  if (!authReady || !user || user.role !== 'ADMIN') return null;

  const sc = (s: string) => STATUS_COLORS[s] || { bg: '#f5f5f5', color: '#555' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#000', color: '#fff', padding: '32px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid #222' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>LEAH</p>
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ padding: '20px 0', flex: 1 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'block', padding: '12px 24px', color: item.active ? '#fff' : '#aaa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, background: item.active ? '#1a1a1a' : 'transparent' }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #222' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Volver a tienda</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Órdenes</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{orders.length} órdenes en total</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Cargando órdenes...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px', alignItems: 'start' }}>
            {/* Lista */}
            <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                    {['ID', 'Cliente', 'Total', 'Estado', 'Fecha', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} onClick={() => { setSelected(order); setNewStatus(order.status); }}
                      style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selected?.id === order.id ? '#fdf0f4' : '#fff' }}>
                      <td style={{ padding: '13px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#888' }}>#{order.id.slice(0, 8)}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>{order.user?.name || '—'}</p>
                        <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{order.user?.email}</p>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: 700 }}>€{Number(order.total).toFixed(2)}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '10px', ...sc(order.status) }}>{order.status}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '12px', color: '#aaa' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '12px', color: '#d4829a', fontWeight: 700 }}>Ver →</span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#bbb' }}>Sin órdenes aún</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Detalle */}
            {selected && (
              <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '24px', position: 'sticky', top: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Detalle</h2>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#aaa' }}>×</button>
                </div>

                {[
                  { label: 'Orden', value: <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{selected.id.slice(0, 16)}</span> },
                  { label: 'Cliente', value: selected.user?.name },
                  { label: 'Email', value: selected.user?.email },
                  { label: 'Dirección', value: selected.shippingAddress || '—' },
                  { label: 'Pago', value: selected.paymentMethod },
                  { label: 'Total', value: <span style={{ fontSize: '20px', fontWeight: 700 }}>€{Number(selected.total).toFixed(2)}</span> },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#aaa', margin: '0 0 2px' }}>{row.label}</p>
                    <div style={{ fontSize: '13px', color: '#333' }}>{row.value}</div>
                  </div>
                ))}

                {selected.items?.length > 0 && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', marginTop: '14px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#aaa', margin: '0 0 10px' }}>Artículos</p>
                    {selected.items.map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span>{item.product?.name} ×{item.quantity}</span>
                        <span style={{ fontWeight: 600 }}>€{Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', marginTop: '14px' }}>
                  {selected.status === 'PENDING' && (
                    <button onClick={() => confirmPayment(selected.id)}
                      style={{ width: '100%', padding: '11px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px' }}>
                      ✓ Confirmar Pago
                    </button>
                  )}
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', marginBottom: '8px' }}>
                    {['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button onClick={updateStatus} style={{ width: '100%', padding: '11px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                    Actualizar estado
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

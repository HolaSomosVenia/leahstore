'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  _count?: { orders: number };
  createdAt: string;
}

const NAV = [
  { href: '/admin/dashboard',  label: '📊 Dashboard' },
  { href: '/admin/products',   label: '👗 Productos' },
  { href: '/admin/inventario', label: '📦 Inventario' },
  { href: '/admin/orders',     label: '🛍️ Órdenes' },
  { href: '/admin/users',      label: '👤 Usuarios', active: true },
  { href: '/admin/config',     label: '⚙️ Configuración' },
];

export default function AdminUsers() {
  const router = useRouter();
  const checkAuth = useAuth(s => s.checkAuth);
  const user = useAuth(s => s.user);
  const [authReady, setAuthReady] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth().finally(() => setAuthReady(true)); }, [checkAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    api.get('/admin/users').then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [authReady, user]);

  const changeRole = async (userId: string, role: string) => {
    try {
      const r = await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? r.data : u));
    } catch { alert('Error actualizando rol'); }
  };

  if (!authReady || !user || user.role !== 'ADMIN') return null;

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Usuarios</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{users.length} usuarios registrados</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>Cargando usuarios...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                  {['Nombre', 'Email', 'Teléfono', 'Órdenes', 'Rol', 'Cambiar rol'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#555' }}>{u.email}</td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#888' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 700 }}>{u._count?.orders ?? 0}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '10px', background: u.role === 'ADMIN' ? '#ffebee' : '#e3f2fd', color: u.role === 'ADMIN' ? '#c62828' : '#1565c0' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        style={{ padding: '6px 10px', border: '1.5px solid #e5e5e5', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' }}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#bbb' }}>Sin usuarios registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

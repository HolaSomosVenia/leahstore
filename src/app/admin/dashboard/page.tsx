'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const checkAuth = useAuth((state) => state.checkAuth);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setAuthReady(true));
  }, [checkAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }

    setStatsLoading(true);
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => setStats({
        totalOrders: 0, totalRevenue: 0,
        totalProducts: 8, totalUsers: 1, recentOrders: [],
      }))
      .finally(() => setStatsLoading(false));
  }, [authReady, user, router]);

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8' }}>
        <p style={{ color: '#888', fontSize: '14px', letterSpacing: '1px' }}>Verificando acceso...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex' }}>
      <AdminSidebar active="/admin/dashboard" />

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Bienvenido, {user.name} &nbsp;·&nbsp;
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#999' }}>{user.email}</span>
          </p>
        </div>

        {statsLoading ? (
          <p style={{ color: '#888' }}>Cargando estadísticas...</p>
        ) : (
          <>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { label: 'Órdenes totales', value: stats?.totalOrders ?? 0 },
                { label: 'Ingresos (€)', value: `€${((stats?.totalRevenue ?? 0) / 1.08).toFixed(2)}` },
                { label: 'Productos', value: stats?.totalProducts ?? 0 },
                { label: 'Usuarios', value: stats?.totalUsers ?? 0 },
              ].map((card) => (
                <div key={card.label} style={{
                  background: '#fff', borderRadius: '8px', padding: '24px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  <p style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Órdenes recientes */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Órdenes Recientes</h2>
                <Link href="/admin/orders" style={{ fontSize: '12px', color: '#000', textDecoration: 'none', borderBottom: '1px solid #000', paddingBottom: '1px' }}>
                  Ver todas
                </Link>
              </div>
              {!stats?.recentOrders?.length ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc' }}>
                  <p style={{ fontSize: '14px' }}>Sin órdenes todavía</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>Las órdenes aparecerán aquí cuando los clientes compren</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['ID', 'Cliente', 'Total', 'Estado', ''].map((h) => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '8px 12px',
                          fontSize: '11px', color: '#888', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          borderBottom: '2px solid #f0f0f0',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td style={{ padding: '14px 12px', fontSize: '13px', fontFamily: 'monospace', color: '#888' }}>
                          #{order.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '13px' }}>
                          {order.user?.name || 'Cliente'}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 600 }}>
                          €{(Number(order.total) / 1.08).toFixed(2)}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 600,
                            background: order.status === 'PAID' ? '#dcfce7' : order.status === 'PENDING' ? '#fef9c3' : '#dbeafe',
                            color: order.status === 'PAID' ? '#166534' : order.status === 'PENDING' ? '#854d0e' : '#1d4ed8',
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <Link href="/admin/orders" style={{ fontSize: '12px', color: '#000', fontWeight: 600, textDecoration: 'none' }}>
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
              {[
                { href: '/admin/products', title: 'Productos', desc: 'Agregar, editar o eliminar del catálogo' },
                { href: '/admin/inventario', title: 'Inventario', desc: 'Stock, SKUs, ventas en local y movimientos' },
                { href: '/admin/orders', title: 'Órdenes', desc: 'Confirmar pagos y actualizar estados' },
                { href: '/admin/users', title: 'Usuarios', desc: 'Gestionar roles y actividad de clientes' },
              ].map((action) => (
                <Link key={action.href} href={action.href} style={{
                  background: '#fff', borderRadius: '8px', padding: '20px',
                  textDecoration: 'none', color: '#000',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: '1px solid transparent',
                  display: 'block',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 6px' }}>{action.title}</p>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{action.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

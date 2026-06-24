'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

export default function AccountPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const token = useAuth((state) => state.token);
  const logout = useAuth((state) => state.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // Verificar que el usuario esté autenticado
    if (!user && !token) {
      router.push('/login');
      return;
    }

    // Cargar órdenes del usuario
    const fetchOrders = async () => {
      try {
        if (user) {
          const response = await api.get(`/orders/user/${user.id}`);
          setOrders(response.data);
        }
      } catch (err) {
        console.error('Error cargando órdenes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/auth/me', formData);
      setEditMode(false);
      alert('Perfil actualizado');
    } catch (err) {
      alert('Error actualizando perfil');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="mb-4">Debes iniciar sesión para ver esta página</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
            Ir a login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-6">Mi Cuenta</h2>
              <nav className="space-y-2">
                <a
                  href="#profile"
                  className="block px-4 py-2 rounded hover:bg-gray-200 font-semibold"
                >
                  Perfil
                </a>
                <a
                  href="#orders"
                  className="block px-4 py-2 rounded hover:bg-gray-200"
                >
                  Mis Órdenes
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded hover:bg-red-100 text-red-600"
                >
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {/* Sección Perfil */}
            <div id="profile" className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nombre</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                    {user.phone && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="text-lg font-semibold">{user.phone}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                      Editar Perfil
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sección Órdenes */}
            <div id="orders">
              <h2 className="text-2xl font-bold mb-6">Mis Órdenes</h2>
              {loading ? (
                <p>Cargando órdenes...</p>
              ) : orders.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">No tienes órdenes aún</p>
                  <Link href="/products" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Ir a comprar
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Número de Orden</p>
                          <p className="font-semibold">{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="text-xl font-bold">${(Number(order.total) + 3).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>
                          {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <span>
                          {order.status === 'PAID'
                            ? '✓ Pagado'
                            : order.status === 'PENDING'
                              ? '⏳ Pendiente'
                              : order.status}
                        </span>
                        <span>{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

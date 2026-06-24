'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/admin/dashboard',   label: '📊 Dashboard' },
  { href: '/admin/products',    label: '👗 Productos' },
  { href: '/admin/inventario',  label: '📦 Inventario' },
  { href: '/admin/orders',      label: '🛍️ Órdenes' },
  { href: '/admin/users',       label: '👤 Usuarios' },
  { href: '/admin/config',      label: '⚙️ Configuración' },
];

export function AdminSidebar({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [active]);

  return (
    <>
      <style>{`
        .admin-sb {
          width: 220px; background: #000; color: #fff;
          padding: 32px 0; flex-shrink: 0;
          display: flex; flex-direction: column;
        }
        .admin-sb-hamburger {
          display: none;
          position: fixed; top: 14px; left: 14px; z-index: 400;
          background: #fff; border: 1.5px solid #e5e5e5;
          border-radius: 8px; padding: 8px 12px;
          font-size: 18px; cursor: pointer; line-height: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        @media (max-width: 1023px) {
          .admin-sb {
            position: fixed !important;
            top: 0; left: 0; height: 100vh; z-index: 399;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            overflow-y: auto;
          }
          .admin-sb.open { transform: translateX(0) !important; }
          .admin-sb-hamburger { display: flex !important; align-items: center; }
          /* Push main content below the floating hamburger */
          .admin-sb ~ main { padding-top: 68px !important; }
        }
      `}</style>

      {/* Hamburger — only visible on tablet/mobile */}
      <button
        className="admin-sb-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Backdrop */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 398 }}
        />
      )}

      <aside className={`admin-sb${open ? ' open' : ''}`}>
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>LEAH</p>
            <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Admin Panel</p>
          </div>
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>

        <nav style={{ padding: '16px 0', flex: 1 }}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '13px 24px',
                color: item.href === active ? '#fff' : '#aaa',
                textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                background: item.href === active ? '#1a1a1a' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #222' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>
            ← Volver a tienda
          </Link>
        </div>
      </aside>
    </>
  );
}

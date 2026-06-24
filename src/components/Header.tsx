'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useCurrency, type Currency } from '@/lib/currency';

const navItems = [
  { label: 'Tienda', href: '/products', sub: ['Accesorios', 'Blazer y Sacos', 'Blusas', 'Calzado', 'Lentes', 'Pantalones y Jeans', 'Shorts', 'Suéters', 'Vestidos'] },
  { label: '⭐ Membresía', href: '/membresia' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contáctenos', href: '/contacto' },
  { label: 'Galería Leah', href: '/galeria' },
];

const marqueeText = '✦ LEAH DELIVERY DESDE $3 ✦ ENVÍOS NACIONALES POR MRW Y ZOOM ✦ DESCUENTO CON LA MEMBRESÍA LEAH ✦ ATENTAS A NUESTRAS PIEZAS ESTRELLAS ✦ ';

export function Header() {
  const router = useRouter();
  const itemCount = useCart((state) => state.getItemCount());
  const user = useAuth((state) => state.user);
  const checkAuth = useAuth((state) => state.checkAuth);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { currency, setCurrency, eurToBs, rateUpdatedAt } = useCurrency();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Cerrar drawer al navegar
  useEffect(() => { setMobileOpen(false); }, []);

  // Bloquear scroll cuando drawer abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { display: inline-block; animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .nav-link:hover { opacity: 0.72 !important; }
        .search-input:focus { outline: none; border-color: #fff !important; }
        .icon-btn:hover { opacity: 0.65; }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .mobile-drawer { animation: slideIn 0.28s ease; }

        /* ── RESPONSIVE ── */
        .header-row {
          display: grid;
          grid-template-columns: 220px 1fr 220px;
          align-items: center;
          gap: 24px;
          max-width: 1360px;
          margin: 0 auto;
        }
        .desktop-nav { display: flex; }
        .mobile-hamburger { display: none; }
        .header-search { display: block; }

        @media (max-width: 768px) {
          .header-row {
            grid-template-columns: 1fr auto;
            gap: 12px;
          }
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .header-search { display: none !important; }
          .header-currency { display: none !important; }
        }
      `}</style>

      {/* ── 1. Marquee ── */}
      <div style={{ background: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', padding: '8px 0', borderTop: '2px solid #c0687e', borderBottom: '2px solid #c0687e' }}>
        <div className="marquee-track" style={{ fontSize: '11px', letterSpacing: '2.5px', fontWeight: 900, color: '#c0687e' }}>
          {marqueeText}{marqueeText}
        </div>
      </div>

      {/* ── 2. Header principal ── */}
      <div style={{ background: '#d4829a', padding: '12px 20px' }}>
        <div className="header-row">

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            <img src="/logo-leah.png" alt="Leah" style={{ height: '180px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Buscador — solo desktop */}
          <form className="header-search" onSubmit={handleSearch} style={{ width: '100%' }}>
            <div style={{ position: 'relative' }}>
              <input className="search-input" type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                style={{ width: '100%', padding: '10px 44px 10px 16px', fontSize: '13px', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '24px', color: '#333', background: 'rgba(255,255,255,0.92)', boxSizing: 'border-box' }}
              />
              <button type="submit" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </div>
          </form>

          {/* Iconos derecha */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>

            {/* Hamburguesa — solo móvil */}
            <button className="mobile-hamburger" onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px', display: 'none', alignItems: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Switcher €/Bs. */}
            <div className="header-currency" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {(['EUR', 'VES'] as Currency[]).map(c => (
                  <button key={c} onClick={() => setCurrency(c)} style={{
                    padding: '4px 9px', fontSize: '12px', fontWeight: currency === c ? 700 : 400,
                    background: currency === c ? 'rgba(255,255,255,0.3)' : 'transparent',
                    color: '#fff', border: `1px solid ${currency === c ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                    borderRadius: '2px', cursor: 'pointer', lineHeight: 1,
                  }}>
                    {c === 'EUR' ? '€' : 'Bs.'}
                  </button>
                ))}
              </div>
              {/* Tasa BCV en tiempo real */}
              {eurToBs > 0 && (
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                  BCV: 1€ = {eurToBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.
                </span>
              )}
            </div>

            {/* Cuenta */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', background: '#000', color: '#fff', padding: '5px 10px', textDecoration: 'none', borderRadius: '2px' }}>
                    Admin
                  </Link>
                )}
                <Link href="/account" className="icon-btn" style={{ color: '#fff', textDecoration: 'none' }} title={user.name}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
              </div>
            ) : (
              <Link href="/login" className="icon-btn" style={{ color: '#fff', textDecoration: 'none' }} title="Mi cuenta">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}

            {/* Carrito */}
            <Link href="/cart" className="icon-btn" style={{ position: 'relative', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: '-7px', right: '-9px', background: '#fff', color: '#d4829a', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Nav desktop ── */}
      <nav className="desktop-nav" style={{ background: '#c0687e', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: '40px' }}>
          {navItems.map(item => (
            <div key={item.label} style={{ position: 'relative' }}
              onMouseEnter={() => item.sub && setOpenMenu(item.label)}
              onMouseLeave={() => setOpenMenu(null)}>
              <Link href={item.href} className="nav-link" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#fff', textDecoration: 'none', padding: '14px 0', display: 'block', transition: 'opacity 0.2s' }}>
                {item.label}
              </Link>
              {item.sub && openMenu === item.label && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #ebebeb', minWidth: '210px', boxShadow: '0 12px 40px rgba(0,0,0,0.09)', zIndex: 200 }}>
                  {item.sub.map(sub => (
                    <Link key={sub} href={`/products?category=${encodeURIComponent(sub)}`}
                      style={{ display: 'block', padding: '11px 20px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#444', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#d4829a'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#444'; }}>
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* ── 4. Drawer móvil ── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} />

          {/* Drawer */}
          <div className="mobile-drawer" style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '80vw', maxWidth: '320px',
            background: '#fff', zIndex: 999, display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}>
            {/* Cabecera drawer */}
            <div style={{ background: '#d4829a', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src="/logo-leah.png" alt="Leah" style={{ height: '60px', objectFit: 'contain' }} />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '28px', lineHeight: 1 }}>×</button>
            </div>

            {/* Buscador móvil */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <form onSubmit={handleSearch}>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    style={{ width: '100%', padding: '10px 40px 10px 14px', fontSize: '13px', border: '1.5px solid #e0e0e0', borderRadius: '24px', boxSizing: 'border-box' }}
                  />
                  <button type="submit" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '8px 0', flex: 1 }}>
              {navItems.map(item => (
                <div key={item.label}>
                  <Link href={item.href} onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '14px 20px', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#1a1a1a', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}>
                    {item.label}
                  </Link>
                  {item.sub && (
                    <div style={{ background: '#fafafa' }}>
                      {item.sub.map(sub => (
                        <Link key={sub} href={`/products?category=${encodeURIComponent(sub)}`} onClick={() => setMobileOpen(false)}
                          style={{ display: 'block', padding: '10px 20px 10px 36px', fontSize: '12px', letterSpacing: '0.5px', color: '#666', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' }}>
                          {sub}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Moneda en drawer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
              {(['EUR', 'VES'] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{
                  flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700,
                  background: currency === c ? '#d4829a' : '#f5f5f5',
                  color: currency === c ? '#fff' : '#555',
                  border: 'none', cursor: 'pointer', borderRadius: '4px',
                }}>
                  {c === 'EUR' ? '€ EUR' : 'Bs. VES'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

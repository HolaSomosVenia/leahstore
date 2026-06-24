'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroCarousel, type Slide } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: string[];
  category?: { name: string; id: string; slug?: string };
}

const CATS = [
  { slug: 'vestidos',   name: 'Vestidos',   href: '/products?category=vestidos',   span: 'wide' },
  { slug: 'blusas',     name: 'Blusas',     href: '/products?category=blusas',     span: 'tall' },
  { slug: 'pantalones', name: 'Pantalones', href: '/products?category=pantalones', span: 'tall' },
  { slug: 'accesorios', name: 'Accesorios', href: '/products?category=accesorios', span: 'wide' },
] as const;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Collection { id: string; name: string; image: string; description: string; }

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([
    { image: '', title: 'Bienvenida a Leah', subtitle: 'Nueva Colección', buttonText: 'Ver Colección' },
  ]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    api.get('/products?limit=20').then(r => {
      const data = r.data?.data || r.data || [];
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => {});

    fetch(`${API_BASE}/api/config`)
      .then(r => r.json())
      .then(cfg => {
        if (cfg?.carousel?.length) setSlides(cfg.carousel);
        else if (cfg?.banner) setSlides([cfg.banner]);
        if (cfg?.collections?.length) setCollections(cfg.collections);
      })
      .catch(() => {});
  }, []);

  // Agrupar productos por slug de categoría
  const byCategory = (slug: string) =>
    products.filter(p =>
      p.category?.slug === slug ||
      p.category?.name?.toLowerCase() === slug.toLowerCase()
    );

  return (
    <main style={{ minHeight: '100vh', background: '#fff', color: '#000' }}>
      <style>{`
        .cat-card { overflow: hidden; position: relative; cursor: pointer; background: #f0ece8; }
        .cat-card img { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94); }
        .cat-card:hover img { transform: scale(1.07); }
        .cat-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.4s ease; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 28px; }
        .cat-card:hover .cat-overlay { background: rgba(0,0,0,0.22); }
        .cat-label { color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; opacity: 0; transform: translateY(10px); transition: all 0.3s ease 0.05s; text-shadow: 0 2px 8px rgba(0,0,0,0.4); }
        .cat-card:hover .cat-label { opacity: 1; transform: translateY(0); }
        .cat-name-static { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 16px 16px; background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%); color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; }
        .mini-img { position: absolute; border: 2.5px solid #fff; border-radius: 3px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.18); transition: transform 0.3s ease; }
        .cat-card:hover .mini-img { transform: scale(1.03) rotate(-1deg); }
        .cat-card:hover .mini-img:nth-child(2) { transform: scale(1.03) rotate(1.5deg); }
        .cat-card:hover .mini-img:nth-child(3) { transform: scale(1.04) rotate(-0.5deg); }

        /* Collage responsivo */
        .cat-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 320px 320px;
          gap: 12px;
        }
        .new-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 28px 20px; }

        /* Colecciones scroll */
        .collections-strip { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
        .collections-strip::-webkit-scrollbar { height: 3px; }
        .collections-strip::-webkit-scrollbar-track { background: #f0f0f0; }
        .collections-strip::-webkit-scrollbar-thumb { background: #d4829a; border-radius: 2px; }
        .col-card { flex-shrink: 0; width: 260px; scroll-snap-align: start; position: relative; border-radius: 6px; overflow: hidden; cursor: pointer; text-decoration: none; display: block; }
        .col-card-img { height: 340px; background: #f0ece8; position: relative; overflow: hidden; }
        .col-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .col-card:hover .col-card-img img { transform: scale(1.06); }
        .col-card-info { padding: 14px 4px 4px; }
        @media (max-width: 768px) {
          .col-card { width: 200px; }
          .col-card-img { height: 260px; }
        }

        @media (max-width: 768px) {
          .cat-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 180px 180px 180px !important;
          }
          .cat-span-tall { grid-row: span 1 !important; }
          .cat-span-wide { grid-column: span 2 !important; grid-row: span 1 !important; }
          .new-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .section-pad { padding: 32px 16px !important; }
          .section-title { font-size: 16px !important; }
          .promo-grid { padding: 32px 16px !important; }
        }
      `}</style>

      <Header />

      {/* ── Hero Carrusel ── */}
      <HeroCarousel slides={slides} />

      {/* ── Collage por Categorías ── */}
      <section className="section-pad" style={{ padding: '64px 32px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px', fontWeight: 600 }}>Explorar</p>
          <h2 className="section-title" style={{ fontSize: '1.7rem', fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>Nuestras Categorías</h2>
        </div>

        <div className="cat-grid">

          {/* Vestidos — grande izquierda (2 rows) */}
          {(() => {
            const cat = CATS[0];
            const imgs = byCategory(cat.slug);
            const main = imgs[0]?.images?.[0];
            const sub1 = imgs[1]?.images?.[0];
            const sub2 = imgs[2]?.images?.[0];
            return (
              <Link href={cat.href} className="cat-card" style={{ gridRow: '1 / 3', borderRadius: '6px', textDecoration: 'none', display: 'block' }}>
                {main ? (
                  <img src={main} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5e8e8 0%, #e8d5d5 100%)' }} />
                )}
                {/* Mini imágenes superpuestas en esquina */}
                {sub1 && (
                  <div className="mini-img" style={{ width: '90px', height: '120px', bottom: '60px', right: '16px' }}>
                    <img src={sub1} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {sub2 && (
                  <div className="mini-img" style={{ width: '70px', height: '95px', bottom: '24px', right: '24px' }}>
                    <img src={sub2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="cat-overlay">
                  <span className="cat-label">{cat.name}</span>
                </div>
                <div className="cat-name-static">{cat.name}</div>
              </Link>
            );
          })()}

          {/* Blusas — arriba centro */}
          {(() => {
            const cat = CATS[1];
            const imgs = byCategory(cat.slug);
            const main = imgs[0]?.images?.[0];
            const sub1 = imgs[1]?.images?.[0];
            return (
              <Link href={cat.href} className="cat-card" style={{ borderRadius: '6px', textDecoration: 'none', display: 'block' }}>
                {main ? (
                  <img src={main} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)' }} />
                )}
                {sub1 && (
                  <div className="mini-img" style={{ width: '60px', height: '80px', bottom: '50px', right: '10px' }}>
                    <img src={sub1} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="cat-overlay"><span className="cat-label">{cat.name}</span></div>
                <div className="cat-name-static">{cat.name}</div>
              </Link>
            );
          })()}

          {/* Accesorios — arriba derecha */}
          {(() => {
            const cat = CATS[3];
            const imgs = byCategory(cat.slug);
            const main = imgs[0]?.images?.[0];
            return (
              <Link href={cat.href} className="cat-card" style={{ borderRadius: '6px', textDecoration: 'none', display: 'block' }}>
                {main ? (
                  <img src={main} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8f0e8 0%, #e8d8c8 100%)' }} />
                )}
                <div className="cat-overlay"><span className="cat-label">{cat.name}</span></div>
                <div className="cat-name-static">{cat.name}</div>
              </Link>
            );
          })()}

          {/* Pantalones — abajo centro+derecha (2 cols) */}
          {(() => {
            const cat = CATS[2];
            const imgs = byCategory(cat.slug);
            const main = imgs[0]?.images?.[0];
            const sub1 = imgs[1]?.images?.[0];
            const sub2 = imgs[2]?.images?.[0];
            return (
              <Link href={cat.href} className="cat-card" style={{ gridColumn: '2 / 4', borderRadius: '6px', textDecoration: 'none', display: 'block' }}>
                {main ? (
                  <img src={main} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e8e8f0 0%, #d5d5e8 100%)' }} />
                )}
                {sub1 && (
                  <div className="mini-img" style={{ width: '80px', height: '110px', bottom: '20px', right: '90px' }}>
                    <img src={sub1} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {sub2 && (
                  <div className="mini-img" style={{ width: '65px', height: '90px', bottom: '40px', right: '16px' }}>
                    <img src={sub2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="cat-overlay"><span className="cat-label">{cat.name}</span></div>
                <div className="cat-name-static">{cat.name}</div>
              </Link>
            );
          })()}
        </div>
      </section>

      {/* ── COLECCIONES ── */}
      {collections.length > 0 && (
        <section style={{ borderTop: '1px solid #ebebeb', padding: '56px 0 64px' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px' }}>
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', marginBottom: '6px', fontWeight: 700, margin: '0 0 6px' }}>Descubre</p>
                <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Nuestras Colecciones</h2>
              </div>
              <Link href="/products" style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>Ver todo</Link>
            </div>

            <div className="collections-strip">
              {collections.map(col => (
                <Link key={col.id} href={`/products?collection=${encodeURIComponent(col.name)}`} className="col-card">
                  <div className="col-card-img">
                    {col.image ? (
                      <img src={col.image} alt={col.name} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f5e8ee 0%, #ead5de 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#c0687e', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>Sin imagen</span>
                      </div>
                    )}
                    {/* Overlay con nombre */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)', display: 'flex', alignItems: 'flex-end', padding: '20px 16px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{col.name}</p>
                        {col.description && <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>{col.description}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LO MÁS NUEVO ── */}
      <section className="section-pad" style={{ padding: '0 32px 64px', maxWidth: '1360px', margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '56px', marginBottom: '36px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="section-title" style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>Lo Más Nuevo</h2>
          <Link href="/products?sort=newest" style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>Ver todo</Link>
        </div>
        {products.length > 0 ? (
          <div className="new-grid">
            {products.slice(0, 12).map(p => <ProductCard key={p.id} product={p} showNew />)}
          </div>
        ) : (
          <div className="new-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div style={{ paddingBottom: '133%', background: '#f0f0f0', marginBottom: '12px' }} />
                <div style={{ height: '13px', background: '#f0f0f0', marginBottom: '8px', width: '75%' }} />
                <div style={{ height: '13px', background: '#f0f0f0', width: '40%' }} />
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/products" style={{ display: 'inline-block', border: '1.5px solid #1a1a1a', padding: '13px 40px', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', color: '#1a1a1a' }}>
            Ver Todo lo Disponible
          </Link>
        </div>
      </section>

      {/* ── PROMOCIONES ── */}
      {products.some(p => p.comparePrice && Number(p.comparePrice) > Number(p.price)) && (
        <section style={{ padding: '56px 32px 64px', background: '#faf8f6', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>Promociones</h2>
              <Link href="/products" style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}>Ver todas</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px 20px' }}>
              {products.filter(p => p.comparePrice && Number(p.comparePrice) > Number(p.price)).slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} showOffer />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Membresía Leah ── */}
      <section style={{ background: 'linear-gradient(135deg, #1a0a0d 0%, #2d1018 50%, #1a0a0d 100%)', padding: '80px 32px', position: 'relative', overflow: 'hidden' }}>
        {/* Decoración fondo */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(212,130,154,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(212,130,154,0.06)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-block', border: '1px solid rgba(212,130,154,0.5)', padding: '6px 20px', marginBottom: '28px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700 }}>Exclusivo para Miembras</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 8px', lineHeight: 1 }}>
            Membresía
          </h2>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, color: '#d4829a', letterSpacing: '8px', textTransform: 'uppercase', margin: '0 0 32px', lineHeight: 1 }}>
            LEAH
          </h2>

          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '48px', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 48px' }}>
            Únete a nuestra comunidad exclusiva y disfruta de beneficios únicos diseñados para las mujeres que aman la moda.
          </p>

          {/* Beneficios */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '48px', textAlign: 'left' }}>
            {[
              { icon: '✦', label: 'Descuento en divisas', desc: 'Al pagar con Zelle o Binance' },
              { icon: '✦', label: 'Acceso anticipado', desc: 'Ve las nuevas colecciones primero' },
              { icon: '✦', label: 'Delivery gratis', desc: 'Envío local sin costo (hasta 3km)' },
              { icon: '✦', label: 'Beneficios exclusivos', desc: 'Solo para miembras Leah' },
            ].map(b => (
              <div key={b.label} style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '10px', color: '#d4829a', letterSpacing: '2px' }}>{b.icon}</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '10px 0 6px', letterSpacing: '0.5px' }}>{b.label}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ display: 'inline-block', background: '#d4829a', color: '#fff', padding: '15px 44px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700, borderRadius: '2px' }}>
              Unirme Ahora
            </Link>
            <a href="https://wa.me/584120759209?text=Hola%2C%20quiero%20información%20sobre%20la%20Membresía%20Leah" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'transparent', color: 'rgba(255,255,255,0.7)', padding: '15px 44px', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px' }}>
              Más Información
            </a>
          </div>

          <p style={{ marginTop: '28px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px' }}>
            Consulta disponibilidad por WhatsApp · @leah.vzla
          </p>
        </div>
      </section>

      <Footer />

      {/* ── Botón flotante WhatsApp ── */}
      <a
        href="https://wa.me/584120759209"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 999,
          width: '58px', height: '58px', borderRadius: '50%',
          background: '#25d366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(37,211,102,0.65)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)';
        }}
        title="Contáctanos por WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  );
}

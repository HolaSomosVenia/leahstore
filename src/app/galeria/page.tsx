'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GalleryImage { name: string; url: string; size: number; }

const CATEGORIES = ['Todo', 'Vestidos', 'Blusas', 'Pantalones', 'Accesorios', 'Colecciones'];

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('Todo');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/upload`)
      .then(r => r.json())
      .then(data => { setImages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const shown = images; // todas las imágenes (sin categoría en el backend aún)

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Hero */}
      <div style={{ background: '#1a1a1a', padding: '72px 32px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 14px' }}>Lookbook</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 16px', color: '#fff' }}>Galería Leah</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.8 }}>
          Inspírate con nuestras últimas colecciones y looks de temporada.
        </p>
      </div>

      {/* Filtros por categoría */}
      <div style={{ borderBottom: '1px solid #ebebeb', padding: '0 32px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', gap: '0', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} style={{
              padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: active === cat ? '#d4829a' : '#999',
              borderBottom: active === cat ? '2px solid #d4829a' : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap', transition: 'color 0.2s',
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid de imágenes */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 32px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ paddingBottom: '120%', background: '#f0f0f0', borderRadius: '4px' }} />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5e8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4829a" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb', margin: '0 0 12px' }}>
              Galería vacía
            </h3>
            <p style={{ fontSize: '13px', color: '#ccc', margin: '0 0 24px' }}>
              Las imágenes se subirán desde el panel de administración.
            </p>
            <p style={{ fontSize: '12px', color: '#aaa' }}>
              Mientras tanto, síguenos en{' '}
              <a href="https://www.instagram.com/leah.vzla/" target="_blank" rel="noopener noreferrer" style={{ color: '#d4829a', fontWeight: 700, textDecoration: 'none' }}>@leah.vzla</a>{' '}
              para ver nuestros últimos looks.
            </p>
          </div>
        ) : (
          <>
            {/* Masonry-style grid */}
            <div style={{ columns: 'auto', columnCount: 4, columnGap: '12px' }}>
              <style>{`
                @media (max-width: 1200px) { .galeria-cols { column-count: 3 !important; } }
                @media (max-width: 768px)  { .galeria-cols { column-count: 2 !important; } }
                @media (max-width: 480px)  { .galeria-cols { column-count: 2 !important; } }
                .galeria-item { break-inside: avoid; margin-bottom: 12px; cursor: zoom-in; display: block; position: relative; overflow: hidden; border-radius: 4px; }
                .galeria-item img { width: 100%; display: block; transition: transform 0.5s ease; }
                .galeria-item:hover img { transform: scale(1.04); }
                .galeria-item-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.3s; display: flex; align-items: center; justify-content: center; }
                .galeria-item:hover .galeria-item-overlay { background: rgba(0,0,0,0.2); }
              `}</style>
              <div className="galeria-cols" style={{ columns: 4, columnGap: '12px' }}>
                {shown.map(img => {
                  const fullUrl = `${API_BASE}${img.url}`;
                  return (
                    <div key={img.name} className="galeria-item" onClick={() => setLightbox(fullUrl)}>
                      <img src={fullUrl} alt="" loading="lazy" />
                      <div className="galeria-item-overlay">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" style={{ opacity: 0, transition: 'opacity 0.3s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px', color: '#bbb', letterSpacing: '1px' }}>
              {shown.length} imagen{shown.length !== 1 ? 'es' : ''}
            </p>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '24px', right: '28px', background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', lineHeight: 1, opacity: 0.7 }}>×</button>
          <img
            src={lightbox}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px', cursor: 'default' }}
          />
        </div>
      )}

      {/* CTA redes */}
      <div style={{ background: '#faf8f6', borderTop: '1px solid #ebebeb', padding: '56px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 12px' }}>Más contenido</p>
        <h3 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 20px' }}>Síguenos en redes</h3>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://www.instagram.com/leah.vzla/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '12px 28px', background: '#000', color: '#fff', textDecoration: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', borderRadius: '2px' }}>
            Instagram @leah.vzla
          </a>
          <a href="https://www.tiktok.com/@leah.vzla" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', padding: '12px 28px', background: '#010101', color: '#fff', textDecoration: 'none', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', borderRadius: '2px' }}>
            TikTok @leah.vzla
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}

'use client';

import Link from 'next/link';

export interface Slide {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const images = slides.map(s => s.image).filter(Boolean);
  const first = slides[0];

  // Si no hay imágenes todavía, mostrar placeholder
  if (!images.length) {
    return (
      <div style={{ minHeight: '480px', background: '#f5ece9', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px' }}>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', marginBottom: '14px', fontWeight: 600 }}>
            {first?.subtitle || 'Nueva Colección'}
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', fontWeight: 300, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '28px', color: '#1a1a1a' }}>
            {first?.title || 'Bienvenida a Leah'}
          </h1>
          <Link href="/products" style={{ display: 'inline-block', border: '1.5px solid #1a1a1a', padding: '13px 38px', fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1a1a1a', textDecoration: 'none', fontWeight: 700 }}>
            {first?.buttonText || 'Ver Colección'}
          </Link>
        </div>
      </div>
    );
  }

  // Duplicamos las imágenes para el loop infinito
  const track = [...images, ...images, ...images];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#f5ece9' }}>
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${100 / 3}%); }
        }
        .hero-track {
          display: flex;
          animation: scroll-left ${Math.max(images.length * 4, 18)}s linear infinite;
          will-change: transform;
        }
        .hero-track:hover { animation-play-state: paused; }
        .hero-img-wrap {
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .hero-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.5s ease;
        }
        .hero-img-wrap:hover img { transform: scale(1.04); }
      `}</style>

      {/* Tira de imágenes */}
      <div style={{ overflow: 'hidden' }}>
        <div className="hero-track">
          {track.map((src, i) => (
            <div
              key={i}
              className="hero-img-wrap"
              style={{
                width: images.length === 1 ? '100vw' : images.length === 2 ? '50vw' : '33.33vw',
                height: '520px',
                background: '#ede8e4',
              }}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </div>

      {/* Texto flotante encima */}
      {first?.title && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 24px 40px', pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(6px)',
            padding: '20px 40px',
            textAlign: 'center',
            pointerEvents: 'all',
          }}>
            {first.subtitle && (
              <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', margin: '0 0 8px', fontWeight: 600 }}>
                {first.subtitle}
              </p>
            )}
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1.15, margin: '0 0 18px', color: '#1a1a1a' }}>
              {first.title}
            </h1>
            <Link
              href="/products"
              style={{ display: 'inline-block', border: '1.5px solid #1a1a1a', padding: '10px 30px', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1a1a1a', textDecoration: 'none', fontWeight: 700 }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#1a1a1a'; }}
            >
              {first.buttonText || 'Ver Colección'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

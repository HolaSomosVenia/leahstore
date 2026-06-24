'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ background: '#1a1a1a', color: '#fff', marginTop: '80px' }}>

      {/* Franja rosa superior */}
      <div style={{ background: '#d4829a', padding: '14px 32px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>
          LEAH — MODA FEMENINA
        </p>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '56px 32px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '40px',
      }}>

        {/* Columna 1: Info y horarios */}
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 18px' }}>
            Información
          </h4>
          <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: '0 0 16px' }}>
            Las compras realizadas después de las 6 p.m. serán procesadas al día siguiente hábil.
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4829a" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p style={{ fontSize: '13px', color: '#aaa', margin: 0, lineHeight: 1.6 }}>
              Showroom: Av. 15 Delicias con Calle 59
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4829a" strokeWidth="1.8" style={{ flexShrink: 0 }}>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <a href="https://wa.me/584120759209" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#aaa', textDecoration: 'none' }}>
              0412-0759209
            </a>
          </div>
        </div>

        {/* Columna 2: Políticas */}
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 18px' }}>
            Políticas de Cambio
          </h4>
          <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: '0 0 12px' }}>
            Tienes <strong style={{ color: '#fff' }}>3 días</strong> desde la recepción del producto para solicitar un cambio.
          </p>
          <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.7, margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
            No aplica cambio en:
          </p>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', color: '#aaa', lineHeight: 2 }}>
            <li>Prendas en promoción o descuento</li>
            <li>Accesorios</li>
            <li>Prendas blancas</li>
            <li>Bodys</li>
          </ul>
        </div>

        {/* Columna 3: Redes sociales y envíos */}
        <div>
          <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 18px' }}>
            Síguenos
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>

            {/* Instagram */}
            <a href="https://www.instagram.com/leah.vzla/" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4829a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              @leah.vzla
            </a>

            {/* TikTok */}
            <a href="https://www.tiktok.com/@leah.vzla" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4829a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
              </svg>
              @leah.vzla
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/584120759209" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4829a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              0412-0759209
            </a>

            {/* Facebook */}
            <a href="#" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#aaa', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#d4829a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
              Leah Vzla
            </a>
          </div>

          <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 12px' }}>
            Envíos
          </h4>
          <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: 0 }}>
            Delivery desde <strong style={{ color: '#fff' }}>$3</strong><br/>
            Envíos nacionales por <strong style={{ color: '#fff' }}>MRW y Zoom</strong>
          </p>
        </div>
      </div>

      {/* Newsletter */}
      <div style={{ borderTop: '1px solid #2a2a2a', padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 16px', fontWeight: 700 }}>
          Suscríbete y recibe novedades
        </p>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: '0', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            style={{
              flex: 1, padding: '11px 16px', fontSize: '13px',
              background: '#2a2a2a', border: '1px solid #333', borderRight: 'none',
              color: '#fff', outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '11px 20px', background: '#d4829a', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: '12px',
            fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Suscribir
          </button>
        </form>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #2a2a2a', padding: '20px 32px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#555', letterSpacing: '0.5px' }}>
          © {new Date().getFullYear()} Leah Moda Femenina. Todos los derechos reservados.
        </p>
      </div>

    </footer>
  );
}

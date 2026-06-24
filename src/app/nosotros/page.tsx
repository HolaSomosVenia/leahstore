'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function NosotrosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #f9eff3 0%, #fdf5f7 100%)', padding: '80px 32px 72px', textAlign: 'center', borderBottom: '1px solid #f0e5ea' }}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 16px' }}>Nuestra Historia</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 20px', color: '#1a1a1a' }}>Nosotras</h1>
        <p style={{ fontSize: '16px', color: '#888', maxWidth: '540px', margin: '0 auto', lineHeight: 1.8 }}>
          Somos Leah, una marca venezolana de moda femenina que nació del amor por el estilo y la elegancia.
        </p>
      </div>

      {/* Historia */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '72px 32px' }}>
        <div className="nosotros-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 16px' }}>Quiénes Somos</p>
            <h2 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', margin: '0 0 20px', lineHeight: 1.3 }}>
              Moda que refleja <br /><strong style={{ fontWeight: 700 }}>tu personalidad</strong>
            </h2>
            <p style={{ color: '#666', lineHeight: 1.9, fontSize: '14px', margin: '0 0 20px' }}>
              En Leah creemos que la ropa es mucho más que tela: es expresión, es confianza, es identidad. Cada pieza de nuestra colección está cuidadosamente seleccionada para resaltar la belleza natural de la mujer venezolana.
            </p>
            <p style={{ color: '#666', lineHeight: 1.9, fontSize: '14px', margin: 0 }}>
              Nacimos con la misión de hacer accesible la moda de calidad, con piezas versátiles que van del día a la noche, del casual al elegante.
            </p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f5e8ee 0%, #ead5de 100%)', borderRadius: '8px', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '8px', color: '#d4829a', margin: 0, lineHeight: 1 }}>LEAH</p>
              <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c0687e', textTransform: 'uppercase', margin: '12px 0 0', fontWeight: 600 }}>Moda Femenina</p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ background: '#faf8f6', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb', padding: '72px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 12px' }}>Lo Que Nos Define</p>
            <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Nuestros Valores</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Calidad', text: 'Cada prenda pasa por una selección rigurosa. Materiales cuidados, costuras perfectas.' },
              { title: 'Estilo', text: 'Tendencias actuales adaptadas al gusto de la mujer latinoamericana, siempre con elegancia.' },
              { title: 'Confianza', text: 'Una compra transparente, honesta y con atención personalizada en cada pedido.' },
              { title: 'Comunidad', text: 'Somos más que una tienda — somos un espacio donde la mujer se siente valorada.' },
            ].map(v => (
              <div key={v.title} style={{ padding: '32px 24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '3px', background: '#d4829a', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>{v.title}</h3>
                <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.8, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 12px' }}>Visítanos</p>
        <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 20px' }}>Nuestro Showroom</h2>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.9, margin: '0 0 36px', maxWidth: '480px', display: 'inline-block' }}>
          Ven a conocer nuestras piezas en persona. Nuestro showroom está disponible con cita previa para brindarte una atención personalizada.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '28px 32px', border: '1px solid #ebebeb', borderRadius: '8px', textAlign: 'left', minWidth: '220px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 10px' }}>Dirección</p>
            <p style={{ fontSize: '14px', color: '#333', margin: 0, lineHeight: 1.6 }}>Av. 15 Delicias<br />con Calle 59</p>
          </div>
          <div style={{ padding: '28px 32px', border: '1px solid #ebebeb', borderRadius: '8px', textAlign: 'left', minWidth: '220px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 10px' }}>WhatsApp</p>
            <a href="https://wa.me/584120759209" style={{ fontSize: '14px', color: '#333', textDecoration: 'none' }}>0412-0759209</a>
          </div>
          <div style={{ padding: '28px 32px', border: '1px solid #ebebeb', borderRadius: '8px', textAlign: 'left', minWidth: '220px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 10px' }}>Redes Sociales</p>
            <p style={{ fontSize: '14px', color: '#333', margin: 0, lineHeight: 1.8 }}>
              <a href="https://www.instagram.com/leah.vzla/" target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none' }}>@leah.vzla</a><br />
              <span style={{ color: '#aaa', fontSize: '12px' }}>Instagram · TikTok</span>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .nosotros-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* CTA */}
      <div style={{ background: '#1a1a1a', padding: '56px 32px', textAlign: 'center' }}>
        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 20px' }}>¿Lista para explorar?</h3>
        <Link href="/products" style={{ display: 'inline-block', background: '#d4829a', color: '#fff', padding: '14px 40px', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px' }}>
          Ver Colección
        </Link>
      </div>

      <Footer />
    </div>
  );
}

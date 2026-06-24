'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hola Leah! Mi nombre es ${form.name}.\n\n${form.message}\n\nTeléfono: ${form.phone || 'No indicado'}\nEmail: ${form.email || 'No indicado'}`
    );
    window.open(`https://wa.me/584120759209?text=${text}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e5e5e5',
    fontSize: '13px', boxSizing: 'border-box', borderRadius: '4px',
    background: '#fff', outline: 'none', color: '#1a1a1a',
    fontFamily: 'inherit',
  };
  const lbl: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
    color: '#555', display: 'block', marginBottom: '8px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #f9eff3 0%, #fdf5f7 100%)', padding: '72px 32px 64px', textAlign: 'center', borderBottom: '1px solid #f0e5ea' }}>
        <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#d4829a', fontWeight: 700, margin: '0 0 14px' }}>Estamos para ti</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', margin: '0 0 16px', color: '#1a1a1a' }}>Contáctenos</h1>
        <p style={{ fontSize: '15px', color: '#888', maxWidth: '460px', margin: '0 auto', lineHeight: 1.8 }}>
          Escríbenos con cualquier pregunta sobre pedidos, tallas, disponibilidad o membresía.
        </p>
      </div>

      <div className="contacto-grid" style={{ maxWidth: '1000px', margin: '0 auto', padding: '72px 32px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '64px', alignItems: 'start' }}>

        {/* Formulario */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 32px' }}>Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={lbl}>Nombre *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Tu nombre" />
              </div>
              <div>
                <label style={lbl}>Teléfono</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inp} placeholder="0412-0000000" />
              </div>
            </div>
            <div>
              <label style={lbl}>Correo electrónico</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} placeholder="tu@email.com" />
            </div>
            <div>
              <label style={lbl}>Mensaje *</label>
              <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inp, height: '140px', resize: 'vertical' }} placeholder="Cuéntanos en qué podemos ayudarte..." />
            </div>
            <button type="submit" style={{
              padding: '14px 32px', background: '#d4829a', color: '#fff', border: 'none',
              fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '3px', alignSelf: 'flex-start',
            }}>
              {sent ? '✓ Enviando por WhatsApp...' : 'Enviar por WhatsApp'}
            </button>
            <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>
              Al enviar, se abrirá WhatsApp con tu mensaje listo para enviarnos directamente.
            </p>
          </form>
        </div>

        {/* Info de contacto */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 32px' }}>Información de Contacto</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* WhatsApp */}
            <a href="https://wa.me/584120759209" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', textDecoration: 'none', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'border-color 0.2s', background: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#d4829a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#333', margin: '0 0 4px' }}>WhatsApp</p>
                <p style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 2px' }}>0412-0759209</p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Respuesta en menos de 1 hora</p>
              </div>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/leah.vzla/" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', textDecoration: 'none', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'border-color 0.2s', background: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#d4829a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#333', margin: '0 0 4px' }}>Instagram</p>
                <p style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 2px' }}>@leah.vzla</p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Síguenos para ver las novedades</p>
              </div>
            </a>

            {/* TikTok */}
            <a href="https://www.tiktok.com/@leah.vzla" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', textDecoration: 'none', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'border-color 0.2s', background: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#d4829a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f0f0')}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#010101', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#333', margin: '0 0 4px' }}>TikTok</p>
                <p style={{ fontSize: '15px', color: '#1a1a1a', margin: '0 0 2px' }}>@leah.vzla</p>
                <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Mira nuestros videos y tendencias</p>
              </div>
            </a>

            {/* Showroom */}
            <div style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px', background: '#faf8f6' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d4829a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#333', margin: '0 0 4px' }}>Showroom</p>
                  <p style={{ fontSize: '14px', color: '#1a1a1a', margin: '0 0 2px', lineHeight: 1.5 }}>Av. 15 Delicias con Calle 59</p>
                  <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Con cita previa — escríbenos por WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contacto-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 40px 16px !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}

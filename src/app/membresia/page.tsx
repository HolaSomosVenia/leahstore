'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/api';

const BENEFITS = [
  {
    icon: '🚚',
    title: 'Delivery Gratis',
    desc: 'Envío sin costo en tu zona local (hasta 3 km). Sin mínimo de compra.',
    color: '#e8f5e9',
    accent: '#2e7d32',
  },
  {
    icon: '⚡',
    title: 'Acceso Anticipado',
    desc: 'Sé la primera en ver y comprar piezas antes de que salgan al público general.',
    color: '#fff8e1',
    accent: '#f57c00',
  },
  {
    icon: '💳',
    title: 'Descuento en Divisas',
    desc: 'Descuento exclusivo al pagar con divisas (Zelle o Binance).',
    color: '#fce4ec',
    accent: '#c2185b',
  },
];

export default function MembresiaPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle');
  const [msg, setMsg]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus('loading');
    try {
      const { data } = await api.post('/membership/join', form);
      setStatus(data.alreadyMember ? 'exists' : 'success');
      setMsg(data.message);
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.response?.data?.error || 'Error al registrar. Intenta de nuevo.');
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', required = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888' }}>
        {label}{required && <span style={{ color: '#d4829a' }}> *</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        required={required}
        style={{ border: '1px solid #ddd', padding: '12px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', borderRadius: '4px', transition: 'border-color .2s' }}
        onFocus={e => { e.currentTarget.style.borderColor = '#d4829a'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#ddd'; }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
      <Header />

      {/* ── Hero ── */}
      <div style={{ background: '#1a1a1a', padding: '72px 32px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#d4829a', margin: '0 0 16px' }}>Membresía Exclusiva</p>
        <h1 style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '8px', color: '#fff', margin: '0 0 16px', fontFamily: 'Georgia, serif' }}>LEAH MEMBER</h1>
        <div style={{ width: '60px', height: '2px', background: '#d4829a', margin: '0 auto 20px' }} />
        <p style={{ fontSize: '15px', color: '#aaa', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          Únete gratis y disfruta de beneficios exclusivos en cada compra.
        </p>
      </div>

      {/* ── Beneficios ── */}
      <div style={{ padding: '64px 32px', background: '#fafafa' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#bbb', textAlign: 'center', marginBottom: '40px' }}>Tus Beneficios</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '32px 28px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '52px', height: '52px', background: b.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '18px' }}>
                  {b.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '1px', color: '#1a1a1a', margin: '0 0 10px' }}>{b.title}</h3>
                <p style={{ fontSize: '13px', color: '#888', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div style={{ padding: '64px 32px', background: '#fff' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#bbb', textAlign: 'center', marginBottom: '8px' }}>Registro</p>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '2px', textAlign: 'center', color: '#1a1a1a', margin: '0 0 8px' }}>Quiero ser miembro</h2>
          <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', margin: '0 0 36px' }}>Completamente gratis. Sin compromisos.</p>

          {status === 'success' && (
            <div style={{ background: '#f0faf0', border: '1px solid #a5d6a7', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ fontSize: '28px', margin: '0 0 10px' }}>🎉</p>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#2e7d32', margin: '0 0 6px' }}>¡Bienvenida a Leah!</p>
              <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                Ya eres parte de nuestra membresía. Disfruta tu delivery gratis y acceso anticipado en tu próxima compra.
              </p>
            </div>
          )}

          {status === 'exists' && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ fontSize: '28px', margin: '0 0 10px' }}>⭐</p>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#f57c00', margin: '0 0 6px' }}>Ya eres miembro Leah</p>
              <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                Este email ya está registrado. Tus beneficios están activos en tu próxima compra.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div style={{ background: '#fce4ec', border: '1px solid #f48fb1', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: '#c2185b' }}>
              {msg}
            </div>
          )}

          {(status === 'idle' || status === 'loading' || status === 'error') && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {field('name',  'Nombre completo', 'text', true)}
              {field('email', 'Correo electrónico', 'email', true)}
              {field('phone', 'Teléfono (opcional)')}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '15px', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', cursor: status === 'loading' ? 'wait' : 'pointer', borderRadius: '6px', marginTop: '8px', opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Registrando...' : 'Unirme Gratis'}
              </button>

              <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', margin: 0 }}>
                Al registrarte aceptas recibir comunicaciones sobre nuevas colecciones y beneficios exclusivos.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ── ¿Cómo funciona? ── */}
      <div style={{ padding: '56px 32px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#d4829a', marginBottom: '12px' }}>Simple y rápido</p>
          <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '3px', color: '#fff', margin: '0 0 40px' }}>¿Cómo funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { n: '01', t: 'Regístrate',      d: 'Completa el formulario con tu nombre y email. Es gratis.' },
              { n: '02', t: 'Compra en Leah',   d: 'Usa tu email al hacer checkout para activar tus beneficios.' },
              { n: '03', t: 'Disfruta',         d: 'Delivery gratis en tu zona y acceso anticipado a lo nuevo.' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#d4829a', margin: '0 0 10px', fontFamily: 'Georgia, serif' }}>{s.n}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', color: '#fff', margin: '0 0 8px' }}>{s.t}</p>
                <p style={{ fontSize: '12px', color: '#888', margin: 0, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

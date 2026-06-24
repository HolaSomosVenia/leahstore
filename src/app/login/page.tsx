'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth(s => s.login);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 14px', border: '1.5px solid #e5e5e5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', borderRadius: '4px',
    background: '#fff', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
      {/* Header mínimo */}
      <header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '3px', color: '#000', textDecoration: 'none' }}>LEAH</Link>
      </header>

      {/* Formulario */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '36px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>Bienvenida</h1>
            <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', margin: '0 0 28px' }}>Inicia sesión en tu cuenta</p>

            {error && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#555' }}>
                  Email
                </label>
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#d4829a')}
                  onBlur={e  => (e.target.style.borderColor = '#e5e5e5')}
                  style={inp} placeholder="tu@email.com"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#555' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={e => (e.target.style.borderColor = '#d4829a')}
                    onBlur={e  => (e.target.style.borderColor = '#e5e5e5')}
                    style={{ ...inp, paddingRight: '46px' }} placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#aaa', padding: '4px' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? '#ccc' : '#d4829a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
              ¿No tienes cuenta?{' '}
              <Link href="/register" style={{ color: '#d4829a', fontWeight: 700, textDecoration: 'none' }}>Regístrate</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

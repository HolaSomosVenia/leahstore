'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface UploadedImage { name: string; url: string; size: number; }
interface Slide { image: string; title: string; subtitle: string; buttonText: string; }
interface Collection { id: string; name: string; image: string; description: string; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const lbl: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.6px', color: '#555',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e5e5e5',
  fontSize: '13px', boxSizing: 'border-box', borderRadius: '3px', background: '#fff',
};

const EMPTY_SLIDE: Slide = { image: '', title: '', subtitle: 'Nueva Colección', buttonText: 'Ver Colección' };

const Sidebar = () => (
  <aside style={{ width: '220px', background: '#000', color: '#fff', padding: '32px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '0 24px 32px', borderBottom: '1px solid #222' }}>
      <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>LEAH</p>
      <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Admin Panel</p>
    </div>
    <nav style={{ padding: '24px 0', flex: 1 }}>
      {[
        { href: '/admin/dashboard', label: '📊 Dashboard' },
        { href: '/admin/products', label: '👗 Productos' },
        { href: '/admin/inventario', label: '📦 Inventario' },
        { href: '/admin/orders', label: '🛍️ Órdenes' },
        { href: '/admin/users', label: '👤 Usuarios' },
        { href: '/admin/config', label: '⚙️ Configuración', active: true },
      ].map((item) => (
        <Link key={item.href} href={item.href} style={{
          display: 'block', padding: '12px 24px',
          color: (item as any).active ? '#fff' : '#aaa',
          textDecoration: 'none', fontSize: '13px', fontWeight: 500,
          background: (item as any).active ? '#1a1a1a' : 'transparent',
        }}>
          {item.label}
        </Link>
      ))}
    </nav>
    <div style={{ padding: '24px', borderTop: '1px solid #222' }}>
      <Link href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Volver a tienda</Link>
    </div>
  </aside>
);

export default function AdminConfig() {
  const router = useRouter();
  const checkAuth = useAuth((s) => s.checkAuth);
  const user = useAuth((s) => s.user);
  const [authReady, setAuthReady] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [slides, setSlides] = useState<Slide[]>([{ ...EMPTY_SLIDE }]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [colImagePicking, setColImagePicking] = useState<string | null>(null); // collection id
  const [activeTab, setActiveTab] = useState<'carousel' | 'collections'>('carousel');

  useEffect(() => { checkAuth().finally(() => setAuthReady(true)); }, [checkAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    Promise.all([
      api.get('/upload').catch(() => ({ data: [] })),
      fetch(`${API_BASE}/api/config`).then(r => r.json()).catch(() => null),
    ]).then(([imgsRes, cfg]) => {
      setImages(imgsRes.data || []);
      if (cfg?.carousel?.length) setSlides(cfg.carousel);
      else if (cfg?.banner) setSlides([cfg.banner]);
      if (cfg?.collections?.length) setCollections(cfg.collections);
    });
  }, [authReady, user]);

  const updateSlide = (idx: number, field: keyof Slide, value: string) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    setSlides(prev => [...prev, { ...EMPTY_SLIDE }]);
    setActiveSlide(slides.length);
  };

  const removeSlide = (idx: number) => {
    if (slides.length === 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setActiveSlide(Math.max(0, activeSlide - 1));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/config', { carousel: slides, banner: slides[0], collections });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Error guardando'); }
    setSaving(false);
  };

  const updateCollection = (id: string, field: keyof Collection, value: string) =>
    setCollections(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addCollection = () =>
    setCollections(prev => [...prev, { id: Date.now().toString(), name: 'Nueva Colección', image: '', description: '' }]);

  const removeCollection = (id: string) =>
    setCollections(prev => prev.filter(c => c.id !== id));

  if (!authReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Cargando...</p>
    </div>
  );
  if (!user || user.role !== 'ADMIN') return null;

  const slide = slides[activeSlide] || slides[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex' }}>
      <Sidebar />

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 16px' }}>Configuración</h1>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #f0f0f0' }}>
            {([['carousel', 'Carrusel Hero'], ['collections', 'Colecciones']] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '10px 24px', fontSize: '13px', fontWeight: 700,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === tab ? '#d4829a' : '#888',
                borderBottom: activeTab === tab ? '2px solid #d4829a' : '2px solid transparent',
                marginBottom: '-2px', letterSpacing: '0.5px',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── TAB: CARRUSEL ── */}
        {activeTab === 'carousel' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>

          {/* Panel izquierdo */}
          <div>
            {/* Tabs de slides */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {slides.map((s, i) => (
                <button key={i} onClick={() => setActiveSlide(i)} style={{
                  padding: '8px 18px', fontSize: '12px', fontWeight: 700,
                  background: activeSlide === i ? '#000' : '#fff',
                  color: activeSlide === i ? '#fff' : '#555',
                  border: '1.5px solid ' + (activeSlide === i ? '#000' : '#ddd'),
                  cursor: 'pointer', borderRadius: '3px',
                }}>
                  Slide {i + 1}
                  {s.title && <span style={{ fontWeight: 400, marginLeft: '6px', opacity: 0.7 }}>· {s.title.slice(0, 14)}{s.title.length > 14 ? '…' : ''}</span>}
                </button>
              ))}
              <button onClick={addSlide} style={{
                padding: '8px 18px', fontSize: '12px', fontWeight: 700,
                background: '#d4829a', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '3px',
              }}>
                + Agregar slide
              </button>
            </div>

            {/* Editor del slide activo */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Slide {activeSlide + 1}</h2>
                {slides.length > 1 && (
                  <button onClick={() => removeSlide(activeSlide)} style={{ fontSize: '12px', color: '#e53935', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    × Eliminar slide
                  </button>
                )}
              </div>

              {/* Imagen */}
              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>Imagen del slide</label>
                {slide.image ? (
                  <div style={{ position: 'relative', height: '130px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
                    <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => setPickingFor(activeSlide)} style={{ background: '#fff', color: '#000', border: 'none', padding: '7px 14px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px', letterSpacing: '0.5px' }}>
                        Cambiar imagen
                      </button>
                      <button onClick={() => updateSlide(activeSlide, 'image', '')} style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '7px 14px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px' }}>
                        × Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setPickingFor(activeSlide)} style={{
                    width: '100%', padding: '28px', border: '2px dashed #ddd', background: '#fafafa',
                    cursor: 'pointer', fontSize: '13px', color: '#aaa', borderRadius: '6px',
                  }}>
                    📷 Haz clic para elegir una imagen de la galería
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Título principal</label>
                <input value={slide.title} onChange={e => updateSlide(activeSlide, 'title', e.target.value)} style={inp} placeholder="Ej: Nueva Colección Primavera" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={lbl}>Subtítulo (encima del título)</label>
                <input value={slide.subtitle} onChange={e => updateSlide(activeSlide, 'subtitle', e.target.value)} style={inp} placeholder="Ej: Nueva Colección" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={lbl}>Texto del botón</label>
                <input value={slide.buttonText} onChange={e => updateSlide(activeSlide, 'buttonText', e.target.value)} style={inp} placeholder="Ej: Ver Colección" />
              </div>

              <button onClick={handleSave} disabled={saving} style={{
                width: '100%', padding: '13px', background: saving ? '#ccc' : '#000', color: '#fff',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 700, borderRadius: '3px',
              }}>
                {saving ? 'Guardando...' : saved ? '✓ Guardado — se ve en la tienda' : 'Guardar carrusel'}
              </button>
            </div>
          </div>

          {/* Vista previa */}
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Vista previa</p>
            </div>
            <div style={{ position: 'relative', height: '200px', background: slide.image ? 'transparent' : '#f5ece9', overflow: 'hidden' }}>
              {slide.image && <img src={slide.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: slide.image ? 'rgba(255,255,255,0.38)' : 'transparent' }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '20px' }}>
                {slide.subtitle && <p style={{ fontSize: '8px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#555', marginBottom: '8px', fontWeight: 600 }}>{slide.subtitle}</p>}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 300, margin: '0 0 14px', color: '#1a1a1a' }}>{slide.title || 'Título del slide'}</h3>
                <span style={{ display: 'inline-block', border: '1.5px solid #1a1a1a', padding: '6px 18px', fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 700, background: 'rgba(255,255,255,0.85)' }}>
                  {slide.buttonText || 'Ver Colección'}
                </span>
              </div>
            </div>
            <div style={{ padding: '12px', background: '#f9f9f9', borderTop: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0, textAlign: 'center' }}>
                {slides.length} slide{slides.length !== 1 ? 's' : ''} · se rotan cada 5 segundos
              </p>
            </div>
          </div>
        </div>}

        {/* ── TAB: COLECCIONES ── */}
        {activeTab === 'collections' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Edita el nombre, descripción e imagen de cada colección. Se muestran en la homepage.</p>
              <button onClick={addCollection} style={{ padding: '9px 20px', background: '#d4829a', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px' }}>
                + Nueva colección
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              {collections.map(col => (
                <div key={col.id} style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {/* Imagen */}
                  <div
                    onClick={() => setColImagePicking(col.id)}
                    style={{ height: '160px', background: col.image ? 'transparent' : '#f5ece8', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px', cursor: 'pointer', position: 'relative', border: '2px dashed ' + (col.image ? 'transparent' : '#e0d0ca') }}
                  >
                    {col.image ? (
                      <>
                        <img src={col.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>Cambiar imagen</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '24px' }}>🖼️</span>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>Agregar imagen</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={lbl}>Nombre</label>
                    <input value={col.name} onChange={e => updateCollection(col.id, 'name', e.target.value)} style={inp} placeholder="Ej: Colección Primavera" />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={lbl}>Descripción corta</label>
                    <input value={col.description} onChange={e => updateCollection(col.id, 'description', e.target.value)} style={inp} placeholder="Ej: Fresca y colorida" />
                  </div>
                  <button onClick={() => removeCollection(col.id)} style={{ width: '100%', padding: '7px', background: 'none', border: '1px solid #fecaca', color: '#e53935', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px' }}>
                    × Eliminar colección
                  </button>
                </div>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving} style={{ padding: '13px 40px', background: saving ? '#ccc' : '#000', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, borderRadius: '3px' }}>
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar colecciones'}
            </button>
          </div>
        )}
      </main>

      {/* Modal imágenes para colecciones */}
      {colImagePicking !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '680px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Elige imagen para la colección</h3>
              <button onClick={() => setColImagePicking(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {images.map(img => {
                const fullUrl = `${API_BASE}${img.url}`;
                return (
                  <div key={img.name} onClick={() => { updateCollection(colImagePicking, 'image', fullUrl); setColImagePicking(null); }}
                    style={{ cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', border: '2px solid transparent', transition: 'border 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.border = '2px solid #d4829a')}
                    onMouseLeave={e => (e.currentTarget.style.border = '2px solid transparent')}>
                    <div style={{ paddingBottom: '65%', position: 'relative', background: '#f0f0f0' }}>
                      <img src={fullUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal selector de imágenes (multi-select) */}
      {pickingFor !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', width: '720px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Selecciona imágenes para el carrusel</h3>
              <button onClick={() => { setPickingFor(null); setMultiSelected([]); }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 18px' }}>
              Puedes seleccionar varias imágenes a la vez — cada una se convertirá en un slide del carrusel.
            </p>

            {images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                <p>No hay imágenes subidas todavía.</p>
                <Link href="/admin/products" style={{ color: '#d4829a', fontWeight: 700 }}>Ir a subir imágenes →</Link>
              </div>
            ) : (
              <>
                <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', flex: 1 }}>
                  {images.map(img => {
                    const fullUrl = `${API_BASE}${img.url}`;
                    const selected = multiSelected.includes(fullUrl);
                    return (
                      <div
                        key={img.name}
                        onClick={() => setMultiSelected(prev => selected ? prev.filter(u => u !== fullUrl) : [...prev, fullUrl])}
                        style={{ cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: `3px solid ${selected ? '#d4829a' : 'transparent'}`, transition: 'border 0.15s', position: 'relative' }}
                      >
                        <div style={{ paddingBottom: '70%', position: 'relative', background: '#f0f0f0' }}>
                          <img src={fullUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {selected && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#d4829a', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                            {multiSelected.indexOf(fullUrl) + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer del modal */}
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                    {multiSelected.length === 0 ? 'Ninguna imagen seleccionada' : `${multiSelected.length} imagen${multiSelected.length > 1 ? 'es' : ''} seleccionada${multiSelected.length > 1 ? 's' : ''}`}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setMultiSelected([])} style={{ padding: '9px 18px', background: 'none', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer', borderRadius: '3px', color: '#666' }}>
                      Limpiar
                    </button>
                    <button
                      disabled={multiSelected.length === 0}
                      onClick={() => {
                        const newSlides = multiSelected.map(url => ({ ...EMPTY_SLIDE, image: url }));
                        // Si el slide activo no tiene imagen, reemplazarlo; sino agregar al final
                        if (!slides[pickingFor].image) {
                          setSlides(prev => {
                            const updated = [...prev];
                            updated[pickingFor] = { ...updated[pickingFor], image: newSlides[0].image };
                            return [...updated, ...newSlides.slice(1)];
                          });
                        } else {
                          setSlides(prev => [...prev, ...newSlides]);
                        }
                        setActiveSlide(pickingFor);
                        setPickingFor(null);
                        setMultiSelected([]);
                      }}
                      style={{ padding: '9px 22px', background: multiSelected.length === 0 ? '#ccc' : '#d4829a', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: multiSelected.length === 0 ? 'not-allowed' : 'pointer', borderRadius: '3px', letterSpacing: '0.5px' }}
                    >
                      Agregar {multiSelected.length > 0 ? `${multiSelected.length} slide${multiSelected.length > 1 ? 's' : ''}` : 'al carrusel'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

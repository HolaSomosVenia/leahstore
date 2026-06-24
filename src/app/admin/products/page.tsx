'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface Variant { id: string; size: string; color: string; stock: number; }
interface Product {
  id: string; name: string; description: string;
  price: number | string; images: string[];
  categoryId: string; category: { id: string; name: string };
  variants: Variant[];
}
interface UploadedImage { name: string; url: string; size: number; }

const CATEGORIES = [
  { id: 'cat-1', name: 'Vestidos' },
  { id: 'cat-2', name: 'Blusas' },
  { id: 'cat-3', name: 'Pantalones' },
  { id: 'cat-4', name: 'Accesorios' },
];

const BLANK_PRODUCT = { name: '', description: '', price: '', categoryId: 'cat-1' };
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const inp = (extra?: object): React.CSSProperties => ({
  width: '100%', padding: '9px 12px', border: '1.5px solid #e5e5e5',
  fontSize: '13px', boxSizing: 'border-box', borderRadius: '3px',
  background: '#fff', ...extra,
});
const lbl: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.6px', color: '#555',
};

export default function AdminProducts() {
  const router = useRouter();
  const checkAuth = useAuth((s) => s.checkAuth);
  const user = useAuth((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState<'products' | 'images'>('products');

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(BLANK_PRODUCT);
  const [createImages, setCreateImages] = useState<string[]>([]);
  const [createVariants, setCreateVariants] = useState<Omit<Variant, 'id'>[]>([]);
  const [saving, setSaving] = useState(false);

  // Edit modal
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(BLANK_PRODUCT);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editVariants, setEditVariants] = useState<Variant[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // New variant row (shared for create/edit)
  const emptyVariant = { size: '', color: '', stock: 0 };
  const [newVariant, setNewVariant] = useState(emptyVariant);

  // Gallery / uploads
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  // Auth
  useEffect(() => { checkAuth().finally(() => setAuthReady(true)); }, [checkAuth]);
  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    fetchProducts(); fetchImages();
  }, [authReady, user]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try { const r = await api.get('/admin/products'); setProducts(r.data); } catch { }
    setLoadingProducts(false);
  };

  const fetchImages = async () => {
    setLoadingImages(true);
    try { const r = await api.get('/upload'); setImages(r.data); } catch { }
    setLoadingImages(false);
  };

  // Upload
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true); setUploadMsg(`Subiendo ${arr.length} imagen(es)...`);
    const fd = new FormData();
    arr.forEach((f) => fd.append('images', f));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (data.urls) { setUploadMsg(`✓ ${data.urls.length} subida(s)`); await fetchImages(); }
    } catch { setUploadMsg('Error al subir.'); }
    setUploading(false);
    setTimeout(() => setUploadMsg(null), 3000);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  const handleDeleteImage = async (name: string) => {
    if (!confirm('¿Eliminar imagen?')) return;
    try { await api.delete(`/upload/${name}`); setImages((p) => p.filter((i) => i.name !== name)); } catch { }
  };

  // Toggle image in a list
  const toggleImg = (url: string, list: string[], set: (v: string[]) => void) =>
    set(list.includes(url) ? list.filter((u) => u !== url) : [...list, url]);

  // Create product
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createImages.length) { alert('Selecciona al menos 1 imagen'); return; }
    setSaving(true);
    try {
      const r = await api.post('/admin/products', {
        name: createForm.name, description: createForm.description,
        price: parseFloat(createForm.price), categoryId: createForm.categoryId,
        images: createImages, variants: createVariants,
      });
      setProducts((p) => [r.data, ...p]);
      setCreateForm(BLANK_PRODUCT); setCreateImages([]); setCreateVariants([]);
      setShowCreate(false);
    } catch { alert('Error creando producto'); }
    setSaving(false);
  };

  // Open edit
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({ name: p.name, description: p.description || '', price: String(Number(p.price)), categoryId: p.category?.id || p.categoryId || 'cat-1' });
    setEditImages(p.images || []);
    setEditVariants(p.variants?.map((v, i) => ({ ...v, id: v.id || `v-${i}` })) || []);
    setNewVariant(emptyVariant);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editProduct) return;
    setSavingEdit(true);
    try {
      const payload: any = {
        name: editForm.name, description: editForm.description,
        price: parseFloat(editForm.price), categoryId: editForm.categoryId,
        images: editImages, variants: editVariants,
      };
      await api.put(`/admin/products/${editProduct.id}`, payload);
      const cat = CATEGORIES.find((c) => c.id === editForm.categoryId);
      setProducts((prev) => prev.map((p) =>
        p.id === editProduct.id
          ? { ...p, ...payload, price: payload.price, category: cat || p.category }
          : p
      ));
      setEditProduct(null);
    } catch { alert('Error guardando cambios'); }
    setSavingEdit(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/admin/products/${id}`); setProducts((p) => p.filter((x) => x.id !== id)); } catch { }
  };

  if (!authReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Verificando acceso...</p>
    </div>
  );
  if (!user || user.role !== 'ADMIN') return null;

  // ── ImagePicker shared component ──
  const ImagePicker = ({ selected, onToggle }: { selected: string[]; onToggle: (url: string) => void }) => (
    <div>
      <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px' }}>
        {selected.length} seleccionada{selected.length !== 1 ? 's' : ''} · La primera imagen es la principal
        {images.length === 0 && (
          <button type="button" onClick={() => setTab('images')} style={{ marginLeft: '8px', color: '#d4829a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
            Subir imágenes →
          </button>
        )}
      </p>
      {images.length === 0 ? (
        <div style={{ padding: '20px', background: '#f9f9f9', border: '1.5px dashed #ddd', borderRadius: '6px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
          No hay imágenes en la galería todavía
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
          {images.map((img) => {
            const url = `${API_BASE}${img.url}`;
            const idx = selected.indexOf(url);
            const sel = idx !== -1;
            return (
              <div key={img.name} onClick={() => onToggle(url)} style={{
                position: 'relative', cursor: 'pointer', borderRadius: '4px', overflow: 'hidden',
                border: sel ? '2.5px solid #d4829a' : '2.5px solid #eee',
              }}>
                <div style={{ paddingBottom: '120%', position: 'relative', background: '#f5f5f5' }}>
                  <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {sel && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', background: '#d4829a', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── VariantEditor shared component ──
  const VariantEditor = ({
    variants, onDelete, onAdd, newV, setNewV,
  }: {
    variants: any[]; onDelete: (id: string) => void;
    onAdd: () => void; newV: typeof emptyVariant; setNewV: (v: typeof emptyVariant) => void;
  }) => (
    <div>
      {variants.length > 0 && (
        <div style={{ marginBottom: '10px', border: '1px solid #f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f8' }}>
                {['Talla', 'Color', 'Stock', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: '10px', fontWeight: 700, textAlign: 'left', color: '#888', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id || i} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 10px', fontSize: '13px' }}>{v.size}</td>
                  <td style={{ padding: '8px 10px', fontSize: '13px', color: '#666' }}>{v.color || '—'}</td>
                  <td style={{ padding: '8px 10px', fontSize: '13px' }}>{v.stock}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <button type="button" onClick={() => onDelete(v.id || String(i))} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: '8px', alignItems: 'end' }}>
        <div>
          <label style={{ ...lbl, marginBottom: '4px' }}>Talla</label>
          <input value={newV.size} onChange={(e) => setNewV({ ...newV, size: e.target.value })} placeholder="S / M / 28 / Único" style={inp()} />
        </div>
        <div>
          <label style={{ ...lbl, marginBottom: '4px' }}>Color</label>
          <input value={newV.color} onChange={(e) => setNewV({ ...newV, color: e.target.value })} placeholder="Negro" style={inp()} />
        </div>
        <div>
          <label style={{ ...lbl, marginBottom: '4px' }}>Stock</label>
          <input type="number" min="0" value={newV.stock} onChange={(e) => setNewV({ ...newV, stock: parseInt(e.target.value) || 0 })} style={inp()} />
        </div>
        <button type="button" onClick={onAdd} style={{ padding: '9px 14px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '3px', fontSize: '18px', lineHeight: 1 }}>+</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex' }}>

      {/* ── MODAL EDITAR PRODUCTO ── */}
      {editProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', width: '100%', maxWidth: '760px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Editar Producto</h2>
              <button onClick={() => setEditProduct(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
            </div>

            {/* Scroll body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

              {/* Nombre + Precio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={lbl}>Nombre *</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inp()} placeholder="Nombre del producto" />
                </div>
                <div>
                  <label style={lbl}>Precio USD *</label>
                  <input type="number" step="0.01" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={inp()} placeholder="89.99" />
                </div>
              </div>

              {/* Categoría + Descripción */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={lbl}>Categoría</label>
                  <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} style={inp()}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Descripción</label>
                  <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} style={inp()} placeholder="Descripción breve..." />
                </div>
              </div>

              {/* Imágenes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={lbl}>Imágenes</label>
                <ImagePicker
                  selected={editImages}
                  onToggle={(url) => toggleImg(url, editImages, setEditImages)}
                />
              </div>

              {/* Tallas / Variantes */}
              <div>
                <label style={lbl}>Tallas y Stock</label>
                <VariantEditor
                  variants={editVariants}
                  onDelete={(id) => setEditVariants((v) => v.filter((x) => x.id !== id))}
                  onAdd={() => {
                    if (!newVariant.size) { alert('Escribe una talla'); return; }
                    setEditVariants((v) => [...v, { id: `new-${Date.now()}`, ...newVariant }]);
                    setNewVariant(emptyVariant);
                  }}
                  newV={newVariant}
                  setNewV={setNewVariant}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setEditProduct(null)} style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '13px', borderRadius: '4px' }}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={savingEdit} style={{ padding: '10px 28px', background: savingEdit ? '#ccc' : '#000', color: '#fff', border: 'none', cursor: savingEdit ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, borderRadius: '4px' }}>
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '220px', background: '#000', color: '#fff', padding: '32px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid #222' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>LEAH</p>
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Admin Panel</p>
        </div>
        <nav style={{ padding: '24px 0', flex: 1 }}>
          {[
            { href: '/admin/dashboard', label: '📊 Dashboard' },
            { href: '/admin/products', label: '👗 Productos', active: true },
            { href: '/admin/inventario', label: '📦 Inventario' },
            { href: '/admin/orders', label: '🛍️ Órdenes' },
            { href: '/admin/users', label: '👤 Usuarios' },
            { href: '/admin/config', label: '⚙️ Configuración' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ display: 'block', padding: '12px 24px', color: (item as any).active ? '#fff' : '#aaa', textDecoration: 'none', fontSize: '13px', fontWeight: 500, background: (item as any).active ? '#1a1a1a' : 'transparent' }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #222' }}>
          <Link href="/" style={{ fontSize: '12px', color: '#666', textDecoration: 'none' }}>← Volver a tienda</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>Productos</h1>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{products.length} productos en catálogo</p>
          </div>
          <button onClick={() => { setShowCreate(true); setTab('products'); }} style={{ background: '#000', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo Producto
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e5e5', marginBottom: '28px' }}>
          {[{ key: 'products', label: 'Catálogo' }, { key: 'images', label: `Imágenes (${images.length})` }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: '10px 24px', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.key ? '2px solid #000' : '2px solid transparent',
              color: tab === t.key ? '#000' : '#888', marginBottom: '-2px',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB IMÁGENES ── */}
        {tab === 'images' && (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? '#d4829a' : '#ccc'}`, borderRadius: '8px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#fff0f5' : '#fff', marginBottom: '28px' }}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#333', margin: '0 0 6px' }}>
                {uploading ? uploadMsg : 'Arrastra tus fotos aquí o haz clic para seleccionar'}
              </p>
              <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>JPG, PNG, WebP · máx 8 MB · varias a la vez</p>
              {uploadMsg && !uploading && <p style={{ fontSize: '13px', color: '#22c55e', marginTop: '10px', fontWeight: 600 }}>{uploadMsg}</p>}
            </div>

            {loadingImages ? <p style={{ color: '#888' }}>Cargando...</p> : images.length === 0 ? (
              <p style={{ color: '#ccc', textAlign: 'center', padding: '40px 0' }}>No hay imágenes todavía</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {images.map((img) => (
                  <div key={img.name} style={{ background: '#fff', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ paddingBottom: '100%', position: 'relative' }}>
                      <img src={`${API_BASE}${img.url}`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <p style={{ fontSize: '10px', color: '#aaa', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => navigator.clipboard.writeText(`${API_BASE}${img.url}`)} style={{ flex: 1, fontSize: '10px', padding: '5px', background: '#f5f5f5', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 600 }}>Copiar URL</button>
                        <button onClick={() => handleDeleteImage(img.name)} style={{ fontSize: '10px', padding: '5px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', borderRadius: '3px' }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CATÁLOGO ── */}
        {tab === 'products' && (
          <div>
            {/* Formulario crear */}
            {showCreate && (
              <div style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Nuevo Producto</h2>
                  <button onClick={() => { setShowCreate(false); setCreateImages([]); setCreateVariants([]); }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#aaa' }}>×</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div><label style={lbl}>Nombre *</label><input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} style={inp()} placeholder="Ej: Vestido Lino Crema" /></div>
                    <div><label style={lbl}>Precio USD *</label><input required type="number" step="0.01" min="0" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} style={inp()} placeholder="89.99" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={lbl}>Categoría</label>
                      <select value={createForm.categoryId} onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })} style={inp()}>
                        {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Descripción</label><input value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} style={inp()} placeholder="Descripción breve..." /></div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl}>Imágenes *</label>
                    <ImagePicker selected={createImages} onToggle={(url) => toggleImg(url, createImages, setCreateImages)} />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl}>Tallas y Stock</label>
                    <VariantEditor
                      variants={createVariants}
                      onDelete={(id) => setCreateVariants((v) => v.filter((_, i) => String(i) !== id))}
                      onAdd={() => {
                        if (!newVariant.size) { alert('Escribe una talla'); return; }
                        setCreateVariants((v) => [...v, { ...newVariant }]);
                        setNewVariant(emptyVariant);
                      }}
                      newV={newVariant}
                      setNewV={setNewVariant}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={saving} style={{ padding: '11px 28px', background: saving ? '#ccc' : '#000', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, borderRadius: '3px' }}>
                      {saving ? 'Guardando...' : 'Crear Producto'}
                    </button>
                    <button type="button" onClick={() => { setShowCreate(false); setCreateImages([]); setCreateVariants([]); }} style={{ padding: '11px 20px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '13px', borderRadius: '3px' }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla */}
            {loadingProducts ? <p style={{ color: '#888' }}>Cargando...</p> : (
              <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                      {['Foto', 'Nombre', 'Categoría', 'Precio', 'Tallas', 'Acciones'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px 16px' }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt="" style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '3px', display: 'block' }} />
                            : <div style={{ width: '48px', height: '64px', background: '#f0f0f0', borderRadius: '3px' }} />}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, maxWidth: '180px' }}>{p.name}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#666' }}>{p.category?.name || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#888' }}>
                          {p.variants?.length ? p.variants.map((v) => v.size).join(', ') : '—'}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => openEdit(p)} style={{ fontSize: '12px', color: '#fff', background: '#000', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '5px 12px', borderRadius: '3px' }}>
                              Editar
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc' }}>
                    <p>No hay productos. Haz clic en "+ Nuevo Producto"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

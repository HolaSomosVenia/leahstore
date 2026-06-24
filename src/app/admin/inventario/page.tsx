'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { AdminSidebar } from '@/components/AdminSidebar';

interface Variant { id: string; sku?: string | null; size?: string; color?: string; stock: number; }
interface Product { id: string; name: string; code?: string | null; category: { name: string }; variants: Variant[]; images: string[]; }
type ModalType = 'adjust' | 'sale' | 'history' | 'editCode' | null;


/* ─── Chip de código/SKU ──────────────────────────────────────────────────── */
const CodeChip = ({ value, green }: { value?: string | null; green?: boolean }) => (
  <span style={{
    fontSize: '11px', fontFamily: 'monospace', padding: '2px 7px', borderRadius: '3px',
    background: value ? (green ? '#e8f5e9' : '#f0f0f0') : '#fafafa',
    color: value ? (green ? '#2e7d32' : '#555') : '#ccc',
    letterSpacing: '0.5px',
  }}>{value || '—'}</span>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function InventarioPage() {
  const router = useRouter();
  const checkAuth = useAuth(s => s.checkAuth);
  const user = useAuth(s => s.user);
  const [authReady, setAuthReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);

  // Ajuste stock
  const [selVariant, setSelVariant] = useState<Variant & { productName: string; productId: string } | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'RESTOCK' | 'ADJUSTMENT'>('RESTOCK');
  const [adjustNote, setAdjustNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Venta local
  const [saleItems, setSaleItems] = useState<{ variantId: string; productName: string; sku?: string | null; size?: string; color?: string; quantity: number }[]>([]);

  // Historial
  const [history, setHistory] = useState<any[]>([]);

  // Editar código/SKU
  const [selProduct, setSelProduct] = useState<Product | null>(null);
  const [editingCode, setEditingCode] = useState('');
  const [editingSkus, setEditingSkus] = useState<Record<string, string>>({});
  const [skuSaving, setSkuSaving] = useState(false);
  const [skuError, setSkuError] = useState('');

  useEffect(() => { checkAuth().finally(() => setAuthReady(true)); }, [checkAuth]);
  useEffect(() => {
    if (!authReady) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    loadInventory();
  }, [authReady, user]);

  const loadInventory = () => {
    setLoading(true);
    api.get('/inventory').then(r => setProducts(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const openAdjust = (v: Variant, productName: string, productId: string) => {
    setSelVariant({ ...v, productName, productId });
    setAdjustQty(0); setAdjustType('RESTOCK'); setAdjustNote('');
    setModal('adjust');
  };

  const openEditCode = (p: Product) => {
    setSelProduct(p);
    setEditingCode(p.code || '');
    const m: Record<string, string> = {};
    p.variants.forEach(v => { m[v.id] = v.sku || ''; });
    setEditingSkus(m); setSkuError(''); setModal('editCode');
  };

  const autoSku = (code: string, size?: string, color?: string) =>
    [code || 'PROD', size?.toUpperCase(), color?.toUpperCase().substring(0, 3)].filter(Boolean).join('-');

  const handleAutoFill = () => {
    if (!selProduct) return;
    const m: Record<string, string> = {};
    selProduct.variants.forEach(v => { m[v.id] = autoSku(editingCode, v.size, v.color); });
    setEditingSkus(m);
  };

  const handleSaveCodes = async () => {
    if (!selProduct) return;
    setSkuSaving(true); setSkuError('');
    try {
      if (editingCode !== (selProduct.code || ''))
        await api.patch('/inventory/sku', { productId: selProduct.id, code: editingCode });
      for (const v of selProduct.variants) {
        const newSku = editingSkus[v.id] ?? '';
        if (newSku !== (v.sku || ''))
          await api.patch('/inventory/sku', { variantId: v.id, sku: newSku });
      }
      setModal(null); loadInventory();
    } catch (e: any) { setSkuError(e.response?.data?.error || 'Error al guardar'); }
    setSkuSaving(false);
  };

  const handleAdjust = async () => {
    if (!selVariant || adjustQty <= 0) return;
    setSaving(true);
    try {
      const qty = adjustType === 'RESTOCK' ? adjustQty : -adjustQty;
      await api.post('/inventory/adjust', { variantId: selVariant.id, quantity: qty, type: adjustType, note: adjustNote });
      setModal(null); loadInventory();
    } catch (e: any) { alert(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };

  const handleSale = async () => {
    if (!saleItems.length) return;
    setSaving(true);
    try {
      await api.post('/inventory/sale-local', { items: saleItems.map(i => ({ variantId: i.variantId, quantity: i.quantity, price: 0 })), note: 'Venta en local' });
      setModal(null); loadInventory(); alert('Venta registrada. Stock actualizado.');
    } catch (e: any) { alert(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };

  const addSaleItem = (v: Variant, productName: string) =>
    setSaleItems(prev => {
      const ex = prev.find(i => i.variantId === v.id);
      if (ex) return prev.map(i => i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { variantId: v.id, productName, sku: v.sku, size: v.size, color: v.color, quantity: 1 }];
    });

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const allVariants = products.flatMap(p => p.variants);
  const totalItems  = allVariants.reduce((s, v) => s + v.stock, 0);
  const lowStock    = allVariants.filter(v => v.stock > 0 && v.stock <= 3).length;
  const outStock    = allVariants.filter(v => v.stock === 0).length;
  const withSku     = allVariants.filter(v => v.sku).length;

  const filtered = products.filter(p => {
    if (filterLow) return p.variants.some(v => v.stock <= 3);
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q) ||
      p.variants.some(v => (v.sku || '').toLowerCase().includes(q));
  });

  const stockColor  = (s: number) => s === 0 ? '#e53935' : s <= 3 ? '#f57f17' : '#4caf50';
  const stockBg     = (s: number) => s === 0 ? '#ffebee' : s <= 3 ? '#fffde7' : '#e8f5e9';
  const stockLabel  = (s: number) => s === 0 ? 'Sin stock' : s <= 3 ? 'Bajo' : 'OK';

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e5', fontSize: '13px', boxSizing: 'border-box', borderRadius: '4px' };
  const lbl: React.CSSProperties = { fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#555' };

  if (!authReady || !user || user.role !== 'ADMIN') return null;

  return (
    <>
      {/* ─── Responsive CSS ─────────────────────────────────────────────── */}
      <style>{`
        .inv-layout { display: flex; min-height: 100vh; background: #f8f8f8; }

        /* Main */
        .inv-main { flex: 1; padding: 40px; overflow-y: auto; }

        /* Stats */
        .inv-stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; margin-bottom: 28px; }

        /* Filters */
        .inv-filters { display: flex; gap: 10px; margin-bottom: 18px; align-items: center; flex-wrap: wrap; }
        .inv-filters input { width: 320px; }

        /* Table */
        .inv-table-wrap { display: block; }
        .inv-product-cards { display: none; }

        /* Header */
        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .inv-header-actions { display: flex; gap: 10px; flex-shrink: 0; }

        /* Modales */
        .inv-modal-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999; display: flex; align-items: center; justify-content: center; }
        .inv-modal-inner { background: #fff; border-radius: 8px; padding: 28px; }

        /* ── Tablet (< 1024px) ── */
        @media (max-width: 1023px) {
          .inv-main { padding: 68px 20px 24px; }
          .inv-stats { grid-template-columns: repeat(3,1fr); gap: 12px; }
          .inv-header { flex-direction: column; gap: 14px; }
          .inv-header-actions { width: 100%; justify-content: flex-end; }
        }

        /* ── Móvil (< 640px) ── */
        @media (max-width: 639px) {
          .inv-main { padding: 16px; }
          .inv-stats { grid-template-columns: repeat(2,1fr); gap: 10px; }
          .inv-stats > div:last-child:nth-child(odd) { grid-column: span 2; }
          .inv-filters { flex-direction: row; flex-wrap: wrap; gap: 8px; }
          .inv-filters input { width: 100% !important; flex: 1 1 100% !important; min-width: 0; order: -1; }
          .inv-table-wrap { display: none !important; }
          .inv-product-cards { display: flex !important; flex-direction: column; gap: 12px; }
          .inv-modal-wrap { align-items: flex-end; }
          .inv-modal-inner {
            width: 100vw !important;
            max-height: 90vh !important;
            border-radius: 16px 16px 0 0 !important;
            padding: 20px 16px !important;
            box-sizing: border-box !important;
            overflow-y: auto;
          }
          .inv-modal-history {
            max-height: 92vh !important;
            border-radius: 16px 16px 0 0 !important;
            box-sizing: border-box !important;
          }
          .inv-header-actions { gap: 8px; flex-wrap: wrap; }
          .inv-header-actions .inv-btn { flex: 1 1 auto; justify-content: center; }
        }

        /* ── Pantallas muy pequeñas (< 380px) ── */
        @media (max-width: 379px) {
          .inv-stats > div { padding: 12px 10px !important; }
          .inv-stats > div p:last-child { font-size: 18px !important; }
          .inv-header-actions { flex-direction: column; }
          .inv-header-actions .inv-btn { width: 100% !important; }
        }

        /* Touch targets */
        @media (hover: none) {
          .inv-btn { min-height: 44px; min-width: 44px; }
        }
      `}</style>

      <div className="inv-layout">
        <AdminSidebar active="/admin/inventario" />

        <main className="inv-main">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="inv-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 2px' }}>Inventario</h1>
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Stock en tiempo real · Códigos y SKUs</p>
              </div>
            </div>
            <div className="inv-header-actions">
              <button className="inv-btn" onClick={() => { api.get('/inventory/movements').then(r => setHistory(r.data || [])); setModal('history'); }}
                style={{ padding: '10px 16px', background: '#fff', border: '1.5px solid #e5e5e5', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', color: '#555', whiteSpace: 'nowrap' }}>
                📋 Historial
              </button>
              <button className="inv-btn" onClick={() => { setSaleItems([]); setModal('sale'); }}
                style={{ padding: '10px 18px', background: '#d4829a', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                + Venta Local
              </button>
            </div>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <div className="inv-stats">
            {[
              { label: 'Unidades',     value: totalItems,                       color: '#1a1a1a', bg: '#fff' },
              { label: 'Productos',    value: products.length,                  color: '#1a1a1a', bg: '#fff' },
              { label: 'Con SKU',      value: `${withSku}/${allVariants.length}`, color: '#1976d2', bg: '#e3f2fd' },
              { label: 'Stock bajo',   value: lowStock,                         color: '#f57f17', bg: '#fffde7' },
              { label: 'Sin stock',    value: outStock,                         color: '#e53935', bg: '#ffebee' },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, padding: '16px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px' }}>{c.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: c.color, margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filtros ───────────────────────────────────────────────────── */}
          <div className="inv-filters">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código o SKU..."
              style={{ ...inp, marginBottom: 0, flex: '1 1 240px' }} />
            <button className="inv-btn" onClick={() => setFilterLow(!filterLow)}
              style={{ padding: '10px 14px', border: `1.5px solid ${filterLow ? '#f57f17' : '#e5e5e5'}`, background: filterLow ? '#fffde7' : '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', color: filterLow ? '#f57f17' : '#555', whiteSpace: 'nowrap' }}>
              {filterLow ? '× ' : ''}Stock bajo
            </button>
            <button className="inv-btn" onClick={loadInventory}
              style={{ padding: '10px 14px', border: '1.5px solid #e5e5e5', background: '#fff', fontSize: '14px', cursor: 'pointer', borderRadius: '6px', color: '#555' }}>
              ↺
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '14px' }}>Cargando inventario...</div>
          ) : (
            <>
              {/* ── TABLA (desktop / tablet horizontal) ───────────────────── */}
              <div className="inv-table-wrap" style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                      {['Código', 'Producto / Variante', 'SKU', 'Talla', 'Color', 'Stock', 'Estado', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.flatMap(product =>
                      product.variants.map((v, vi) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f5f5f5', background: vi % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            {vi === 0 && <CodeChip value={product.code} />}
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: '13px', fontWeight: vi === 0 ? 700 : 400, color: vi === 0 ? '#1a1a1a' : '#888' }}>
                            {vi === 0 ? product.name : <span style={{ paddingLeft: '12px' }}>↳</span>}
                          </td>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            <CodeChip value={v.sku} green />
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: '12px', color: '#555' }}>{v.size || '—'}</td>
                          <td style={{ padding: '11px 14px', fontSize: '12px', color: '#555' }}>{v.color || '—'}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ fontSize: '17px', fontWeight: 700, color: stockColor(v.stock) }}>{v.stock}</span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: stockBg(v.stock), color: stockColor(v.stock) }}>{stockLabel(v.stock)}</span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="inv-btn" onClick={() => openAdjust(v, product.name, product.id)}
                                style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, background: '#fff', border: '1.5px solid #d4829a', color: '#d4829a', cursor: 'pointer', borderRadius: '4px' }}>
                                Stock
                              </button>
                              {vi === 0 && (
                                <button className="inv-btn" onClick={() => openEditCode(product)}
                                  style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, background: '#fff', border: '1.5px solid #1976d2', color: '#1976d2', cursor: 'pointer', borderRadius: '4px' }}>
                                  Código
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>No se encontraron productos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── TARJETAS (móvil) ───────────────────────────────────────── */}
              <div className="inv-product-cards">
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#bbb', fontSize: '13px' }}>No se encontraron productos</div>
                )}
                {filtered.map(product => (
                  <div key={product.id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    {/* Encabezado del producto */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>{product.name}</p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <CodeChip value={product.code} />
                          <span style={{ fontSize: '11px', color: '#aaa' }}>{product.category?.name}</span>
                        </div>
                      </div>
                      <button onClick={() => openEditCode(product)}
                        style={{ padding: '8px 13px', fontSize: '12px', fontWeight: 700, background: '#fff', border: '1.5px solid #1976d2', color: '#1976d2', cursor: 'pointer', borderRadius: '6px' }}>
                        Código
                      </button>
                    </div>
                    {/* Variantes */}
                    {product.variants.map((v, vi) => (
                      <div key={v.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: vi < product.variants.length - 1 ? '1px solid #f8f8f8' : 'none', background: vi % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <div style={{ flex: 1 }}>
                          {v.sku
                            ? <p style={{ margin: '0 0 3px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: '#2e7d32' }}>{v.sku}</p>
                            : <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 600, color: '#333' }}>{[v.size, v.color].filter(Boolean).join(' · ')}</p>
                          }
                          {v.sku && <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>{[v.size, v.color].filter(Boolean).join(' · ')}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: 700, color: stockColor(v.stock) }}>{v.stock}</span>
                            <span style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: stockColor(v.stock), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stockLabel(v.stock)}</span>
                          </div>
                          <button onClick={() => openAdjust(v, product.name, product.id)}
                            style={{ padding: '9px 14px', fontSize: '12px', fontWeight: 700, background: '#fff', border: '1.5px solid #d4829a', color: '#d4829a', cursor: 'pointer', borderRadius: '6px', minHeight: '40px' }}>
                            Ajustar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ══ MODAL: Ajustar stock ════════════════════════════════════════════ */}
      {modal === 'adjust' && selVariant && (
        <div className="inv-modal-wrap">
          <div className="inv-modal-inner" style={{ width: '420px', maxWidth: '100vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700 }}>Ajustar Stock</h3>
                <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#555' }}>{selVariant.productName}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {selVariant.sku && <CodeChip value={selVariant.sku} green />}
                  <span style={{ fontSize: '12px', color: '#aaa' }}>{selVariant.size} {selVariant.color}</span>
                </div>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888', padding: '0 4px' }}>×</button>
            </div>
            <div style={{ background: '#f8f8f8', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#555' }}>Stock actual</span>
              <span style={{ fontSize: '22px', fontWeight: 700, color: stockColor(selVariant.stock) }}>{selVariant.stock}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {(['RESTOCK', 'ADJUSTMENT'] as const).map(t => (
                <button key={t} onClick={() => setAdjustType(t)} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px', border: `1.5px solid ${adjustType === t ? '#d4829a' : '#e5e5e5'}`, background: adjustType === t ? '#fdf0f4' : '#fff', color: adjustType === t ? '#d4829a' : '#555' }}>
                  {t === 'RESTOCK' ? '+ Agregar' : '− Retirar'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Cantidad</label>
              <input type="number" inputMode="numeric" min="1" value={adjustQty || ''} onChange={e => setAdjustQty(Number(e.target.value))}
                style={{ ...inp, fontSize: '18px', fontWeight: 700, textAlign: 'center' }} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={lbl}>Nota (opcional)</label>
              <input value={adjustNote} onChange={e => setAdjustNote(e.target.value)} style={inp} placeholder="Ej: Nueva mercancía semana 25" />
            </div>

            {adjustQty > 0 && (
              <div style={{ background: '#f0f8f0', border: '1px solid #c8e6c9', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#555' }}>Stock resultante</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#2e7d32' }}>
                  {adjustType === 'RESTOCK' ? selVariant.stock + adjustQty : selVariant.stock - adjustQty}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '13px', background: '#fff', border: '1.5px solid #e5e5e5', fontSize: '13px', cursor: 'pointer', borderRadius: '6px' }}>Cancelar</button>
              <button onClick={handleAdjust} disabled={saving || adjustQty <= 0}
                style={{ flex: 2, padding: '13px', background: saving || adjustQty <= 0 ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px' }}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Venta local ══════════════════════════════════════════════ */}
      {modal === 'sale' && (
        <div className="inv-modal-wrap">
          <div className="inv-modal-inner" style={{ width: '680px', maxWidth: '100vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Registrar Venta en Local</h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#888' }}>Toca los artículos vendidos — se descuenta del stock</p>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              {products.map(product => (
                <div key={product.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{product.name}</span>
                    {product.code && <CodeChip value={product.code} />}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {product.variants.map(v => {
                      const inSale = saleItems.find(i => i.variantId === v.id);
                      const label = v.sku || [v.size, v.color].filter(Boolean).join(' ');
                      return (
                        <button key={v.id} onClick={() => addSaleItem(v, product.name)} disabled={v.stock === 0}
                          style={{ padding: '9px 13px', fontSize: '12px', fontWeight: 600, cursor: v.stock === 0 ? 'not-allowed' : 'pointer', borderRadius: '6px', border: `1.5px solid ${inSale ? '#d4829a' : v.stock === 0 ? '#f0f0f0' : '#e5e5e5'}`, background: inSale ? '#fdf0f4' : v.stock === 0 ? '#f9f9f9' : '#fff', color: inSale ? '#d4829a' : v.stock === 0 ? '#ccc' : '#333', minHeight: '40px', fontFamily: v.sku ? 'monospace' : 'inherit' }}>
                          {label}
                          <span style={{ color: '#aaa', fontSize: '11px', marginLeft: '4px' }}>({v.stock})</span>
                          {inSale && <span style={{ background: '#d4829a', color: '#fff', borderRadius: '50%', padding: '0 5px', marginLeft: '5px', fontSize: '10px', fontFamily: 'inherit' }}>{inSale.quantity}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {saleItems.length > 0 && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px', marginTop: '10px', flexShrink: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
                  Resumen — {saleItems.reduce((s, i) => s + i.quantity, 0)} artículos
                </p>
                {saleItems.map(item => (
                  <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontFamily: item.sku ? 'monospace' : 'inherit', fontWeight: item.sku ? 700 : 400, color: item.sku ? '#2e7d32' : '#333' }}>
                      {item.sku || `${item.productName} — ${item.size} ${item.color}`}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => setSaleItems(p => p.map(i => i.variantId === item.variantId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} style={{ width: '32px', height: '32px', border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer', borderRadius: '6px', fontSize: '16px' }}>−</button>
                      <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => setSaleItems(p => p.map(i => i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i))} style={{ width: '32px', height: '32px', border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer', borderRadius: '6px', fontSize: '16px' }}>+</button>
                      <button onClick={() => setSaleItems(p => p.filter(i => i.variantId !== item.variantId))} style={{ color: '#e53935', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                ))}
                <button onClick={handleSale} disabled={saving}
                  style={{ width: '100%', marginTop: '12px', padding: '14px', background: saving ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '8px' }}>
                  {saving ? 'Registrando...' : 'Confirmar venta y descontar stock'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL: Editar código / SKU ══════════════════════════════════════ */}
      {modal === 'editCode' && selProduct && (
        <div className="inv-modal-wrap">
          <div className="inv-modal-inner" style={{ width: '500px', maxWidth: '100vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Códigos — {selProduct.name}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ marginBottom: '18px', padding: '14px', background: '#f8f8f8', borderRadius: '8px', flexShrink: 0 }}>
              <label style={lbl}>Código del producto</label>
              <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Ej: VES-001, BLU-023, PAN-007</p>
              <input value={editingCode} onChange={e => setEditingCode(e.target.value.toUpperCase())}
                placeholder="Ej: VES-001" style={{ ...inp, fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1px' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ ...lbl, margin: 0 }}>SKU por variante</label>
                <button onClick={handleAutoFill} style={{ fontSize: '11px', color: '#1976d2', background: 'none', border: '1.5px solid #1976d2', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 700 }}>
                  ⚡ Auto-generar
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 12px' }}>Formato: {editingCode || 'CODIGO'}-TALLA-COL</p>

              {selProduct.variants.map(v => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: '0 0 auto', minWidth: '90px', fontSize: '12px', color: '#555', background: '#f0f0f0', padding: '5px 9px', borderRadius: '5px' }}>
                    {[v.size, v.color].filter(Boolean).join(' · ')}
                  </div>
                  <input value={editingSkus[v.id] ?? ''} onChange={e => setEditingSkus(p => ({ ...p, [v.id]: e.target.value.toUpperCase() }))}
                    placeholder={autoSku(editingCode, v.size, v.color)}
                    style={{ ...inp, flex: 1, fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.5px', marginBottom: 0 }} />
                </div>
              ))}
            </div>

            {skuError && (
              <p style={{ color: '#e53935', fontSize: '12px', margin: '10px 0 0', padding: '8px 12px', background: '#ffebee', borderRadius: '6px', flexShrink: 0 }}>{skuError}</p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '13px', background: '#fff', border: '1.5px solid #e5e5e5', fontSize: '13px', cursor: 'pointer', borderRadius: '6px' }}>Cancelar</button>
              <button onClick={handleSaveCodes} disabled={skuSaving}
                style={{ flex: 2, padding: '13px', background: skuSaving ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '6px' }}>
                {skuSaving ? 'Guardando...' : 'Guardar códigos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Historial ════════════════════════════════════════════════ */}
      {modal === 'history' && (
        <div className="inv-modal-wrap">
          <div className="inv-modal-inner inv-modal-history" style={{ width: '760px', maxWidth: '100vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Historial de Movimientos</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* Vista tablet/desktop */}
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }} className="inv-table-wrap">
                <thead>
                  <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                    {['Fecha', 'Producto', 'SKU / Variante', 'Tipo', 'Cant.', 'Nota'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((m: any) => {
                    const typeColor: Record<string, string> = { SALE_ONLINE: '#e53935', SALE_LOCAL: '#d4829a', RESTOCK: '#4caf50', ADJUSTMENT: '#f57f17' };
                    const typeLabel: Record<string, string> = { SALE_ONLINE: 'Online', SALE_LOCAL: 'Local', RESTOCK: 'Restock', ADJUSTMENT: 'Ajuste' };
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px 12px', fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>
                          {new Date(m.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600 }}>{m.variant?.product?.name}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {m.variant?.sku
                            ? <CodeChip value={m.variant.sku} green />
                            : <span style={{ fontSize: '12px', color: '#aaa' }}>{m.variant?.size} {m.variant?.color}</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: (typeColor[m.type] || '#aaa') + '22', color: typeColor[m.type] || '#aaa' }}>
                            {typeLabel[m.type] || m.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: m.quantity > 0 ? '#4caf50' : '#e53935' }}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888' }}>{m.note || '—'}</td>
                      </tr>
                    );
                  })}
                  {history.length === 0 && <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#bbb' }}>Sin movimientos</td></tr>}
                </tbody>
              </table>

              {/* Vista móvil — lista de cards */}
              <div className="inv-product-cards" style={{ gap: '10px' }}>
                {history.map((m: any) => {
                  const typeColor: Record<string, string> = { SALE_ONLINE: '#e53935', SALE_LOCAL: '#d4829a', RESTOCK: '#4caf50', ADJUSTMENT: '#f57f17' };
                  const typeLabel: Record<string, string> = { SALE_ONLINE: 'Online', SALE_LOCAL: 'Local', RESTOCK: 'Restock', ADJUSTMENT: 'Ajuste' };
                  return (
                    <div key={m.id} style={{ background: '#f8f8f8', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 600 }}>{m.variant?.product?.name}</p>
                        {m.variant?.sku
                          ? <CodeChip value={m.variant.sku} green />
                          : <span style={{ fontSize: '12px', color: '#aaa' }}>{m.variant?.size} {m.variant?.color}</span>}
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#aaa' }}>
                          {new Date(m.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: m.quantity > 0 ? '#4caf50' : '#e53935' }}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </p>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: (typeColor[m.type] || '#aaa') + '22', color: typeColor[m.type] || '#aaa' }}>
                          {typeLabel[m.type] || m.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {history.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>Sin movimientos</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

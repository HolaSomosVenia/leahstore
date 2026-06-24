'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  category?: { name: string; id: string };
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

const PAGE_SIZE = 16;

const PRICE_RANGES = [
  { label: 'Todos los precios', min: 0, max: Infinity },
  { label: 'Menos de $30', min: 0, max: 30 },
  { label: '$30 – $60', min: 30, max: 60 },
  { label: '$60 – $100', min: 60, max: 100 },
  { label: 'Más de $100', min: 100, max: Infinity },
];

const SORT_OPTIONS = [
  { value: '', label: 'Orden predeterminado' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(0);
  const [sort, setSort] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async (catId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const cat = catId ?? selectedCategory;
      if (cat) params.append('category', cat);
      const search = searchParams.get('search');
      if (search) params.append('search', search);
      const res = await api.get(`/products?${params.toString()}`);
      const data = res.data?.data || res.data || [];
      setAllProducts(Array.isArray(data) ? data : []);
      setVisible(PAGE_SIZE);
    } catch { setAllProducts([]); }
    finally { setLoading(false); }
  }, [searchParams, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    api.get('/products/categories/all').then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  // Client-side filter + sort
  const range = PRICE_RANGES[priceRange];
  const filtered = allProducts
    .filter(p => {
      const price = Number(p.price);
      return price >= range.min && price <= range.max;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sort === 'price_asc') return Number(a.price) - Number(b.price);
      if (sort === 'price_desc') return Number(b.price) - Number(a.price);
      return 0;
    });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    fetchProducts(catId);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Page title */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
          {searchParams.get('search') ? `Resultados: "${searchParams.get('search')}"` : 'Tienda'}
        </h1>
      </div>

      {/* Botón filtros móvil */}
      <div className="show-mobile" style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid #eee', gap: '10px' }}>
        <button onClick={() => setShowFilters(true)} style={{ flex: 1, padding: '10px', border: '1.5px solid #1a1a1a', background: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
          ☰ Filtros
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ flex: 1, padding: '10px', border: '1.5px solid #ddd', fontSize: '12px', color: '#555', background: '#fff' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Drawer filtros móvil */}
      {showFilters && (
        <>
          <div onClick={() => setShowFilters(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 998 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '80vw', maxWidth: '300px', background: '#fff', zIndex: 999, padding: '24px 20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Filtros</h3>
              <button onClick={() => setShowFilters(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px', color: '#1a1a1a' }}>Categorías</h4>
            {['', ...categories.map(c => c.id)].map((id, i) => (
              <button key={id} onClick={() => { handleCategoryChange(id); setShowFilters(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', color: selectedCategory === id ? '#d4829a' : '#555', fontWeight: selectedCategory === id ? 700 : 400, borderLeft: selectedCategory === id ? '2px solid #d4829a' : '2px solid transparent' }}>
                {i === 0 ? 'Todo' : categories[i - 1]?.name}
              </button>
            ))}
            <h4 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '20px 0 12px', color: '#1a1a1a' }}>Precio</h4>
            {PRICE_RANGES.map((r, i) => (
              <button key={i} onClick={() => { setPriceRange(i); setShowFilters(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer', color: priceRange === i ? '#d4829a' : '#555', fontWeight: priceRange === i ? 700 : 400, borderLeft: priceRange === i ? '2px solid #d4829a' : '2px solid transparent' }}>
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

        {/* ── Sidebar desktop ── */}
        <aside className="hide-mobile" style={{ width: '220px', flexShrink: 0 }}>

          {/* Categorías */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 16px', color: '#1a1a1a' }}>
              Categorías
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => handleCategoryChange('')}
                style={{
                  textAlign: 'left', padding: '7px 0', background: 'none', border: 'none',
                  fontSize: '13px', cursor: 'pointer',
                  color: !selectedCategory ? '#d4829a' : '#555',
                  fontWeight: !selectedCategory ? 700 : 400,
                  borderLeft: !selectedCategory ? '2px solid #d4829a' : '2px solid transparent',
                  paddingLeft: '10px', transition: 'all 0.15s',
                }}
              >
                Todo
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{
                    textAlign: 'left', padding: '7px 0', background: 'none', border: 'none',
                    fontSize: '13px', cursor: 'pointer',
                    color: selectedCategory === cat.id ? '#d4829a' : '#555',
                    fontWeight: selectedCategory === cat.id ? 700 : 400,
                    borderLeft: selectedCategory === cat.id ? '2px solid #d4829a' : '2px solid transparent',
                    paddingLeft: '10px', transition: 'all 0.15s',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 16px', color: '#1a1a1a' }}>
              Precio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(i)}
                  style={{
                    textAlign: 'left', padding: '7px 0', background: 'none', border: 'none',
                    fontSize: '13px', cursor: 'pointer',
                    color: priceRange === i ? '#d4829a' : '#555',
                    fontWeight: priceRange === i ? 700 : 400,
                    borderLeft: priceRange === i ? '2px solid #d4829a' : '2px solid transparent',
                    paddingLeft: '10px', transition: 'all 0.15s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Limpiar filtros */}
          {(selectedCategory || priceRange > 0 || sort) && (
            <button
              onClick={() => { setSelectedCategory(''); setPriceRange(0); setSort(''); fetchProducts(''); }}
              style={{
                fontSize: '11px', color: '#999', background: 'none', border: '1px solid #ddd',
                padding: '8px 14px', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
                width: '100%',
              }}
            >
              × Limpiar filtros
            </button>
          )}
        </aside>

        {/* ── Productos ── */}
        <div style={{ flex: 1 }}>
          {/* Top bar: count + sort — solo desktop */}
          <div className="hide-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: 0, letterSpacing: '0.5px' }}>
              {!loading && `Mostrando ${shown.length} de ${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
            </p>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                padding: '8px 14px', border: '1px solid #ddd', fontSize: '12px',
                color: '#555', background: '#fff', cursor: 'pointer', outline: 'none',
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div style={{ paddingBottom: '133%', background: '#f0f0f0', marginBottom: '12px' }} />
                  <div style={{ height: '13px', background: '#f0f0f0', marginBottom: '8px', width: '80%' }} />
                  <div style={{ height: '13px', background: '#f0f0f0', width: '40%' }} />
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb' }}>
                No se encontraron productos
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px 20px' }}>
                {shown.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Cargar más */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '16px', letterSpacing: '0.5px' }}>
                    Mostrando {shown.length} de {filtered.length} productos
                  </p>
                  <button
                    onClick={() => setVisible(v => v + PAGE_SIZE)}
                    style={{
                      padding: '13px 40px', border: '1.5px solid #1a1a1a', background: '#fff',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = '#1a1a1a'; }}
                  >
                    Cargar más
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#aaa' }}>Cargando productos...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

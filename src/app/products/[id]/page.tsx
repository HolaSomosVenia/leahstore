'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import api from '@/lib/api';

interface Variant { id: string; size?: string; color?: string; stock: number; }
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  category: { id: string; name: string };
  variants: Variant[];
  createdAt?: string;
}

const DIVISA_DISCOUNT = 0.05; // 5% por pagar en divisas

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart(s => s.addItem);
  const { currency, setCurrency, eurToBs, format, rateUpdatedAt } = useCurrency();

  const productId = params.id as string;

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || '',
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        {[1, 2].map(i => <div key={i} style={{ background: '#f0f0f0', borderRadius: '6px', height: '500px' }} />)}
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <div style={{ textAlign: 'center', padding: '100px 32px' }}>
        <p style={{ color: '#aaa', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Producto no encontrado</p>
        <Link href="/products" style={{ marginTop: '20px', display: 'inline-block', color: '#d4829a', fontSize: '13px' }}>← Volver a la tienda</Link>
      </div>
    </div>
  );

  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];
  const priceEUR = Number(product.price);
  const comparePriceEUR = product.comparePrice ? Number(product.comparePrice) : null;
  const isOffer = comparePriceEUR && comparePriceEUR > priceEUR;
  const priceInBs = eurToBs > 0 ? priceEUR * eurToBs : null;
  const discountedPriceEUR = priceEUR * (1 - DIVISA_DISCOUNT);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '14px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '8px', fontSize: '11px', color: '#aaa', letterSpacing: '0.5px' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#aaa', textDecoration: 'none' }}>Tienda</Link>
          {product.category && <><span>/</span><Link href={`/products?category=${product.category.id}`} style={{ color: '#aaa', textDecoration: 'none' }}>{product.category.name}</Link></>}
          <span>/</span>
          <span style={{ color: '#333' }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>

        {/* ── Imágenes ── */}
        <div>
          {/* Imagen principal */}
          <div style={{ background: '#f5f5f5', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px', position: 'relative', paddingBottom: '120%' }}>
            {product.images?.[mainImg] ? (
              <img src={product.images[mainImg]} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '13px' }}>Sin imagen</div>
            )}
            {isOffer && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#e53935', color: '#fff', padding: '4px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', borderRadius: '2px' }}>OFERTA</div>
            )}
          </div>
          {/* Miniaturas */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.images.slice(0, 5).map((img, i) => (
                <div key={i} onClick={() => setMainImg(i)} style={{ width: '72px', height: '90px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${mainImg === i ? '#d4829a' : 'transparent'}`, flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info producto ── */}
        <div>
          {/* Categoría */}
          {product.category && (
            <Link href={`/products?category=${product.category.id}`} style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#d4829a', textDecoration: 'none', fontWeight: 700 }}>
              {product.category.name}
            </Link>
          )}

          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px', margin: '10px 0 20px', lineHeight: 1.2 }}>{product.name}</h1>

          {/* ── Selector moneda ── */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>Ver precio en:</span>
            {(['EUR', 'VES'] as const).map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: '5px 14px', fontSize: '12px', fontWeight: 700,
                background: currency === c ? '#1a1a1a' : '#fff',
                color: currency === c ? '#fff' : '#555',
                border: `1.5px solid ${currency === c ? '#1a1a1a' : '#ddd'}`,
                borderRadius: '3px', cursor: 'pointer',
              }}>
                {c === 'EUR' ? '€ Euros' : 'Bs. Bolívares'}
              </button>
            ))}
          </div>

          {/* ── Precio principal ── */}
          <div style={{ marginBottom: '24px', padding: '20px', background: '#faf8f6', borderRadius: '8px', border: '1px solid #f0e8ec' }}>
            {currency === 'EUR' ? (
              <>
                {isOffer && comparePriceEUR && (
                  <p style={{ fontSize: '14px', color: '#aaa', textDecoration: 'line-through', margin: '0 0 4px' }}>€{comparePriceEUR.toFixed(2)}</p>
                )}
                <p style={{ fontSize: '32px', fontWeight: 700, color: isOffer ? '#e53935' : '#1a1a1a', margin: 0, letterSpacing: '-1px' }}>
                  €{priceEUR.toFixed(2)}
                </p>
                <p style={{ fontSize: '12px', color: '#aaa', margin: '6px 0 0' }}>Precio en Euros</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '-1px' }}>
                  {priceInBs ? `Bs.${priceInBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })}` : 'Cargando...'}
                </p>
                {eurToBs > 0 && (
                  <p style={{ fontSize: '11px', color: '#aaa', margin: '6px 0 0' }}>
                    Tasa BCV: 1€ = {eurToBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.
                    {rateUpdatedAt && <span style={{ marginLeft: '6px' }}>· Actualizado hoy</span>}
                  </p>
                )}
              </>
            )}

            {/* Descuento por divisas */}
            <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fff8e1', borderRadius: '6px', border: '1px solid #ffe082' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#f57f17', margin: '0 0 2px' }}>
                ✦ 5% de descuento pagando en divisas
              </p>
              {currency === 'EUR' ? (
                <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                  Con descuento: <strong>€{discountedPriceEUR.toFixed(2)}</strong>
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                  Equivale a{' '}
                  <strong>€{priceEUR.toFixed(2)}</strong> pagando en euros
                  {priceInBs && <span style={{ color: '#aaa' }}> · €{discountedPriceEUR.toFixed(2)} con descuento divisas</span>}
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: '24px' }}>{product.description}</p>
          )}

          {/* Tallas */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#333', margin: '0 0 10px' }}>Talla</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sizes.map(size => (
                  <button key={size as string} onClick={() => setSelectedSize(size as string)} style={{
                    width: '44px', height: '44px', border: `1.5px solid ${selectedSize === size ? '#1a1a1a' : '#ddd'}`,
                    background: selectedSize === size ? '#1a1a1a' : '#fff',
                    color: selectedSize === size ? '#fff' : '#333',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px',
                  }}>{size as string}</button>
                ))}
              </div>
            </div>
          )}

          {/* Colores */}
          {colors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#333', margin: '0 0 10px' }}>Color</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colors.map(color => (
                  <button key={color as string} onClick={() => setSelectedColor(color as string)} style={{
                    padding: '6px 16px', border: `1.5px solid ${selectedColor === color ? '#1a1a1a' : '#ddd'}`,
                    background: selectedColor === color ? '#1a1a1a' : '#fff',
                    color: selectedColor === color ? '#fff' : '#333',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', borderRadius: '3px',
                  }}>{color as string}</button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#333', margin: '0 0 10px' }}>Cantidad</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid #ddd', borderRadius: '3px', width: 'fit-content' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '44px', height: '44px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#333' }}>−</button>
              <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '44px', height: '44px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#333' }}>+</button>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={handleAddToCart} style={{
              padding: '16px', background: added ? '#4caf50' : '#1a1a1a', color: '#fff',
              border: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', cursor: 'pointer', borderRadius: '3px',
              transition: 'background 0.3s',
            }}>
              {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
            </button>
            <Link href="/cart" style={{
              display: 'block', textAlign: 'center', padding: '16px',
              background: '#fff', color: '#1a1a1a', border: '1.5px solid #1a1a1a',
              fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: '3px',
            }}>
              Ver carrito
            </Link>
          </div>

          {/* Info adicional */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '🚚', text: 'Delivery desde $3 · Envíos por MRW y Zoom' },
                { icon: '🔄', text: '3 días para cambios desde la recepción' },
                { icon: '💬', text: 'Consultas por WhatsApp 0412-0759209' },
              ].map(item => (
                <div key={item.icon} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <p style={{ fontSize: '12px', color: '#777', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 24px 16px !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}

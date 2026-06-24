'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: string[];
  category?: { name: string };
  createdAt?: string;
}

export function ProductCard({ product, showNew, showOffer }: { product: Product; showNew?: boolean; showOffer?: boolean }) {
  const isNew = showNew ?? (product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 30 : false);
  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price);
  const isOffer = showOffer ?? hasDiscount;
  const img1 = product.images?.[0] || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=533&fit=crop';
  const img2 = product.images?.[1] || img1;
  const priceUSD = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const [hovered, setHovered] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const { format } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: priceUSD, image: img1, quantity: 1 });
  };

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isNew && !isOffer && (
            <span style={{ background: '#e53935', color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', padding: '4px 8px', textTransform: 'uppercase' }}>
              Nuevo
            </span>
          )}
          {isOffer && (
            <span style={{ background: '#e53935', color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', padding: '4px 8px', textTransform: 'uppercase' }}>
              Oferta
            </span>
          )}
        </div>

        {/* Image — 3:4 portrait ratio like 270x405 */}
        <div
          style={{ position: 'relative', paddingBottom: '133.33%', overflow: 'hidden', background: '#f5f5f5', marginBottom: '10px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={img1}
            alt={product.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: hovered ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          />
          <img
            src={img2}
            alt={product.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          />

          {/* "Seleccionar opciones" overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(255,255,255,0.96)',
            padding: '12px 0', textAlign: 'center',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'all 0.25s ease',
          }}>
            <button
              onClick={handleAddToCart}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
                textTransform: 'uppercase', color: '#000', padding: '0',
              }}
            >
              Seleccionar opciones
            </button>
          </div>
        </div>

        {/* Product info */}
        <div style={{ paddingRight: '8px' }}>
          <h3 style={{
            fontSize: '13px', fontWeight: 400, color: '#1a1a1a',
            marginBottom: '5px', lineHeight: 1.35,
          }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: isOffer ? '#e53935' : '#000', margin: 0 }}>
              {format(priceUSD)}
            </p>
            {isOffer && product.comparePrice && (
              <p style={{ fontSize: '12px', color: '#aaa', textDecoration: 'line-through', margin: 0 }}>
                {format(Number(product.comparePrice))}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

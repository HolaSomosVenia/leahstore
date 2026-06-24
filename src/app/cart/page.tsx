'use client';

import { useState } from 'react';
import Link from 'next/link';

const POLICIES = [
  {
    id: 'terms',
    title: 'Términos y Condiciones',
    icon: '📋',
    body: 'Al finalizar tu compra, aceptas que eres mayor de edad y que los datos proporcionados son correctos. Nos reservamos el derecho de cancelar órdenes por errores de inventario o fallas del sistema. El proceso de compra se formaliza una vez verificado el pago.',
  },
  {
    id: 'privacy',
    title: 'Privacidad y Datos',
    icon: '🔒',
    body: 'Tus datos personales y de pago están 100% protegidos. Solo los utilizamos para procesar tu pedido y mejorar tu experiencia. No compartimos tu información con terceros bajo ningún concepto.',
  },
  {
    id: 'shipping',
    title: 'Envíos y Entregas',
    icon: '🚚',
    body: 'Maracaibo: entregas mediante delivery en un lapso de 24 a 48 horas hábiles (costo variable según la zona). Nacional: envíos cobro en destino (COD) a través de MRW / Zoom / Tealca. El tiempo de entrega final depende de la empresa de encomiendas.',
  },
  {
    id: 'returns',
    title: 'Cambios y Devoluciones',
    icon: '🔄',
    body: 'Dispones de 7 días continuos tras recibir tu producto para solicitar un cambio, únicamente por defecto de fábrica. El artículo debe estar sin usar y en su empaque original. No realizamos reembolsos en dinero; se emitirá una nota de crédito en la tienda.',
  },
  {
    id: 'prices',
    title: 'Precios y Métodos de Pago',
    icon: '💳',
    body: 'Todos los precios están expresados en Euro (€) / Bs. BCV. Métodos aceptados: Pago Móvil, Zelle, USDT (Binance) y Efectivo solo para entregas personales en Maracaibo. El pedido se procesará una vez confirmado el ingreso del dinero.',
  },
];

function PolicyAccordion() {
  const [open, setOpen] = useState<string | null>(null);
  const [masterOpen, setMasterOpen] = useState(false);

  return (
    <div style={{ marginTop: '14px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header principal del acordeón */}
      <button
        onClick={() => setMasterOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: '#fafafa', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '8px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px' }}>📄</span>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666' }}>
            Políticas de la Tienda
          </span>
        </div>
        <span style={{ fontSize: '16px', color: '#aaa', transform: masterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', lineHeight: 1 }}>
          ›
        </span>
      </button>

      {/* Panel colapsable */}
      {masterOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          {POLICIES.map((policy, idx) => (
            <div key={policy.id} style={{ borderBottom: idx < POLICIES.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
              {/* Fila de cada política */}
              <button
                onClick={() => setOpen(open === policy.id ? null : policy.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px' }}>{policy.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>{policy.title}</span>
                </div>
                <span style={{ fontSize: '14px', color: '#bbb', transform: open === policy.id ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s', display: 'inline-block', lineHeight: 1, flexShrink: 0 }}>
                  ›
                </span>
              </button>
              {/* Contenido expandido */}
              {open === policy.id && (
                <div style={{ padding: '0 16px 14px 36px' }}>
                  <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.7, margin: 0 }}>{policy.body}</p>
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: '10px 16px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '10px', color: '#bbb', margin: 0, textAlign: 'center', letterSpacing: '0.5px' }}>
              Al proceder al checkout aceptas estas políticas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const DIVISA_DISCOUNT = 0.05;
type PayMethod = 'divisas' | 'bolivares';

function fmt(eur: number, method: PayMethod, eurToBs: number): string {
  if (method === 'bolivares' && eurToBs > 0)
    return `Bs. ${(eur * eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}`;
  return `€${eur.toFixed(2)}`;
}

export default function CartPage() {
  const items          = useCart(s => s.items);
  const removeItem     = useCart(s => s.removeItem);
  const updateQuantity = useCart(s => s.updateQuantity);
  const getTotal       = useCart(s => s.getTotal);
  const { eurToBs, rateUpdatedAt } = useCurrency();

  const [payMethod, setPayMethod] = useState<PayMethod>('divisas');

  const subtotalEUR = getTotal();
  const discountEUR = payMethod === 'divisas' ? subtotalEUR * DIVISA_DISCOUNT : 0;
  const totalEUR    = subtotalEUR - discountEUR;
  const F = (eur: number) => fmt(eur, payMethod, eurToBs);

  /* Carrito vacío */
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 32px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f5e8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#d4829a" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 12px' }}>Tu carrito está vacío</h2>
          <p style={{ fontSize: '14px', color: '#aaa', margin: '0 0 32px' }}>Explora nuestras colecciones y agrega algo que te encante</p>
          <Link href="/products" style={{ display: 'inline-block', background: '#1a1a1a', color: '#fff', padding: '14px 40px', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '3px' }}>
            Ver Tienda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />

      {/* Título */}
      <div style={{ borderBottom: '1px solid #ebebeb', padding: '28px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
          Tu Carrito ({items.reduce((s, i) => s + i.quantity, 0)} artículo{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
        </h1>
      </div>

      <div className="cart-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'grid', gap: '48px', alignItems: 'start' }}>

        {/* ── Lista de productos ───────────────────────────────────────── */}
        <div>
          {/* Tasa BCV */}
          {eurToBs > 0 && (
            <div style={{ padding: '10px 16px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#aaa' }}>Tasa BCV oficial:</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>1€ = {eurToBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.</span>
              {rateUpdatedAt && <span style={{ fontSize: '11px', color: '#bbb' }}>· Actualizada hoy</span>}
            </div>
          )}

          {items.map(item => {
            const priceEUR = Number(item.price);
            const lineTotal = priceEUR * item.quantity;
            const lineFinal = payMethod === 'divisas' ? lineTotal * (1 - DIVISA_DISCOUNT) : lineTotal;
            return (
              <div key={item.productId} style={{ display: 'flex', gap: '20px', padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}>

                {/* Imagen */}
                <div style={{ width: '90px', height: '120px', borderRadius: '4px', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '11px' }}>Sin imagen</div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' }}>{item.name}</p>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#aaa', marginBottom: '12px' }}>
                    {item.size  && <span>Talla: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>

                  {/* Controles de cantidad */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e5e5', borderRadius: '3px', width: 'fit-content' }}>
                    <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} style={{ width: '36px', height: '36px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#333' }}>−</button>
                    <span style={{ width: '36px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#333' }}>+</button>
                  </div>
                </div>

                {/* Precio + eliminar */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '90px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{F(lineFinal)}</p>
                    {payMethod === 'divisas' && (
                      <p style={{ fontSize: '11px', color: '#bbb', textDecoration: 'line-through', margin: '3px 0 0' }}>{F(lineTotal)}</p>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#ccc', cursor: 'pointer', letterSpacing: '0.5px', textAlign: 'right' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}

          <Link href="/products" style={{ display: 'inline-block', marginTop: '24px', fontSize: '12px', color: '#888', textDecoration: 'none', letterSpacing: '1px' }}>
            ← Seguir comprando
          </Link>
        </div>

        {/* ── Resumen ──────────────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <div style={{ background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '8px', overflow: 'hidden' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Resumen del Pedido</h3>
            </div>

            <div style={{ padding: '24px' }}>

              {/* Método de pago */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#333', margin: '0 0 12px' }}>Método de Pago</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {([
                    { value: 'divisas',   label: '€ Divisas (Euros / USD)', desc: '5% de descuento',    bg: '#fffde7', border: '#ffe082', color: '#f57f17' },
                    { value: 'bolivares', label: 'Bs. Bolívares',           desc: 'Tasa BCV oficial',   bg: '#fff',    border: '#ddd',   color: '#555' },
                  ] as const).map(opt => (
                    <label key={opt.value} onClick={() => setPayMethod(opt.value)} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '6px', cursor: 'pointer', background: payMethod === opt.value ? opt.bg : '#fafafa', border: `1.5px solid ${payMethod === opt.value ? opt.border : '#eee'}`, transition: 'all 0.15s' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${payMethod === opt.value ? '#d4829a' : '#ccc'}`, background: payMethod === opt.value ? '#d4829a' : '#fff', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {payMethod === opt.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px', color: '#1a1a1a' }}>{opt.label}</p>
                        <p style={{ fontSize: '11px', margin: 0, color: opt.color, fontWeight: 600 }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Desglose */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{F(subtotalEUR)}</span>
                </div>

                {payMethod === 'divisas' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 700 }}>✦ Descuento divisas (5%)</span>
                    <span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 700 }}>−{F(discountEUR)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 0', borderTop: '1px solid #eee' }}>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Envío</span>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Se elige en el checkout</span>
                </div>

                <div style={{ borderTop: '1.5px solid #1a1a1a', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>Total</span>
                    <p style={{ fontSize: '10px', color: '#aaa', margin: '2px 0 0' }}>+ envío según destino</p>
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>{F(totalEUR)}</span>
                </div>

                {payMethod === 'divisas' && (
                  <p style={{ fontSize: '11px', color: '#888', padding: '10px 12px', background: '#fffde7', borderRadius: '4px', lineHeight: 1.5, margin: 0 }}>
                    Pago en efectivo EUR/USD o por transferencia. El descuento se aplica al total de productos.
                  </p>
                )}
              </div>

              {/* CTA */}
              <div style={{ marginTop: '24px' }}>
                <Link href="/checkout" style={{ display: 'block', textAlign: 'center', padding: '15px', background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '3px' }}>
                  Proceder al Checkout →
                </Link>
              </div>
            </div>
          </div>

          {/* Métodos aceptados */}
          <div style={{ marginTop: '14px', padding: '14px 16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px' }}>Métodos de pago aceptados</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {['Pago Móvil', 'Zelle', 'Binance', 'Efectivo EUR', 'Efectivo USD'].map(m => (
                <span key={m} style={{ fontSize: '10px', padding: '3px 8px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '3px', color: '#555', fontWeight: 600 }}>{m}</span>
              ))}
            </div>
          </div>

          {/* Políticas colapsables */}
          <PolicyAccordion />
        </div>
      </div>

      <style>{`
        .cart-grid { grid-template-columns: 1fr 360px; }
        @media (max-width: 860px) { .cart-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Footer />
    </div>
  );
}

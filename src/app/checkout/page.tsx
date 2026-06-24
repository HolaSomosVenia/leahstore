'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Header } from '@/components/Header';
import Link from 'next/link';
import api from '@/lib/api';

type PayMethod = 'PAGO_MOVIL' | 'ZELLE' | 'BINANCE';
type ShipType  = 'LOCAL' | 'ZOOM' | 'MRW' | 'PICKUP';

interface CartItem { productId: string; name: string; price: number; quantity: number; image?: string; size?: string; color?: string }

const WA_NUMBER = '584120759209';
const DISC_RATE = 0.05;

const SHIPPING = [
  { id: 'LOCAL'  as ShipType, label: 'Delivery local',   sub: 'Entrega en tu ciudad · Pago anticipado',      price: 3    as number | null, badge: '€3',          badgeC: '#1976d2' },
  { id: 'PICKUP' as ShipType, label: 'Retiro en tienda', sub: 'Recoge tu pedido sin costo de envío',          price: 0    as number | null, badge: 'Gratis',      badgeC: '#4caf50' },
  { id: 'ZOOM'   as ShipType, label: 'Zoom (nacional)',  sub: 'Envío a todo el país · Pago al recibir',       price: null as number | null, badge: 'Contraparte', badgeC: '#f57c00' },
  { id: 'MRW'    as ShipType, label: 'MRW (nacional)',   sub: 'Envío a todo el país · Pago al recibir',       price: null as number | null, badge: 'Contraparte', badgeC: '#f57c00' },
];

const PAYMENTS = [
  { id: 'PAGO_MOVIL' as PayMethod, icon: '🏦', label: 'Pago Móvil (Bs.)',  sub: 'BDV · Banesco · Centenario · Tasa BCV oficial',       divisa: false },
  { id: 'ZELLE'      as PayMethod, icon: '💵', label: 'Zelle (USD)',        sub: 'Dólares americanos · Incluye 5% de descuento',        divisa: true  },
  { id: 'BINANCE'    as PayMethod, icon: '₿',  label: 'Binance Pay (USDT)', sub: 'Criptomonedas USDT · Incluye 5% de descuento',       divisa: true  },
];

const PAY_DETAILS: Record<PayMethod, string[]> = {
  PAGO_MOVIL: ['Banco de Venezuela · Tlf: 0412-XXX-XXXX · C.I: V-12.345.678', 'Banesco · Tlf: 0414-XXX-XXXX · C.I: V-12.345.678'],
  ZELLE:      ['Correo Zelle: pagos@leah.com', 'Titular: Leah'],
  BINANCE:    ['Binance ID: 123456789', 'Moneda: USDT (TRC-20 o BEP-20)'],
};

function row(label: string, value: React.ReactNode, vColor = '#1a1a1a', bold = false) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '13px', color: '#666' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: bold ? 700 : 500, color: vColor }}>{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  const liveItems    = useCart(s => s.items);
  const getTotal     = useCart(s => s.getTotal);
  const clearCart    = useCart(s => s.clearCart);
  const { eurToBs }  = useCurrency();

  const [step, setStep]         = useState<'info' | 'payment' | 'confirm'>('info');
  const [ship, setShip]         = useState<ShipType>('LOCAL');
  const [pay,  setPay]          = useState<PayMethod>('PAGO_MOVIL');
  const [orderId, setOrderId]   = useState(`LEAH-${Date.now().toString().slice(-6)}`);
  const [form, setForm]         = useState({ name: '', email: '', phone: '', address: '', city: '', state: '' });
  const [snap, setSnap]         = useState<{ items: CartItem[]; subtotal: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [isMember, setIsMember]         = useState(false);
  const [memberChecked, setMemberChecked] = useState(false);

  const checkMembership = async (email: string) => {
    if (!email || memberChecked) return;
    try {
      const { data } = await api.get(`/membership/check?email=${encodeURIComponent(email)}`);
      if (data.isMember && data.freeDelivery) setIsMember(true);
    } catch {}
    setMemberChecked(true);
  };

  // Use snapshotted data after confirmation (cart is cleared)
  const items     = step === 'confirm' && snap ? snap.items : liveItems as CartItem[];
  const subtotal  = step === 'confirm' && snap ? snap.subtotal : getTotal();

  const shipOpt    = SHIPPING.find(s => s.id === ship)!;
  const payOpt     = PAYMENTS.find(p => p.id === pay)!;
  // Miembros con freeDelivery obtienen LOCAL gratis
  const effectiveShipPrice = (isMember && ship === 'LOCAL') ? 0 : shipOpt.price;
  const isContra   = effectiveShipPrice === null;
  const shipCost   = effectiveShipPrice ?? 0;
  const isDivisa   = payOpt.divisa;
  const discount   = isDivisa ? subtotal * DISC_RATE : 0;
  const discSub    = subtotal - discount;
  const total      = discSub + (isContra ? 0 : shipCost);

  // Format helpers
  const eur  = (n: number) => `€${n.toFixed(2)}`;
  const F    = (n: number) =>
    pay === 'PAGO_MOVIL' && eurToBs > 0
      ? `Bs. ${(n * eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}`
      : eur(n);

  const shipDisplay = (colored?: boolean): React.ReactNode => {
    if (isContra)      return <span style={{ color: colored ? '#f57c00' : undefined }}>Contraparte*</span>;
    if (shipCost === 0) return <span style={{ color: colored ? '#4caf50' : undefined }}>Gratis</span>;
    return <span>{eur(shipCost)}</span>;
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmError('');
    try {
      const rawSubtotal = getTotal();
      const isDivisaCheck   = payOpt.divisa;
      const discountCheck   = isDivisaCheck ? rawSubtotal * DISC_RATE : 0;
      const effShipPrice    = (isMember && ship === 'LOCAL') ? 0 : (shipOpt.price ?? 0);
      const totalCheck      = (rawSubtotal - discountCheck) + effShipPrice;

      // ── POST al backend ──────────────────────────────────────────────
      const payload = {
        guestName:       form.name,
        guestEmail:      form.email,
        guestPhone:      form.phone,
        shippingAddress: `${form.address}, ${form.city}${form.state ? ', ' + form.state : ''}`,
        shippingType:    ship,
        paymentMethod:   pay,
        discount:        discountCheck,
        total:           totalCheck,
        notes:           `${payOpt.label} · ${shipOpt.label}${isDivisaCheck ? ' · Desc. divisas 5%' : ''}${isMember ? ' · Miembro Leah' : ''}`,
        items: (liveItems as CartItem[]).map(i => ({
          productId: i.productId,
          quantity:  i.quantity,
          price:     Number(i.price),
          size:      i.size,
          color:     i.color,
        })),
      };

      const { data: savedOrder } = await api.post('/orders', payload);
      const realOrderId = savedOrder?.id?.slice(-6).toUpperCase() || orderId;
      setOrderId(`LEAH-${realOrderId}`);

      // ── Guardar en localStorage para factura ─────────────────────────
      const orderData = {
        orderId: `LEAH-${realOrderId}`,
        date: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }),
        customer: { ...form },
        items: (liveItems as CartItem[]).map(i => ({
          name: i.name, size: i.size, color: i.color,
          quantity: i.quantity, price: Number(i.price),
        })),
        subtotal:  rawSubtotal,
        isDivisa:  isDivisaCheck,
        discount:  discountCheck,
        discSub:   rawSubtotal - discountCheck,
        shipLabel: shipOpt.label,
        shipCost:  effectiveShipPrice,
        payLabel:  payOpt.label,
        payIcon:   payOpt.icon,
        total:     totalCheck,
        eurToBs,
      };
      if (typeof window !== 'undefined')
        localStorage.setItem('leah_last_order', JSON.stringify(orderData));

      setSnap({ items: [...liveItems] as CartItem[], subtotal: rawSubtotal });
      clearCart();
      setStep('confirm');

    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al registrar el pedido. Intenta nuevamente.';
      setConfirmError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setConfirming(false);
    }
  };

  const buildWAMsg = () => {
    const itemsStr = items.map(i =>
      `• ${i.name}${i.size ? ` (Talla ${i.size})` : ''}${i.color ? ` (${i.color})` : ''} ×${i.quantity} — ${eur(Number(i.price) * i.quantity)}`
    ).join('\n');
    return encodeURIComponent(
      `Hola LEAH! 👋\n\n` +
      `Pedido: #${orderId}\n` +
      `Nombre: ${form.name}\n` +
      `Teléfono: ${form.phone}\n` +
      `Email: ${form.email}\n` +
      `Dirección: ${form.address}, ${form.city}${form.state ? ', ' + form.state : ''}\n\n` +
      `══ PRODUCTOS ══\n${itemsStr}\n\n` +
      `Subtotal: ${eur(subtotal)}\n` +
      (isDivisa ? `Descuento divisas (5%): −${eur(discount)}\n` : '') +
      `Envío (${shipOpt.label}): ${isContra ? 'Pago a contraparte' : shipCost === 0 ? 'Gratis' : eur(shipCost)}\n` +
      `Total: ${eur(total)}${isContra ? ' + envío contraparte' : ''}\n\n` +
      `Método de pago: ${payOpt.label}\n\n` +
      `Adjunto comprobante de pago 📎`
    );
  };

  const field = (ph: string, k: keyof typeof form, type = 'text', req = true) => (
    <input
      type={type} placeholder={ph + (req ? ' *' : '')} required={req}
      value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
      style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff' }}
    />
  );

  if (liveItems.length === 0 && step !== 'confirm') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <Header />
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>Tu carrito está vacío</p>
          <Link href="/products" style={{ display: 'inline-block', border: '1.5px solid #000', padding: '13px 40px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#000', textDecoration: 'none', fontWeight: 700, borderRadius: '3px' }}>
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />

      {/* ── Steps bar ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex' }}>
          {[
            { key: 'info',    n: '1', label: 'Información y envío' },
            { key: 'payment', n: '2', label: 'Método de pago' },
            { key: 'confirm', n: '3', label: 'Confirmación' },
          ].map(s => {
            const active  = step === s.key;
            const past    = (s.key === 'info' && (step === 'payment' || step === 'confirm')) ||
                            (s.key === 'payment' && step === 'confirm');
            return (
              <div key={s.key} style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent', marginBottom: '-1px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: active ? '#1a1a1a' : past ? '#4caf50' : '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: active || past ? '#fff' : '#aaa' }}>{past ? '✓' : s.n}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: active ? '#1a1a1a' : past ? '#666' : '#bbb', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' }}>
        <div className="co-grid" style={{ display: 'grid', gap: '32px', alignItems: 'start' }}>

          {/* ── LEFT ────────────────────────────────────────────────── */}
          <div>

            {/* STEP 1 — Información + Envío */}
            {step === 'info' && (
              <form onSubmit={e => { e.preventDefault(); setStep('payment'); }}>
                {/* Contacto */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px', border: '1px solid #e8e8e8' }}>
                  <h2 style={sectionTitle}>Datos de contacto</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {field('Nombre completo', 'name')}
                    {field('Teléfono (WhatsApp)', 'phone')}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email" placeholder="Correo electrónico *" required
                      value={form.email}
                      onChange={e => { setForm({ ...form, email: e.target.value }); setMemberChecked(false); setIsMember(false); }}
                      onBlur={e => checkMembership(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${isMember ? '#4caf50' : '#e0e0e0'}`, borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: isMember ? '#f0faf0' : '#fff' }}
                    />
                    {isMember && (
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 700, color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        ⭐ Miembro Leah
                      </span>
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px', border: '1px solid #e8e8e8' }}>
                  <h2 style={sectionTitle}>Dirección de entrega</h2>
                  <div style={{ marginBottom: '12px' }}>
                    {field('Calle, edificio, piso, apto.', 'address')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {field('Ciudad', 'city')}
                    {field('Estado / Provincia', 'state', 'text', false)}
                  </div>
                </div>

                {/* Tipo de envío */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', border: '1px solid #e8e8e8' }}>
                  <h2 style={sectionTitle}>Tipo de envío</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {SHIPPING.map(opt => {
                      const active = ship === opt.id;
                      const memberFree = isMember && opt.id === 'LOCAL';
                      const displayPrice = memberFree ? 0 : opt.price;
                      return (
                        <label key={opt.id} onClick={() => setShip(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', border: `2px solid ${active ? '#1a1a1a' : '#e8e8e8'}`, borderRadius: '8px', background: active ? '#fafafa' : '#fff', transition: 'border-color 0.15s, background 0.15s' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${active ? '#1a1a1a' : '#ccc'}`, background: active ? '#1a1a1a' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{opt.label}</span>
                              {memberFree
                                ? <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e8f5e920', color: '#2e7d32' }}>⭐ Miembro</span>
                                : <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: opt.badgeC + '18', color: opt.badgeC }}>{opt.badge}</span>
                              }
                            </div>
                            <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{memberFree ? 'Gratis por ser miembro Leah (≤3km)' : opt.sub}</p>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', color: displayPrice === null ? '#f57c00' : displayPrice === 0 ? '#4caf50' : '#1a1a1a' }}>
                            {displayPrice === null ? 'Contraparte' : displayPrice === 0 ? 'Gratis' : `€${displayPrice}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {isContra && (
                    <div style={{ marginTop: '14px', padding: '13px 16px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', fontSize: '12px', color: '#7a5800', lineHeight: 1.6 }}>
                      <strong>Pago a contraparte:</strong> el courier se abona directamente al recibir el paquete. No se incluye en el total de la orden.
                    </div>
                  )}
                </div>

                <button type="submit" style={btnPrimary}>Continuar al pago →</button>
              </form>
            )}

            {/* STEP 2 — Método de pago */}
            {step === 'payment' && (
              <div>
                {/* Resumen de envío seleccionado */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 24px', marginBottom: '16px', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '22px' }}>📦</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px' }}>{shipOpt.label}</p>
                    <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{shipOpt.sub}</p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: isContra ? '#f57c00' : shipCost === 0 ? '#4caf50' : '#1a1a1a' }}>
                    {isContra ? 'Contraparte' : shipCost === 0 ? 'Gratis' : `€${shipCost}`}
                  </span>
                  <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#aaa', cursor: 'pointer', letterSpacing: '0.5px', textDecoration: 'underline', whiteSpace: 'nowrap' }}>Cambiar</button>
                </div>

                {/* Opciones de pago */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px', border: '1px solid #e8e8e8' }}>
                  <h2 style={sectionTitle}>Método de pago</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {PAYMENTS.map(pm => {
                      const active = pay === pm.id;
                      return (
                        <label key={pm.id} onClick={() => setPay(pm.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '18px 20px', cursor: 'pointer', border: `2px solid ${active ? '#1a1a1a' : '#e8e8e8'}`, borderRadius: '8px', background: active ? '#fafafa' : '#fff', transition: 'border-color 0.15s, background 0.15s' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${active ? '#1a1a1a' : '#ccc'}`, background: active ? '#1a1a1a' : '#fff', flexShrink: 0, marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '20px', lineHeight: 1 }}>{pm.icon}</span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{pm.label}</span>
                              {pm.divisa && (
                                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e8f5e9', color: '#2e7d32', letterSpacing: '0.5px' }}>5% OFF</span>
                              )}
                            </div>
                            <p style={{ fontSize: '11px', color: '#888', margin: 0, lineHeight: 1.5 }}>{pm.sub}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Datos bancarios */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', border: '1px solid #e8e8e8' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#777', margin: '0 0 16px' }}>
                    {payOpt.icon} Datos para el pago — {payOpt.label}
                  </p>
                  {PAY_DETAILS[pay].map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < PAY_DETAILS[pay].length - 1 ? '1px solid #f2f2f2' : 'none' }}>
                      <span style={{ color: '#d4829a', fontSize: '16px', flexShrink: 0, lineHeight: 1.4 }}>›</span>
                      <p style={{ fontSize: '13px', color: '#333', margin: 0, lineHeight: 1.5 }}>{line}</p>
                    </div>
                  ))}
                </div>

                {confirmError && (
                  <div style={{ padding: '12px 16px', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#c62828' }}>
                    ⚠️ {confirmError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setStep('info')} style={btnSecondary} disabled={confirming}>← Volver</button>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    style={{ ...btnPrimary, flex: 2, opacity: confirming ? 0.7 : 1, cursor: confirming ? 'wait' : 'pointer' }}
                  >
                    {confirming ? 'Registrando pedido...' : 'Confirmar pedido →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Confirmación */}
            {step === 'confirm' && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', border: '1px solid #e8e8e8', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', background: '#d4829a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px', color: '#fff' }}>✓</div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#aaa', margin: '0 0 8px' }}>Pedido registrado</p>
                <p style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '2px', margin: '0 0 8px' }}>#{orderId}</p>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 36px' }}>
                  {form.name ? `Gracias, ${form.name.split(' ')[0]}. ` : ''}Envía tu comprobante por WhatsApp para procesar el pedido.
                </p>

                {/* Info del pedido */}
                <div style={{ background: '#fafafa', borderRadius: '10px', padding: '24px', textAlign: 'left', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    {[
                      { l: 'Envío',       v: shipOpt.label },
                      { l: 'Pago',        v: payOpt.label },
                      { l: 'Dirección',   v: `${form.address}, ${form.city}${form.state ? ', ' + form.state : ''}` },
                      { l: 'WhatsApp',    v: form.phone },
                    ].map(r => (
                      <div key={r.l}>
                        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#bbb', margin: '0 0 4px' }}>{r.l}</p>
                        <p style={{ fontSize: '12px', color: '#333', margin: 0, lineHeight: 1.4 }}>{r.v || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desglose de precios */}
                  <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {row('Subtotal productos', eur(subtotal))}
                    {isDivisa && row('Descuento divisas (5%)', `−${eur(discount)}`, '#4caf50', true)}
                    {isDivisa && (
                      <div style={{ padding: '8px 12px', background: '#e8f5e9', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>Subtotal con descuento</span>
                        <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>{eur(discSub)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '13px', color: '#666' }}>Envío</span>
                        <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0 0' }}>{shipOpt.label}</p>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isContra ? '#f57c00' : shipCost === 0 ? '#4caf50' : '#1a1a1a' }}>
                        {isContra ? 'Contraparte*' : shipCost === 0 ? 'Gratis' : eur(shipCost)}
                      </span>
                    </div>
                    {isContra && (
                      <p style={{ fontSize: '11px', color: '#f57c00', background: '#fff8e1', padding: '8px 12px', borderRadius: '6px', margin: 0 }}>
                        * El costo del courier se abona al recibir el paquete.
                      </p>
                    )}
                    <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total a pagar</p>
                        {isContra && <p style={{ fontSize: '10px', color: '#aaa', margin: '3px 0 0' }}>+ envío contraparte al recibir</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{eur(total)}</p>
                        {pay === 'PAGO_MOVIL' && eurToBs > 0 && (
                          <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0' }}>
                            ≈ Bs. {(total * eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos de pago */}
                <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: '10px', padding: '20px 24px', textAlign: 'left', marginBottom: '28px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#777', margin: '0 0 14px' }}>
                    {payOpt.icon} Datos de pago — {payOpt.label}
                  </p>
                  {PAY_DETAILS[pay].map((line, i) => (
                    <p key={i} style={{ fontSize: '13px', color: '#333', margin: '0 0 8px', lineHeight: 1.5 }}>• {line}</p>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${buildWAMsg()}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25d366', color: '#fff', padding: '15px 28px', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '6px' }}
                  >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.217.608 4.296 1.67 6.073L.057 23.4l5.473-1.593A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.178-1.356l-.371-.221-3.246.945.924-3.182-.243-.386A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                    Enviar comprobante por WhatsApp
                  </a>
                  <a
                    href="/invoice"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fff', color: '#1a1a1a', border: '1.5px solid #1a1a1a', padding: '14px 28px', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '6px' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Descargar Factura
                  </a>
                </div>
                <Link href="/products" style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#bbb', textDecoration: 'none' }}>
                  Seguir comprando →
                </Link>
              </div>
            )}
          </div>

          {/* ── RIGHT: Resumen del pedido (sticky) ──────────────────── */}
          <aside style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8', overflow: 'hidden' }}>

              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Resumen del Pedido</p>
              </div>

              {/* Productos */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
                {items.map(item => (
                  <div key={item.productId} style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '60px', height: '78px', borderRadius: '6px', overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👗</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 3px', lineHeight: 1.3 }}>{item.name}</p>
                      <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 6px' }}>
                        {[item.size && `Talla ${item.size}`, item.color && item.color, `×${item.quantity}`].filter(Boolean).join(' · ')}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{eur(Number(item.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desglose de precios */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span>
                    <span style={{ fontSize: '13px' }}>{eur(subtotal)}</span>
                  </div>

                  {/* Descuento divisas */}
                  {isDivisa && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 600 }}>✦ Descuento divisas (5%)</span>
                      <span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 600 }}>−{eur(discount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#e8f5e9', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>Subtotal con descuento</span>
                      <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>{eur(discSub)}</span>
                    </div>
                  </>}

                  {/* Envío */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: '#666' }}>Envío</span>
                      <p style={{ fontSize: '11px', color: '#bbb', margin: '2px 0 0' }}>{shipOpt.label}</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isContra ? '#f57c00' : shipCost === 0 ? '#4caf50' : '#1a1a1a' }}>
                      {isContra ? 'Contraparte' : shipCost === 0 ? 'Gratis' : eur(shipCost)}
                    </span>
                  </div>

                  {isContra && (
                    <p style={{ fontSize: '11px', color: '#f57c00', background: '#fff8e1', padding: '8px 12px', borderRadius: '6px', margin: 0 }}>
                      * El courier se paga al recibir el paquete
                    </p>
                  )}

                  {/* Total */}
                  <div style={{ borderTop: '2px solid #1a1a1a', paddingTop: '14px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total</p>
                        {isContra && <p style={{ fontSize: '10px', color: '#aaa', margin: '3px 0 0' }}>+ envío contraparte</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{eur(total)}</p>
                        {pay === 'PAGO_MOVIL' && eurToBs > 0 && (
                          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
                            ≈ Bs. {(total * eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .co-grid { grid-template-columns: 1fr 340px; }
        @media (max-width: 900px) { .co-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) {
          .co-grid > div form [style*="grid-template-columns: 1fr 1fr"] { display: block !important; }
          .co-grid > div form [style*="grid-template-columns: 1fr 1fr"] > * { margin-bottom: 12px; }
        }
      `}</style>
    </div>
  );
}

/* Shared styles */
const sectionTitle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
  textTransform: 'uppercase', margin: '0 0 18px', color: '#666',
};
const btnPrimary: React.CSSProperties = {
  flex: 1, width: '100%', background: '#1a1a1a', color: '#fff', border: 'none',
  padding: '16px', fontSize: '11px', fontWeight: 700, letterSpacing: '2.5px',
  textTransform: 'uppercase', cursor: 'pointer', borderRadius: '6px',
};
const btnSecondary: React.CSSProperties = {
  padding: '16px 24px', background: '#fff', color: '#1a1a1a',
  border: '1.5px solid #e0e0e0', fontSize: '11px', fontWeight: 700,
  letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '6px',
};

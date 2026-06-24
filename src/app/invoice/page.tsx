'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface OrderData {
  orderId: string;
  date: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string };
  items: Array<{ name: string; size?: string; color?: string; quantity: number; price: number }>;
  subtotal: number;
  isDivisa: boolean;
  discount: number;
  discSub: number;
  shipLabel: string;
  shipCost: number | null;
  payLabel: string;
  payIcon: string;
  total: number;
  eurToBs: number;
}

const e = (n: number) => `€${Number(n).toFixed(2)}`;

export default function InvoicePage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('leah_last_order');
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  /* ── Generación de PDF con jsPDF ─────────────────────────────────── */
  const downloadPDF = useCallback(async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210;
      const margin = 18;
      const contentW = W - margin * 2;
      let y = 0;

      const isContra = order.shipCost === null;

      /* ── Helpers ────────────────────────────────────────────────── */
      const line  = (x1: number, y1: number, x2: number, y2: number, color = '#e0e0e0') => {
        doc.setDrawColor(color); doc.line(x1, y1, x2, y2);
      };
      const text  = (t: string, x: number, yp: number, opts: { size?: number; bold?: boolean; color?: string; align?: 'left'|'center'|'right' } = {}) => {
        doc.setFontSize(opts.size ?? 10);
        doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
        doc.setTextColor(opts.color ?? '#1a1a1a');
        doc.text(t, x, yp, { align: opts.align ?? 'left' });
      };
      const rect  = (x: number, yp: number, w: number, h: number, fill: string) => {
        doc.setFillColor(fill); doc.rect(x, yp, w, h, 'F');
      };

      /* ── 1. Cabecera negra ──────────────────────────────────────── */
      rect(0, 0, W, 36, '#1a1a1a');
      text('LEAH', margin, 15, { size: 22, bold: true, color: '#ffffff' });
      text('MODA FEMENINA', margin, 21, { size: 7, color: '#888888' });
      text('RECIBO DE COMPRA', W - margin, 12, { size: 7, bold: true, color: '#888888', align: 'right' });
      text(order.orderId, W - margin, 19, { size: 13, bold: true, color: '#ffffff', align: 'right' });
      text(order.date, W - margin, 25, { size: 8, color: '#aaaaaa', align: 'right' });

      /* Franja rosa */
      rect(0, 36, W, 2, '#d4829a');
      y = 46;

      /* ── 2. Datos del cliente ────────────────────────────────────── */
      rect(margin, y, contentW, 5, '#f5f5f5');
      text('DATOS DEL CLIENTE', margin + 3, y + 3.5, { size: 7, bold: true, color: '#888888' });
      y += 9;

      const fields: [string, string][] = [
        ['Nombre',    order.customer.name],
        ['Teléfono',  order.customer.phone],
        ['Email',     order.customer.email],
        ['Dirección', order.customer.address],
        ['Ciudad',    `${order.customer.city}${order.customer.state ? ', ' + order.customer.state : ''}`],
      ].filter(([, v]) => v) as [string, string][];

      const colW = contentW / 2;
      fields.forEach(([label, val], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const xp = margin + col * colW;
        const yp = y + row * 10;
        text(label.toUpperCase(), xp, yp, { size: 6.5, color: '#aaaaaa', bold: true });
        text(val, xp, yp + 4, { size: 9 });
      });
      y += Math.ceil(fields.length / 2) * 10 + 8;

      line(margin, y, W - margin, y);
      y += 8;

      /* ── 3. Tabla de productos ───────────────────────────────────── */
      rect(margin, y, contentW, 6, '#1a1a1a');
      const cols = [
        { label: 'PRODUCTO',   x: margin + 3,           w: 72, align: 'left'  as const },
        { label: 'TALLA',      x: margin + 76,          w: 18, align: 'center' as const },
        { label: 'CANT.',      x: margin + 96,          w: 14, align: 'center' as const },
        { label: 'P. UNIT.',   x: margin + 112,         w: 24, align: 'right' as const },
        { label: 'TOTAL',      x: W - margin - 3,       w: 24, align: 'right' as const },
      ];
      cols.forEach(c => text(c.label, c.x, y + 4, { size: 6.5, bold: true, color: '#aaaaaa', align: c.align }));
      y += 9;

      order.items.forEach((item, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#fafafa';
        rect(margin, y - 1, contentW, 8, bg);
        const name = item.name + (item.color ? ` (${item.color})` : '');
        // Truncate name if too long
        const displayName = name.length > 38 ? name.slice(0, 36) + '…' : name;
        text(displayName,                     margin + 3,    y + 4.5, { size: 9 });
        text(item.size || '—',               margin + 76,   y + 4.5, { size: 9, align: 'center' });
        text(String(item.quantity),          margin + 96,   y + 4.5, { size: 9, bold: true, align: 'center' });
        text(e(item.price),                  margin + 112,  y + 4.5, { size: 9, align: 'right' });
        text(e(item.price * item.quantity),  W - margin - 3, y + 4.5, { size: 9, bold: true, align: 'right' });
        y += 8;
      });

      line(margin, y, W - margin, y);
      y += 10;

      /* ── 4. Desglose de pago (columna derecha) ──────────────────── */
      const boxX = margin + contentW * 0.45;
      const boxW = contentW * 0.55;

      const priceRow = (label: string, val: string, bold = false, color = '#333333') => {
        line(boxX, y, W - margin, y, '#f0f0f0');
        y += 1;
        text(label, boxX + 3,      y + 4, { size: 9, bold, color });
        text(val,   W - margin - 3, y + 4, { size: 9, bold, color, align: 'right' });
        y += 7;
      };

      priceRow('Subtotal', e(order.subtotal));

      if (order.isDivisa) {
        priceRow('Descuento divisas (5%)', `−${e(order.discount)}`, true, '#4caf50');
        rect(boxX, y, boxW, 7, '#f0faf0');
        text('Subtotal con descuento', boxX + 3, y + 4.5, { size: 9, bold: true, color: '#2e7d32' });
        text(e(order.discSub), W - margin - 3, y + 4.5, { size: 9, bold: true, color: '#2e7d32', align: 'right' });
        y += 9;
      }

      const shipStr = isContra ? 'Contraparte*' : order.shipCost === 0 ? 'Gratis' : e(order.shipCost!);
      const shipColor = isContra ? '#f57c00' : order.shipCost === 0 ? '#4caf50' : '#333333';
      priceRow(`Envío (${order.shipLabel})`, shipStr, false, shipColor);

      /* Total */
      rect(boxX, y, boxW, 10, '#1a1a1a');
      text('TOTAL A PAGAR', boxX + 3, y + 6.5, { size: 10, bold: true, color: '#ffffff' });
      text(e(order.total), W - margin - 3, y + 6.5, { size: 13, bold: true, color: '#ffffff', align: 'right' });
      y += 13;

      if (order.eurToBs > 0) {
        rect(boxX, y, boxW, 6, '#f5f5f5');
        text('Equivalente en Bs. (BCV)', boxX + 3, y + 4, { size: 7.5, color: '#888888' });
        const bsTotal = `Bs. ${(order.total * order.eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}`;
        text(bsTotal, W - margin - 3, y + 4, { size: 7.5, bold: true, color: '#555555', align: 'right' });
        y += 8;
      }

      if (isContra) {
        text('* El costo del courier se abona al recibir el paquete.', margin, y + 4, { size: 7.5, color: '#f57c00' });
        y += 8;
      }
      y += 4;

      /* ── 5. Método de pago y envío ──────────────────────────────── */
      line(margin, y, W - margin, y);
      y += 8;

      rect(margin, y, contentW / 2 - 4, 16, '#f9f9f9');
      text('MÉTODO DE PAGO', margin + 4, y + 5, { size: 6.5, color: '#aaaaaa', bold: true });
      text(`${order.payIcon} ${order.payLabel}`, margin + 4, y + 11, { size: 10, bold: true });

      const col2x = margin + contentW / 2 + 2;
      rect(col2x, y, contentW / 2 - 2, 16, '#f9f9f9');
      text('TIPO DE ENVÍO', col2x + 4, y + 5, { size: 6.5, color: '#aaaaaa', bold: true });
      text(order.shipLabel, col2x + 4, y + 11, { size: 10, bold: true });
      y += 24;

      /* ── 6. Pie de factura ──────────────────────────────────────── */
      line(margin, y, W - margin, y);
      y += 8;
      text('¡Gracias por elegirnos!', W / 2, y, { size: 12, bold: true, color: '#d4829a', align: 'center' });
      y += 6;
      text('Este documento es un comprobante de compra emitido por LEAH.', W / 2, y, { size: 7.5, color: '#aaaaaa', align: 'center' });
      y += 5;
      text('Para consultas: @leahstore · pagos@leah.com', W / 2, y, { size: 7.5, color: '#aaaaaa', align: 'center' });
      y += 8;

      rect(0, y, W, 8, '#1a1a1a');
      text('LEAH — Moda Femenina', margin, y + 5, { size: 7.5, color: '#555555' });
      text(`Documento generado el ${order.date}`, W - margin, y + 5, { size: 7.5, color: '#555555', align: 'right' });

      /* ── Descargar ──────────────────────────────────────────────── */
      doc.save(`Factura-${order.orderId}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('No se pudo generar el PDF. Intenta imprimir la página.');
    } finally {
      setDownloading(false);
    }
  }, [order]);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 100);
  };

  /* ── Vista previa en pantalla ─────────────────────────────────────── */
  if (!order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '48px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '40px', margin: '0 0 16px' }}>📄</p>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>No hay factura disponible</p>
          <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 24px' }}>Completa una compra para generar tu factura.</p>
          <a href="/products" style={{ display: 'inline-block', background: '#1a1a1a', color: '#fff', padding: '12px 32px', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '6px' }}>
            Ver Tienda
          </a>
        </div>
      </div>
    );
  }

  const { orderId, date, customer, items, subtotal, isDivisa, discount, discSub, shipLabel, shipCost, payLabel, payIcon, total, eurToBs } = order;
  const isContra = shipCost === null;

  return (
    <>
      {/* ── Barra de acción ─────────────────────────────────────────── */}
      <div className="no-print" style={{ background: '#1a1a1a', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700, letterSpacing: '3px' }}>LEAH</span>
          <span style={{ color: '#555', fontSize: '13px' }}>·</span>
          <span style={{ color: '#aaa', fontSize: '13px' }}>Factura {orderId}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Botón descarga PDF real */}
          <button
            onClick={downloadPDF}
            disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#d4829a', color: '#fff', border: 'none', padding: '11px 22px', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: downloading ? 'wait' : 'pointer', borderRadius: '6px', opacity: downloading ? 0.75 : 1 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {downloading ? 'Generando...' : 'Descargar PDF'}
          </button>
          {/* Botón imprimir */}
          <button
            onClick={handlePrint}
            disabled={printing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#aaa', border: '1px solid #444', padding: '11px 18px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', borderRadius: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </button>
        </div>
      </div>

      {/* ── Vista previa de la factura ───────────────────────────────── */}
      <div className="invoice-wrap" style={{ background: '#f0f0f0', minHeight: 'calc(100vh - 56px)', padding: '32px 16px' }}>
        <div className="invoice" style={{ maxWidth: '760px', margin: '0 auto', background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', fontFamily: 'Arial, sans-serif' }}>

          {/* Cabecera */}
          <div style={{ background: '#1a1a1a', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '8px', color: '#fff', margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>LEAH</h1>
              <p style={{ fontSize: '10px', color: '#888', margin: '0 0 2px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Moda Femenina</p>
              <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>@leahstore · pagos@leah.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>Recibo de Compra</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '1px' }}>{orderId}</p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{date}</p>
            </div>
          </div>
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #d4829a, #e8b4c4, #d4829a)' }} />

          <div style={{ padding: '32px 40px' }}>

            {/* Datos del cliente */}
            <div style={{ marginBottom: '28px' }}>
              <p style={sLabel}>Datos del Cliente</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', padding: '18px 20px', background: '#fafafa', borderRadius: '8px' }}>
                {[
                  { l: 'Nombre',    v: customer.name },
                  { l: 'Teléfono',  v: customer.phone },
                  { l: 'Email',     v: customer.email },
                  { l: 'Dirección', v: customer.address },
                  { l: 'Ciudad',    v: customer.city },
                  { l: 'Estado',    v: customer.state || '—' },
                ].map(r => (
                  <div key={r.l}>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#bbb', margin: '0 0 3px' }}>{r.l}</p>
                    <p style={{ fontSize: '12px', color: '#333', margin: 0, lineHeight: 1.4, wordBreak: 'break-all' }}>{r.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla de productos */}
            <div style={{ marginBottom: '28px' }}>
              <p style={sLabel}>Detalle de Productos</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    <th style={th('left',   '42%')}>Producto</th>
                    <th style={th('center', '10%')}>Talla</th>
                    <th style={th('center', '10%')}>Cant.</th>
                    <th style={th('right',  '19%')}>P. Unit.</th>
                    <th style={th('right',  '19%')}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                        {item.color && <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px' }}>({item.color})</span>}
                      </td>
                      <td style={{ padding: '11px 8px', textAlign: 'center', color: '#555' }}>{item.size || '—'}</td>
                      <td style={{ padding: '11px 8px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', color: '#555' }}>{e(item.price)}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700 }}>{e(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Desglose + Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px' }}>
              <div>
                <p style={sLabel}>Información del Pedido</p>
                <div style={{ padding: '18px 20px', background: '#fafafa', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#bbb', margin: '0 0 4px' }}>Método de pago</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{payIcon} {payLabel}</p>
                    {isDivisa && <p style={{ fontSize: '11px', color: '#4caf50', margin: '4px 0 0', fontWeight: 600 }}>✦ Descuento divisas (5%)</p>}
                  </div>
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '14px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#bbb', margin: '0 0 4px' }}>Tipo de envío</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{shipLabel}</p>
                    {isContra && <p style={{ fontSize: '11px', color: '#f57c00', margin: '4px 0 0' }}>Pago al recibir el paquete</p>}
                    {shipCost === 0 && <p style={{ fontSize: '11px', color: '#4caf50', margin: '4px 0 0' }}>Sin costo de envío</p>}
                  </div>
                </div>
              </div>

              <div>
                <p style={sLabel}>Resumen de Pago</p>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={tRow}><span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span><span style={{ fontSize: '13px' }}>{e(subtotal)}</span></div>
                  {isDivisa && <>
                    <div style={tRow}><span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 700 }}>Descuento (5%)</span><span style={{ fontSize: '13px', color: '#4caf50', fontWeight: 700 }}>−{e(discount)}</span></div>
                    <div style={{ ...tRow, background: '#f0faf0' }}><span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>Subtotal c/descuento</span><span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700 }}>{e(discSub)}</span></div>
                  </>}
                  <div style={tRow}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Envío</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isContra ? '#f57c00' : shipCost === 0 ? '#4caf50' : '#333' }}>
                      {isContra ? 'Contraparte' : shipCost === 0 ? 'Gratis' : e(shipCost!)}
                    </span>
                  </div>
                  <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>TOTAL</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{e(total)}</span>
                  </div>
                  {eurToBs > 0 && (
                    <div style={{ padding: '9px 16px', background: '#f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#aaa' }}>Equivalente Bs. (BCV)</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#555' }}>Bs. {(total * eurToBs).toLocaleString('es-VE', { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {isContra && <p style={{ fontSize: '10px', color: '#f57c00', padding: '8px 16px', margin: 0, background: '#fff8e1' }}>* El courier se paga al recibir.</p>}
                </div>
              </div>
            </div>

            {/* Pie */}
            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '2px', color: '#d4829a', margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>¡Gracias por elegirnos! ♡</p>
              <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 4px' }}>Este documento es un comprobante de compra emitido por LEAH.</p>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>Para consultas: @leahstore · pagos@leah.com</p>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '12px 40px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', color: '#555' }}>LEAH — Moda Femenina</span>
            <span style={{ fontSize: '10px', color: '#555' }}>{date}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .invoice-wrap { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .invoice { max-width: 100% !important; box-shadow: none !important; }
          body { margin: 0; }
          @page { margin: 0.5cm; size: A4; }
        }
      `}</style>
    </>
  );
}

const sLabel: React.CSSProperties = {
  fontSize: '9px', fontWeight: 700, letterSpacing: '2.5px',
  textTransform: 'uppercase', color: '#aaa', margin: '0 0 10px',
};

function th(align: 'left' | 'center' | 'right', width: string): React.CSSProperties {
  return { padding: '10px 14px', textAlign: align, fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#aaa', width };
}

const tRow: React.CSSProperties = {
  padding: '10px 16px', display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', borderBottom: '1px solid #f0f0f0',
};

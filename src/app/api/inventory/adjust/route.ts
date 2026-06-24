import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const { variantId, quantity, type, note } = await req.json();
    const qty = Number(quantity);
    if (!variantId || qty === 0) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 });

    const newStock = variant.stock + qty;
    if (newStock < 0) return NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 });

    const [updated] = await prisma.$transaction([
      prisma.productVariant.update({ where: { id: variantId }, data: { stock: newStock } }),
      prisma.stockMovement.create({ data: { variantId, quantity: qty, type: type || 'ADJUSTMENT', note: note || null } }),
    ]);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

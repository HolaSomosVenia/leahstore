import { NextRequest, NextResponse } from 'next/server';
import { prisma, parseProduct } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: { include: { stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 } } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products.map(parseProduct));
  } catch { return NextResponse.json({ error: 'Error inventario' }, { status: 500 }); }
}

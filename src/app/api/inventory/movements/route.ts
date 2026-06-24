import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { variant: { include: { product: { select: { name: true, images: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    return NextResponse.json(movements);
  } catch { return NextResponse.json({ error: 'Error movimientos' }, { status: 500 }); }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: { include: { product: true } } },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

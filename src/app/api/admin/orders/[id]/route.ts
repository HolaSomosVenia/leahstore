import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;
    const { status } = await req.json();
    const order = await prisma.order.update({ where: { id }, data: { status }, include: { user: true, items: true } });
    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

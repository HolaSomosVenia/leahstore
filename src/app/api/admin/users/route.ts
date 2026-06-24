import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { membership: true, _count: { select: { orders: true } } },
    });
    return NextResponse.json(users.map(({ password: _, ...u }) => u));
  } catch { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

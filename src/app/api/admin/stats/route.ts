import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true, items: true } }),
    ]);
    return NextResponse.json({ totalOrders, totalProducts, totalUsers, totalRevenue: totalRevenue._sum.total || 0, recentOrders });
  } catch {
    return NextResponse.json({ error: 'Error stats' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get('email')?.trim().toLowerCase();
    if (!email) return NextResponse.json({ isMember: false });

    const user = await prisma.user.findUnique({ where: { email }, include: { membership: true } });
    if (!user?.membership) return NextResponse.json({ isMember: false });

    return NextResponse.json({ isMember: true, freeDelivery: user.membership.freeDelivery, earlyAccess: user.membership.earlyAccess, name: user.name });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

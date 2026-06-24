import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const u = await prisma.user.findUnique({ where: { id: user.id }, include: { orders: true, membership: true } });
    if (!u) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    const { password: _, ...safeUser } = u;
    return NextResponse.json(safeUser);
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { name, phone } = await req.json();
    const u = await prisma.user.update({ where: { id: user.id }, data: { name, phone } });
    const { password: _, ...safeUser } = u;
    return NextResponse.json(safeUser);
  } catch {
    return NextResponse.json({ error: 'Error actualizando perfil' }, { status: 500 });
  }
}

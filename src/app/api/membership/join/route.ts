import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional() });

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) user = await prisma.user.create({ data: { email: data.email, name: data.name, phone: data.phone || null, role: 'USER' } });

    const existing = await prisma.membership.findUnique({ where: { userId: user.id } });
    if (existing) return NextResponse.json({ message: 'Ya eres miembro Leah', membership: existing, alreadyMember: true });

    const membership = await prisma.membership.create({ data: { userId: user.id, name: data.name, discount: 0.20, freeDelivery: true, earlyAccess: true } });
    return NextResponse.json({ message: '¡Bienvenida a Leah!', membership, alreadyMember: false }, { status: 201 });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Error al registrar membresía' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth-server';

const Schema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  name:     z.string().min(2),
  phone:    z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, phone: data.phone || null, password: hashedPassword },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token }, { status: 201 });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Error en el registro' }, { status: 500 });
  }
}

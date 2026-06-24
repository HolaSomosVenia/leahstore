import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth-server';

const Schema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = Schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });

    if (user.password) {
      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (e: any) {
    if (e?.issues) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Error en el login' }, { status: 500 });
  }
}

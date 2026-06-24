import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

const Schema = z.object({ name: z.string().min(1), slug: z.string().min(1) });

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const cats = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
    return NextResponse.json(cats);
  } catch { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const data = Schema.parse(await req.json());
    const cat = await prisma.category.create({ data });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

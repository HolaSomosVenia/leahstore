import { NextRequest, NextResponse } from 'next/server';
import { prisma, parseProduct } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true, variants: true } });
    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(parseProduct(product));
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;
    const { name, code, description, price, comparePrice, images, categoryId } = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: { name, code: code || null, description, price: Number(price), comparePrice: comparePrice ? Number(comparePrice) : null, images: JSON.stringify(images || []), categoryId },
      include: { category: true, variants: true },
    });
    return NextResponse.json(parseProduct(product));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

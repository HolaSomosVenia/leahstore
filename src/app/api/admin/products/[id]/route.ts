import { NextRequest, NextResponse } from 'next/server';
import { prisma, parseProduct } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    const { name, code, description, price, comparePrice, images, categoryId, variants } = await req.json();
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
      data: {
        name, code: code || null, description,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        images: JSON.stringify(images || []),
        categoryId,
        variants: {
          create: (variants || []).map((v: any) => ({
            sku: v.sku || null, size: v.size, color: v.color, stock: Number(v.stock) || 0,
          })),
        },
      },
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
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

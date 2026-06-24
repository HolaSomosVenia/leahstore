import { NextRequest, NextResponse } from 'next/server';
import { prisma, parseProduct } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products.map(parseProduct));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const { name, code, description, price, comparePrice, images, categoryId, variants } = await req.json();
    const product = await prisma.product.create({
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
    for (const v of product.variants) {
      if (v.stock > 0) {
        await prisma.stockMovement.create({ data: { variantId: v.id, quantity: v.stock, type: 'RESTOCK', note: 'Stock inicial' } });
      }
    }
    return NextResponse.json(parseProduct(product), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

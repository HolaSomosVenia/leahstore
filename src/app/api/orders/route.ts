import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const CreateOrderSchema = z.object({
  userId:          z.string().optional(),
  guestName:       z.string().optional(),
  guestEmail:      z.string().email().optional(),
  guestPhone:      z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity:  z.number().min(1),
    price:     z.number().optional(),
    size:      z.string().optional(),
    color:     z.string().optional(),
  })),
  shippingAddress: z.string().optional(),
  shippingType:    z.string().optional(),
  paymentMethod:   z.string().optional(),
  discount:        z.number().optional(),
  total:           z.number().optional(),
  notes:           z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateOrderSchema.parse(await req.json());

    if (!data.userId && !data.guestEmail) {
      return NextResponse.json({ error: 'Se requiere userId o guestEmail' }, { status: 400 });
    }

    let userId = data.userId;

    if (!userId && data.guestEmail) {
      let user = await prisma.user.findUnique({ where: { email: data.guestEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: { email: data.guestEmail, name: data.guestName || 'Cliente', phone: data.guestPhone || null, role: 'USER' },
        });
      } else if (data.guestPhone && !user.phone) {
        user = await prisma.user.update({ where: { id: user.id }, data: { phone: data.guestPhone } });
      }
      userId = user.id;
    }

    let computedTotal = 0;
    const orderItems: any[] = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const unitPrice = product ? Number(product.price) : (item.price ?? 0);
      computedTotal += unitPrice * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: unitPrice, size: item.size || null, color: item.color || null });
    }

    const discount   = data.discount ?? 0;
    const finalTotal = data.total ?? (computedTotal - discount + (data.shippingType === 'LOCAL' ? 3 : data.shippingType === 'PICKUP' ? 0 : 0));

    const order = await prisma.order.create({
      data: {
        userId: userId!,
        total: finalTotal,
        status: 'PENDING',
        paymentMethod:   data.paymentMethod  || 'WHATSAPP',
        shippingType:    data.shippingType   || 'LOCAL',
        shippingAddress: data.shippingAddress || '',
        notes:           data.notes || null,
        items: { create: orderItems },
      },
      include: { user: true, items: { include: { product: true } } },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    if (error?.issues) return NextResponse.json({ error: error.issues }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: 'Error creando orden' }, { status: 500 });
  }
}

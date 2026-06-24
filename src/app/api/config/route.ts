import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-server';

const DEFAULT_CONFIG = {
  banner: { image: '', title: 'Bienvenida a Leah', subtitle: 'Nueva Colección', buttonText: 'Ver Colección' },
  carousel: [],
  collections: [
    { id: '1', name: 'Colección Esencial',  image: '', description: 'Piezas clásicas para cada día' },
    { id: '2', name: 'Colección Romántica', image: '', description: 'Femenina y delicada' },
    { id: '3', name: 'Colección Casual',    image: '', description: 'Comodidad con estilo' },
    { id: '4', name: 'Colección Premium',   image: '', description: 'Lo mejor de la temporada' },
  ],
};

export async function GET() {
  try {
    const record = await prisma.siteConfig.findUnique({ where: { id: 'main' } });
    if (!record) return NextResponse.json(DEFAULT_CONFIG);
    return NextResponse.json(JSON.parse(record.data));
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;
  try {
    const body    = await req.json();
    const current = await prisma.siteConfig.findUnique({ where: { id: 'main' } });
    const prev    = current ? JSON.parse(current.data) : DEFAULT_CONFIG;
    const updated = { ...prev, ...body };
    await prisma.siteConfig.upsert({
      where:  { id: 'main' },
      create: { id: 'main', data: JSON.stringify(updated) },
      update: { data: JSON.stringify(updated) },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Error guardando configuración' }, { status: 500 });
  }
}

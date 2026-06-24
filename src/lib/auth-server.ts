import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'leah_secret_2025';

export interface JWTUser {
  id: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTUser;
  } catch {
    return null;
  }
}

export function getUser(req: NextRequest): JWTUser | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

export function requireAdmin(req: NextRequest): { user: JWTUser } | { error: Response } {
  const user = getUser(req);
  if (!user) return { error: new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 }) };
  if (user.role !== 'ADMIN') return { error: new Response(JSON.stringify({ error: 'Sin permisos' }), { status: 403 }) };
  return { user };
}

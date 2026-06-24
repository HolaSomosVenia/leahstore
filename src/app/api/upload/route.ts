import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const supabase   = createClient(supabaseUrl, supabaseKey);
    const formData   = await req.formData();
    const file       = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from('products').upload(fileName, buffer, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
    return NextResponse.json({ url: publicUrl, filename: fileName });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

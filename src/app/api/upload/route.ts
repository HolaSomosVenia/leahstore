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
    const supabase = createClient(supabaseUrl, supabaseKey);
    const formData = await req.formData();

    // Acepta 'images' (múltiples) o 'file' (singular)
    const rawFiles = formData.getAll('images');
    const singleFile = formData.get('file');
    const files = rawFiles.length ? rawFiles : singleFile ? [singleFile] : [];

    if (!files.length) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const entry of files) {
      const file = entry as File;
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, { contentType: file.type, upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      urls.push(publicUrl);
    }

    // Compatibilidad: devuelve tanto url (singular) como urls (array)
    return NextResponse.json({ url: urls[0], urls, filenames: urls });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return auth.error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.storage.from('products').list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;

    const images = (data || []).map(f => ({
      name: f.name,
      url: supabase.storage.from('products').getPublicUrl(f.name).data.publicUrl,
      size: f.metadata?.size || 0,
    }));

    return NextResponse.json(images);
  } catch {
    return NextResponse.json([]);
  }
}

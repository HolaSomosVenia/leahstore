import { NextResponse } from 'next/server';

let cached: { eurToBs: number; usdToBs: number; updatedAt: string } | null = null;
let cacheTime = 0;
const CACHE_MS = 24 * 60 * 60 * 1000;

async function fetchRates() {
  const [dolarRes, erRes] = await Promise.all([
    fetch('https://ve.dolarapi.com/v1/dolares', { next: { revalidate: 86400 } }),
    fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 86400 } }),
  ]);
  const dolarList = await dolarRes.json();
  const erData    = await erRes.json();

  const bcvItem = dolarList.find((d: any) => d.fuente === 'oficial');
  if (!bcvItem?.promedio) throw new Error('No tasa BCV');
  const usdToBs = bcvItem.promedio;
  const usdToEur = erData?.rates?.EUR;
  if (!usdToEur) throw new Error('No tasa EUR/USD');
  const eurToBs = (1 / usdToEur) * usdToBs;
  return { eurToBs: parseFloat(eurToBs.toFixed(4)), usdToBs: parseFloat(usdToBs.toFixed(4)) };
}

export async function GET() {
  const now = Date.now();
  if (cached && now - cacheTime < CACHE_MS) return NextResponse.json({ ...cached, cached: true });
  try {
    const rates = await fetchRates();
    cached = { ...rates, updatedAt: new Date().toISOString() };
    cacheTime = now;
    return NextResponse.json({ ...cached, cached: false });
  } catch {
    if (cached) return NextResponse.json({ ...cached, cached: true, stale: true });
    return NextResponse.json({ eurToBs: 55.0, usdToBs: 50.0, updatedAt: new Date().toISOString(), fallback: true });
  }
}

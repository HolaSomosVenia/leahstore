'use client';

import { useEffect } from 'react';
import { useCurrency } from '@/lib/currency';

export function CurrencyProvider() {
  const fetchRate = useCurrency(s => s.fetchRate);
  useEffect(() => { fetchRate(); }, [fetchRate]);
  return null;
}

import { create } from 'zustand';

export type Currency = 'EUR' | 'VES' | 'USD';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CurrencyStore {
  currency: Currency;
  eurToBs: number;       // tasa BCV: cuántos Bs vale 1 Euro
  usdToBs: number;       // tasa BCV: cuántos Bs vale 1 USD
  rateUpdatedAt: string; // fecha/hora de la última actualización
  rateLoading: boolean;
  setCurrency: (c: Currency) => void;
  fetchRate: () => Promise<void>;
  format: (priceEUR: number) => string; // precio base siempre en EUR
}

export const useCurrency = create<CurrencyStore>((set, get) => ({
  currency: 'EUR',
  eurToBs: 0,     // 0 = aún no cargado
  usdToBs: 0,
  rateUpdatedAt: '',
  rateLoading: false,

  setCurrency: (currency) => set({ currency }),

  fetchRate: async () => {
    if (get().rateLoading) return;
    set({ rateLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/exchange-rate`);
      const data = await res.json();
      if (data.eurToBs) {
        set({
          eurToBs: data.eurToBs,
          usdToBs: data.usdToBs,
          rateUpdatedAt: data.updatedAt,
        });
      }
    } catch {
      // Silencioso — el fallback del backend ya maneja esto
    } finally {
      set({ rateLoading: false });
    }
  },

  format: (priceEUR: number) => {
    const { currency, eurToBs, usdToBs } = get();

    if (currency === 'EUR') {
      return `€${priceEUR.toFixed(2)}`;
    }

    if (currency === 'USD') {
      // EUR → USD usando cruce BCV (si tenemos ambas tasas)
      if (eurToBs > 0 && usdToBs > 0) {
        const usd = priceEUR * (eurToBs / usdToBs);
        return `$${usd.toFixed(2)}`;
      }
      return `$${(priceEUR * 1.08).toFixed(2)}`;
    }

    if (currency === 'VES') {
      if (eurToBs > 0) {
        const bs = priceEUR * eurToBs;
        return `Bs.${bs.toLocaleString('es-VE', { maximumFractionDigits: 2 })}`;
      }
      // Fallback mientras carga
      return `Bs.—`;
    }

    return `€${priceEUR.toFixed(2)}`;
  },
}));

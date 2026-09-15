import type { Sentiment } from '@/lib/sentiment';

// Ringkasan editorial mingguan — masih mock; sebaran sentimen dihitung dari
// berita asli di MarketMoversCard.
export const MARKET_MOVER = {
  summary:
    'Rupiah cenderung melemah pekan ini didorong ekspektasi The Fed menunda pemangkasan suku bunga dan menguatnya indeks dolar AS. Data domestik cadangan devisa dan neraca perdagangan relatif netral dan tidak cukup mengimbangi tekanan eksternal.',
  drivers: [
    { label: 'The Fed menunda pemangkasan suku bunga', detail: 'Dolar bertahan kuat, arus modal keluar dari pasar berkembang', impact: 'negatif' },
    { label: 'Indeks dolar AS (DXY) menguat', detail: 'Naik ke level tertinggi tiga pekan', impact: 'negatif' },
    { label: 'Cadangan devisa & neraca perdagangan', detail: 'Stabil, tapi tidak cukup menahan tekanan eksternal', impact: 'netral' },
  ] satisfies { label: string; detail: string; impact: Sentiment }[],
};

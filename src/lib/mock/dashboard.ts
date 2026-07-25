// Data contoh (mock) untuk halaman Dashboard — belum terhubung ke API/DB
// asli. Disatukan di satu file (bukan tersebar per komponen) supaya angka
// yang saling terkait (kurs saat ini, titik terakhir grafik, dsb.) tidak
// bisa "drift" saling tidak sinkron, dan supaya nanti mengganti ke data
// asli cukup mengubah file ini saja.

import type { ChartPoint, Sentiment } from '@/components/landing/rate/RateLineChart';

export const UPDATED_AT = '13 Jun 2026 · 14:02 WIB';

export const CURRENT_RATE = {
  rate: '16.234',
  changePercent: '0,8%',
  changeAbsolute: '-128',
  changeDir: 'down' as const,
};

export const HISTORICAL_POSITION = {
  label: 'Lebih tinggi dari 82% hari (90 hari terakhir)',
  min: '15.420',
  max: '16.280',
  percentile: 82,
};

// Membuat deret kurs sintetis yang mulus (gelombang sinus), bukan
// Math.random — supaya nilainya sama persis saat dirender di server maupun
// saat React "menghidupkan" ulang di klien (menghindari hydration mismatch).
// Dibatasi maksimal 30 titik apa pun rentang harinya, karena RateLineChart
// menampilkan label sumbu-X setiap 3 titik — kalau titiknya ratusan, sumbu
// jadi penuh sesak dan tidak terbaca.
function buildSeries(spanDays: number, endValue: number): ChartPoint[] {
  const pointCount = Math.min(spanDays, 30);
  const points: ChartPoint[] = [];

  for (let index = 0; index < pointCount; index++) {
    const isLast = index === pointCount - 1;
    const progress = index / (pointCount - 1 || 1);
    const daysAgo = Math.max(1, Math.round(spanDays * (1 - progress)));
    const wave = Math.sin(index / 2.6) * 55 + Math.sin(index / 6.5) * 28;

    points.push({
      day: isLast ? 'H-1' : `H-${daysAgo}`,
      rate: isLast ? endValue : Math.round(endValue - 90 + progress * 90 + wave),
    });
  }

  return points;
}

// Menempelkan sentimen berita ke titik-titik tertentu lewat INDEX (bukan
// lewat label "day"), karena label day berbeda-beda tergantung rentang waktu
// — index selalu valid selama di dalam panjang array.
function withMarkers(points: ChartPoint[], markers: Record<number, Sentiment>): ChartPoint[] {
  return points.map((point, index) =>
    index in markers ? { ...point, sentiment: markers[index] } : point,
  );
}

export const RATE_SERIES_7D = withMarkers(buildSeries(7, 16234), { 1: 'negatif', 4: 'netral' });
export const RATE_SERIES_30D = withMarkers(buildSeries(30, 16234), {
  6: 'positif',
  15: 'netral',
  24: 'negatif',
});
export const RATE_SERIES_90D = withMarkers(buildSeries(90, 16234), {
  5: 'positif',
  15: 'netral',
  25: 'negatif',
});
export const RATE_SERIES_1Y = withMarkers(buildSeries(365, 16234), {
  5: 'positif',
  15: 'netral',
  25: 'negatif',
});

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  sentiment: Sentiment;
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    headline: 'BI tahan suku bunga, rupiah tertekan jelang rilis data inflasi AS',
    source: 'Bisnis.com',
    timeAgo: '2 jam lalu',
    sentiment: 'negatif',
  },
  {
    id: '2',
    headline: 'Cadangan devisa Indonesia naik tipis ke USD 150,2 miliar',
    source: 'Kontan',
    timeAgo: '5 jam lalu',
    sentiment: 'netral',
  },
  {
    id: '3',
    headline: 'Dolar AS menguat seiring ekspektasi The Fed tunda pemangkasan',
    source: 'Reuters ID',
    timeAgo: 'Kemarin',
    sentiment: 'negatif',
  },
  {
    id: '4',
    headline: 'Surplus neraca perdagangan Mei lebih tinggi dari konsensus',
    source: 'CNBC Indonesia',
    timeAgo: '2 hari lalu',
    sentiment: 'positif',
  },
  {
    id: '5',
    headline: 'BI: intervensi tetap dilakukan untuk jaga stabilitas rupiah',
    source: 'Antara',
    timeAgo: '3 hari lalu',
    sentiment: 'netral',
  },
];

export const MARKET_MOVER = {
  summary:
    'Rupiah cenderung melemah pekan ini didorong ekspektasi The Fed menunda pemangkasan suku bunga dan menguatnya indeks dolar AS. Data domestik cadangan devisa dan neraca perdagangan relatif netral dan tidak cukup mengimbangi tekanan eksternal.',
  caption: 'Sentimen pekan ini: cenderung negatif (6 dari 10 berita)',
  split: { positif: 2, netral: 2, negatif: 6 },
};

export type AlertCondition = {
  id: string;
  pair: string;
  direction: 'atas' | 'bawah';
  threshold: string;
};

export const SEED_ALERTS: AlertCondition[] = [
  { id: '1', pair: 'USD/IDR', direction: 'atas', threshold: '16.500' },
  { id: '2', pair: 'EUR/IDR', direction: 'bawah', threshold: '17.000' },
  { id: '3', pair: 'JPY/IDR', direction: 'atas', threshold: '110,00' },
];

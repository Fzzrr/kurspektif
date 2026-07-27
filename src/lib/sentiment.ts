// Model sentimen berita — dipakai lintas fitur (dashboard, berita, landing
// page), makanya tinggal di sini (lib/) bukan di dalam salah satu komponen.
export type Sentiment = 'positif' | 'netral' | 'negatif';

export const SENTIMENT: Record<Sentiment, { color: string; label: string }> = {
  positif: { color: 'var(--color-up)', label: 'Positif' },
  netral: { color: 'var(--color-neutral)', label: 'Netral' },
  negatif: { color: 'var(--color-down)', label: 'Negatif' },
};

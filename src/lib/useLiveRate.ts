'use client';

import { useEffect, useState } from 'react';
import type { RatePoint } from './frankfurter';

export type LiveRateState = {
  latest: RatePoint | null;
  series: RatePoint[];
  isLoading: boolean;
  error: string | null;
};

type Result = { key: string; latest: RatePoint | null; series: RatePoint[]; error: string | null };

// Diambil sekali per pasangan — kurs referensi hanya terbit sekali per hari
// kerja, jadi polling berkala cuma membuang request.
export function useLiveRate(base: string, quote: string, days = 365): LiveRateState {
  const key = `${base}/${quote}/${days}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false; // respons lama tidak boleh menimpa pasangan yang lebih baru
    fetch(`/api/rates?base=${base}&quote=${quote}&days=${days}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setResult({ key, latest: data.latest, series: data.series, error: null });
      })
      .catch(() => {
        if (!cancelled) setResult((prev) => ({ key, latest: prev?.latest ?? null, series: prev?.series ?? [], error: 'Gagal memuat kurs' }));
      });
    return () => {
      cancelled = true;
    };
  }, [key, base, quote, days]);

  // Data pasangan sebelumnya tetap tampil selama pasangan baru dimuat.
  return {
    latest: result?.latest ?? null,
    series: result?.series ?? [],
    isLoading: result?.key !== key,
    error: result?.key === key ? result.error : null,
  };
}

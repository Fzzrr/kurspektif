'use client';

import { useEffect, useState } from 'react';
import type { RatePoint } from './frankfurter';

export type LiveRateState = {
  latest: RatePoint | null;
  series: RatePoint[];
  isLoading: boolean;
  error: string | null;
};

const POLL_INTERVAL_MS = 60_000; // 1 minute — "always updating" without hammering a free API

export function useLiveRate(base: string, quote: string, days = 365): LiveRateState {
  const [state, setState] = useState<LiveRateState>({ latest: null, series: [], isLoading: true, error: null });

  useEffect(() => {
    let cancelled = false; // guards against a slow old request overwriting a newer one

    async function load() {
      try {
        const res = await fetch(`/api/rates?base=${base}&quote=${quote}&days=${days}`);
        if (!res.ok) throw new Error('Failed to load rate');
        const data = await res.json();
        if (!cancelled) setState({ latest: data.latest, series: data.series, isLoading: false, error: null });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, isLoading: false, error: 'Failed to refresh rate' }));
      }
    }

    setState((s) => ({ ...s, isLoading: true }));
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [base, quote, days]); // re-runs (and resets the interval) whenever the pair changes

  return state;
}
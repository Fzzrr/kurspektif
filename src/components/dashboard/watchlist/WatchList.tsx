'use client';

import { useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import PillTabs from '../ui/PillTabs';

export type WatchItem = { pair: string; dayPct: number | null; percentile: number | null; node: ReactNode };

const SORTS = [
  { value: 'disimpan', label: 'Disimpan' },
  { value: 'gerak', label: 'Gerak terbesar' },
  { value: 'terendah', label: 'Dekat terendah' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

// Daftar Pantauan yang bisa diurutkan. Kartunya dirender di server (WatchRow)
// dan masuk sebagai `node`; di sini hanya urutannya yang berubah, jadi state
// alert di tiap kartu tetap utuh.
export default function WatchList({ items }: { items: WatchItem[] }) {
  const [sort, setSort] = useState<Sort>('disimpan');
  const sorted =
    sort === 'disimpan'
      ? items
      : [...items].sort((a, b) =>
          sort === 'gerak'
            ? Math.abs(b.dayPct ?? 0) - Math.abs(a.dayPct ?? 0)
            : (a.percentile ?? 101) - (b.percentile ?? 101),
        );

  // View Transitions: kartu meluncur ke urutan barunya. Browser tanpa dukungan
  // (atau pengguna yang meminta gerak minimal) langsung melihat urutan baru.
  function change(next: Sort) {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return setSort(next);
    document.startViewTransition(() => flushSync(() => setSort(next)));
  }

  return (
    <>
      {items.length > 1 && <PillTabs options={SORTS} value={sort} onChange={change} />}
      {sorted.map((item) => (
        <div key={item.pair} style={{ viewTransitionName: `pantau-${item.pair.replace('/', '-')}` }}>
          {item.node}
        </div>
      ))}
    </>
  );
}

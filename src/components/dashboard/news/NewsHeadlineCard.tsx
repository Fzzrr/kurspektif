'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import { SENTIMENT } from '@/lib/sentiment';
import { BookmarkIcon, ExternalLinkIcon } from '@/components/ui/icons';
import type { NewsItem } from '@/lib/mock/news';

type Props = { item: NewsItem };

export default function NewsHeadlineCard({ item }: Props) {
  const [saved, setSaved] = useState(false);
  const sentiment = SENTIMENT[item.sentiment];

  return (
    <DashboardCard className="border-l-4" style={{ borderLeftColor: sentiment.color }}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase text-paper"
          style={{ backgroundColor: sentiment.color }}
        >
          {sentiment.label}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wide text-accent">
          ✦ Headline
        </span>
        <span className="font-mono text-xs text-muted">
          {item.region} · {item.category}
        </span>
      </div>

      <h2 className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight">{item.headline}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{item.summary}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <span>{item.source} · {item.timeAgo}</span>
          {item.pair && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{item.pair}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan berita'}
            aria-pressed={saved}
            className="flex size-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <BookmarkIcon className="size-4" filled={saved} />
          </button>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 font-mono text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Baca selengkapnya
            <ExternalLinkIcon className="size-4" />
          </Link>
        </div>
      </div>
    </DashboardCard>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import SentimentBadge from './SentimentBadge';
import { BookmarkIcon, ExternalLinkIcon } from '@/components/ui/icons';
import type { NewsItem } from '@/lib/marketaux';
import { formatTimeAgo } from '@/lib/timeAgo';

type Props = { item: NewsItem };

export default function NewsHeadlineCard({ item }: Props) {
  const [saved, setSaved] = useState(false);

  return (
    <DashboardCard>
      <div className="flex h-full flex-col">
        {/* Tanpa gambar, wrapper ini jadi div biasa dan layout kembali satu kolom
          seperti semula — jadi berita tanpa thumbnail tidak menyisakan lubang. */}
        <div className="flex flex-wrap items-center gap-2">
          <SentimentBadge sentiment={item.sentiment} />
          <span className="flex items-center gap-1 font-mono text-[12px] font-medium text-accent">
             Headline
          </span>
        </div>

        {item.image && (
          // `flex-1` membuat gambar menyerap tinggi yang tidak dipakai teks —
          // kartu ini diregangkan setinggi kolom "Paling baru", jadi tanpa ini
          // deskripsi pendek menyisakan ruang kosong. `min-h-56` menjaga
          // gambar tetap layak saat deskripsinya panjang.
          <div className="group relative mt-4 min-h-56 flex-1 overflow-hidden rounded-2xl bg-paper ring-1 ring-white/10">
            <img
              src={item.image}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            {/* Gradien bawah melebur gambar ke kartu supaya tepinya tidak
                terasa terpotong keras di atas judul. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}

        <h2 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight">{item.headline}</h2>
        <p className="mt-3 line-clamp-4 max-w-2xl text-sm leading-relaxed text-muted">{item.summary}</p>

        {/* `mt-auto` mendorong baris aksi ke dasar kolom supaya sejajar dengan
              ujung bawah gambar; `pt-6` menjaga jarak minimum dari paragraf. */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span>{item.source} · {formatTimeAgo(item.publishedAt)}</span>
            {item.pair && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{item.pair}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSaved((current) => !current)}
              aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan berita'}
              aria-pressed={saved}
              className="flex size-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-accent-soft hover:text-ink"
            >
              <BookmarkIcon className="size-4" filled={saved} />
            </button>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 font-mono text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Baca selengkapnya
              <ExternalLinkIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
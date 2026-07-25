"use client";
// Kartu daftar berita terkait. Server Component — daftar statis dari mock,
// tidak perlu interaktivitas apa pun untuk halaman ini.
import Link from 'next/link';
import DashboardCard from './DashboardCard';
import { SENTIMENT } from '@/components/landing/rate/RateLineChart';
import { NEWS_ITEMS } from '@/lib/mock/dashboard';

export default function NewsListCard() {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Berita terkait</p>
        <Link href="/dashboard/berita" className="font-mono text-xs text-accent hover:underline">
          Lihat semua →
        </Link>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {NEWS_ITEMS.map((item) => (
          <li key={item.id} className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
            <span
              className="mt-1.5 inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: SENTIMENT[item.sentiment].color }}
            />
            <div className="min-w-0">
              <p className="text-sm leading-snug text-ink">{item.headline}</p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {item.source} · {item.timeAgo}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}

'use client';

// Kartu "apa yang menggerakkan pasangan ini". Dihitung dari kurs (selalu
// tersedia untuk semua pasangan), bukan dari berita — berita hanya konteks
// tambahan karena cakupannya tipis untuk kebanyakan mata uang.
import { useEffect, useState } from 'react';
import DashboardCard from '../ui/DashboardCard';
import type { NewsItem } from '@/lib/marketaux';
import type { WeeklyMovers } from '@/lib/movers';
import { dayLabel, isWithinDays } from '@/lib/timeAgo';

// ponytail: ambang tetap 0,2%/minggu; ganti ke volatilitas historis per pasangan
// kalau mata uang yang sangat stabil/volatil terasa salah label.
const STABLE_PCT = 0.2;

const pctFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2, signDisplay: 'exceptZero' });
const fmtPct = (value: number) => `${pctFormatter.format(value)}%`;
const signTone = (value: number) => (value > 0 ? 'text-up' : value < 0 ? 'text-down' : 'text-muted');
const isMoving = (value: number) => Math.abs(value) > STABLE_PCT;
// Di bawah ambang "stabil" warnanya netral — hijau/merah untuk +0,03% berlebihan.
const moveTone = (value: number) => (isMoving(value) ? signTone(value) : 'text-muted');
const moveBar = (value: number) => (!isMoving(value) ? 'bg-neutral' : value > 0 ? 'bg-up' : 'bg-down');
const verb = (value: number) => (value > 0 ? 'menguat' : 'melemah');

function explain({ pairChangePct, sides: [base, quote] }: WeeklyMovers): string {
  if (!isMoving(pairChangePct)) return 'Pasangan ini nyaris tidak berubah minggu ini.';
  const opposite = Math.sign(base.strengthPct) !== Math.sign(quote.strengthPct);
  if (isMoving(base.strengthPct) && isMoving(quote.strengthPct) && opposite) {
    return `Kedua sisi mendorong ke arah yang sama: ${base.code} ${verb(base.strengthPct)}, ${quote.code} ${verb(quote.strengthPct)}.`;
  }
  const driver = Math.abs(base.strengthPct) >= Math.abs(quote.strengthPct) ? base : quote;
  return `Pergerakan minggu ini terutama datang dari sisi ${driver.code}.`;
}

type Props = { news: NewsItem[]; pair: string };

export default function MarketMoversCard({ news, pair }: Props) {
  const [base, quote] = pair.split('/');
  const [result, setResult] = useState<{ pair: string; data: WeeklyMovers | null } | null>(null);

  useEffect(() => {
    if (base === quote) return;
    let cancelled = false; // respons lama tidak boleh menimpa pasangan yang lebih baru
    fetch(`/api/movers?base=${base}&quote=${quote}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WeeklyMovers | null) => {
        if (!cancelled) setResult({ pair, data });
      })
      .catch(() => {
        if (!cancelled) setResult({ pair, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [pair, base, quote]);

  const loading = !result || result.pair !== pair;
  const movers = loading ? null : result.data;

  const weekNews = news.filter((item) => isWithinDays(item.publishedAt, 7));
  const newsCount = (code: string) => weekNews.filter((item) => item.pair?.split('/').includes(code)).length;
  // Bar terpanjang = setengah lebar track (bar tumbuh dari garis tengah).
  const maxAbs = movers ? Math.max(...movers.ranking.map((s) => Math.abs(s.strengthPct)), 0.01) : 1;

  return (
    <DashboardCard>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Yang menggerakkan {pair} minggu ini</p>
        {movers && (
          <span className={`font-mono text-sm font-medium ${signTone(movers.pairChangePct)}`}>
            {fmtPct(movers.pairChangePct)}
          </span>
        )}
      </div>

      {base === quote ? (
        <p className="mt-3 text-sm text-muted">Pilih dua mata uang yang berbeda.</p>
      ) : loading ? (
        <p className="mt-3 animate-pulse font-mono text-xs text-muted">Menghitung pergerakan…</p>
      ) : !movers ? (
        <p className="mt-3 text-sm text-muted">Data kurs minggu ini belum cukup untuk dianalisis.</p>
      ) : (
        <>
          {/* Kesimpulan dulu, buktinya di bawah. */}
          <p className="mt-2 text-sm leading-relaxed text-ink">{explain(movers)}</p>

          <p className="mt-6 font-mono text-xs text-muted">Kekuatan terhadap mata uang utama, 7 hari terakhir</p>
          <ul className="mt-3 space-y-2.5">
            {movers.ranking.map(({ code, strengthPct }) => {
              const inPair = code === base || code === quote;
              const width = `${(Math.abs(strengthPct) / maxAbs) * 50}%`;
              return (
                <li key={code} className="flex items-center gap-3">
                  <span className={`w-10 shrink-0 font-mono text-xs ${inPair ? 'font-medium text-ink' : 'text-muted'}`}>
                    {code}
                  </span>
                  <div aria-hidden className="relative h-1.5 flex-1">
                    <span className="absolute inset-y-[-3px] left-1/2 w-px bg-line" />
                    <span
                      className={`absolute inset-y-0 rounded-full ${moveBar(strengthPct)} ${inPair ? '' : 'opacity-35'}`}
                      style={strengthPct >= 0 ? { left: '50%', width } : { right: '50%', width }}
                    />
                  </div>
                  <span
                    className={`w-14 shrink-0 text-right font-mono text-xs ${inPair ? moveTone(strengthPct) : 'text-muted'}`}
                  >
                    {fmtPct(strengthPct)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
            {movers.volatileDay && Math.abs(movers.volatileDay.changePct) >= 0.01 && (
              <p>
                Paling bergejolak: <span className="text-ink">{dayLabel(movers.volatileDay.date)}</span>{' '}
                <span className={signTone(movers.volatileDay.changePct)}>{fmtPct(movers.volatileDay.changePct)}</span>
              </p>
            )}
            <p>
              Berita minggu ini: {base} {newsCount(base)}, {quote} {newsCount(quote)}
            </p>
          </div>
        </>
      )}
    </DashboardCard>
  );
}

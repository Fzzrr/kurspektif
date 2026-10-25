'use client';

// Kartu "apa yang menggerakkan pasangan ini". Dihitung dari kurs (selalu
// tersedia untuk semua pasangan), bukan dari berita — berita hanya konteks
// tambahan karena cakupannya tipis untuk kebanyakan mata uang.
import { useEffect, useState } from 'react';
import DashboardCard from '../ui/DashboardCard';
import type { NewsItem } from '@/lib/marketaux';
import type { WeeklyMovers } from '@/lib/movers';
import { dayLabel, isWithinDays, todayKey } from '@/lib/timeAgo';
import { explain, fmtPct, isMoving } from '@/lib/moversText';
import { CALENDAR_CURRENCIES, eventsFor } from '@/lib/calendar';

const signTone = (value: number) => (value > 0 ? 'text-up' : value < 0 ? 'text-down' : 'text-muted');
// Di bawah ambang "stabil" warnanya netral — hijau/merah untuk +0,03% berlebihan.
const moveTone = (value: number) => (isMoving(value) ? signTone(value) : 'text-muted');
const moveBar = (value: number) => (!isMoving(value) ? 'bg-neutral' : value > 0 ? 'bg-up' : 'bg-down');
type Props = {
  news: NewsItem[];
  pair: string;
  /** Hasil yang sudah dihitung di server (halaman kurs publik) — lewati fetch. */
  initialMovers?: WeeklyMovers | null;
};

export default function MarketMoversCard({ news, pair, initialMovers }: Props) {
  const [base, quote] = pair.split('/');
  const [result, setResult] = useState<{ pair: string; data: WeeklyMovers | null } | null>(
    initialMovers === undefined ? null : { pair, data: initialMovers },
  );

  useEffect(() => {
    if (base === quote || initialMovers !== undefined) return;
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
  }, [pair, base, quote, initialMovers]);

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

      {base !== quote && <Agenda base={base} quote={quote} />}
    </DashboardCard>
  );
}

// Jadwal resmi yang menyangkut pasangan ini: 7 hari ke belakang (bisa jadi
// penyebab pergerakan minggu ini) dan 14 hari ke depan.
function Agenda({ base, quote }: { base: string; quote: string }) {
  const today = todayKey();
  const events = [...eventsFor([base, quote], today, -7), ...eventsFor([base, quote], today, 14)].filter(
    (event, i, all) => all.indexOf(event) === i, // hari ini masuk ke dua jendela
  );
  const covered = [base, quote].some((code) => CALENDAR_CURRENCIES.includes(code));

  return (
    <div className="mt-6">
      <p className="font-mono text-xs text-muted">Agenda yang bisa menggerakkan kurs</p>
      {events.length === 0 ? (
        <p className="mt-2 text-xs text-muted">
          {covered
            ? 'Tidak ada jadwal besar dalam 7 hari terakhir dan 14 hari ke depan.'
            : `Kalender baru mencakup ${CALENDAR_CURRENCIES.join(', ')}.`}
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {events.map((event) => {
            const past = event.date < today;
            return (
              <li key={`${event.date}${event.title}`} className={`flex gap-3 text-xs ${past ? 'text-muted' : 'text-ink'}`}>
                <span className="w-24 shrink-0 font-mono text-muted">
                  {dayLabel(event.date)}
                  {event.time && <span className="block">{event.time} WIB</span>}
                </span>
                <span className="min-w-0">
                  {event.title}
                  <span className="block text-muted">{past ? 'Sudah lewat. ' : ''}{event.why}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

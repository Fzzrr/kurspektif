// Halaman kurs publik per pasangan — bisa dibuka tanpa login dan diindeks
// mesin pencari. Isinya versi baca-saja dari dashboard, plus ajakan daftar.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicShell from '@/components/landing/PublicShell';
import StatCardsRow from '@/components/dashboard/rate/StatCardsRow';
import RateChartCard from '@/components/dashboard/rate/RateChartCard';
import MarketMoversCard from '@/components/dashboard/rate/MarketMoversCard';
import DashboardCard from '@/components/dashboard/ui/DashboardCard';
import Reveal from '@/components/landing/motion/Reveal';
import RateDateForm from '@/components/landing/rate/RateDateForm';
import { currencyToFlag } from '@/lib/flags';
import { fetchLatestRate, fetchRateSeries, resolvePairSlug, toISODate } from '@/lib/frankfurter';
import { fetchWeeklyMovers } from '@/lib/movers';
import { newsForCurrencies } from '@/lib/marketaux';
import { FEATURED_PAIRS, pairToSlug } from '@/lib/pairs';
import { dailyChange, formatRate, historicalPosition } from '@/lib/rateStats';
import { SENTIMENT } from '@/lib/sentiment';
import { dayKey, dayLabel } from '@/lib/timeAgo';

// Kurs referensi terbit sekali sehari — render ulang paling sering per jam.
export const revalidate = 3600;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return FEATURED_PAIRS.map((pair) => ({ pair: pairToSlug(pair) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolvePairSlug((await params).pair);
  if (!resolved) return {};
  const { base, quote, baseName, quoteName } = resolved;
  return {
    title: `Kurs ${base} ke ${quote} hari ini — Kurspektif`,
    description: `Kurs ${baseName} (${base}) ke ${quoteName} (${quote}) hari ini, grafik setahun, posisinya dibanding 90 hari terakhir, dan apa yang menggerakkannya minggu ini.`,
    alternates: { canonical: `/kurs/${pairToSlug(`${base}/${quote}`)}` },
  };
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default async function KursPage({ params }: Props) {
  const resolved = await resolvePairSlug((await params).pair);
  if (!resolved) notFound();
  const { base, quote, baseName, quoteName } = resolved;
  const pair = `${base}/${quote}`;

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 365);
  const [rates, movers, news] = await Promise.all([
    Promise.all([fetchLatestRate(base, quote), fetchRateSeries(base, quote, toISODate(from), toISODate(to))]).catch(
      () => null,
    ),
    fetchWeeklyMovers(base, quote).catch(() => null),
    newsForCurrencies([base, quote], 6).catch(() => []),
  ]);

  const flag = (code: string) => currencyToFlag(code) ?? '';

  const change = rates ? dailyChange(rates[1], rates[0]) : null;

  return (
    <PublicShell>
      <h1 className="text-balance text-[clamp(44px,7vw,104px)] font-black leading-[0.9] tracking-[-0.04em]">
        Kurs {base} ke {quote} hari ini
      </h1>
      <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed">
        {flag(base)} {baseName} ke {flag(quote)} {quoteName}.
        {rates && <> Kurs referensi harian per {dateFormatter.format(new Date(rates[0].date))}.</>}
      </p>

      {!rates ? (
        <p className="mt-12 text-[17px] text-down">Kurs sedang tidak bisa dimuat. Coba lagi beberapa saat lagi.</p>
      ) : (
        <>
          <Reveal>
            <p className="mt-16 text-[clamp(88px,15vw,240px)] font-black leading-[0.8] tracking-[-0.05em] tabular-nums sm:mt-24">
              {formatRate(rates[0].rate)}
            </p>
            <p className="mt-5 text-[17px] tabular-nums">
              {quote} per 1 {base}
              {change?.changeDir && (
                <span
                  className={
                    change.changeDir === 'up' ? 'text-up' : change.changeDir === 'down' ? 'text-down' : 'text-muted'
                  }
                >
                  {' '}
                  · {change.changeDir === 'up' ? '+' : change.changeDir === 'down' ? '−' : ''}
                  {change.changePercent} dari hari kerja sebelumnya
                </span>
              )}
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-20 space-y-5 sm:mt-28">
            <div data-ui className="space-y-5">
              <StatCardsRow
                currentRate={{
                  rate: formatRate(rates[0].rate),
                  ...dailyChange(rates[1], rates[0]),
                  pair,
                  sparkline: rates[1].slice(-30).map((p) => p.rate),
                }}
                quickConvert={{
                  rate: rates[0].rate,
                  fromCode: base,
                  toCode: quote,
                }}
                historicalPosition={historicalPosition(rates[1], rates[0])}
              />
              <RateChartCard series={rates[1]} pair={pair} />
            </div>
          </Reveal>
        </>
      )}

      <Reveal delay={130}>
        <section className="mt-5 flex flex-col gap-5 rounded-2xl bg-surface p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[17px] font-semibold">Kurs pada tanggal tertentu</h2>
            <p className="mt-1 max-w-[52ch] text-[15px] text-muted">
              Untuk laporan, klaim perjalanan, atau sekadar membandingkan: kurs referensi {base}/{quote} di hari apa
              pun sejak 1999.
            </p>
          </div>
          <RateDateForm slug={pairToSlug(pair)} />
        </section>
      </Reveal>

      <Reveal delay={160}>
        <div data-ui className="mt-5 grid gap-4 lg:grid-cols-[3fr_2fr]">
          <MarketMoversCard news={news} pair={pair} initialMovers={movers} />

          <DashboardCard>
            <h2 className="text-[17px] font-semibold">
              Berita terkait {base} &amp; {quote}
            </h2>
            {news.length === 0 ? (
              <p className="mt-3 text-[15px] text-muted">Belum ada berita yang membahas pasangan ini.</p>
            ) : (
              <ul className="mt-4 space-y-5">
                {news.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] leading-snug hover:underline"
                    >
                      {item.headline}
                    </a>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{
                          backgroundColor: SENTIMENT[item.sentiment].color,
                        }}
                        aria-hidden
                      />
                      {SENTIMENT[item.sentiment].label} · {item.source} · {dayLabel(dayKey(item.publishedAt))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>
      </Reveal>

      <p className="mt-16 text-[15px] text-muted">
        Kurs tengah referensi bank sentral, bukan kurs jual/beli bank atau money changer.{' '}
        <Link href="/metodologi" className="text-ink underline underline-offset-4 hover:decoration-transparent">
          Cara kami menghitung
        </Link>
        .
      </p>
    </PublicShell>
  );
}

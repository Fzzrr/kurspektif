// Kurs sebuah pasangan pada tanggal tertentu, mis. /kurs/usd-idr/2025-01-01.
// Untuk laporan keuangan, klaim perjalanan, atau sekadar "dulu berapa?".
// Halaman publik, tidak masuk sitemap (tanggalnya tak terhingga).
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicShell from '@/components/landing/PublicShell';
import RateDateForm from '@/components/landing/rate/RateDateForm';
import { fetchLatestRate, fetchRateOnOrBefore, resolvePairSlug } from '@/lib/frankfurter';
import { pairToSlug } from '@/lib/pairs';
import { formatRate } from '@/lib/rateStats';
import { fmtPct } from '@/lib/moversText';
import { FIRST_RATE_DATE, parseRateDate } from '@/lib/timeAgo';

// Kurs masa lalu tidak berubah, tapi pembandingnya (kurs terbaru) berubah tiap hari.
export const revalidate = 3600;

type Props = { params: Promise<{ pair: string; tanggal: string }> };

const longDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

const AMOUNTS = [1, 10, 100, 1_000, 10_000];

async function resolve(params: Props['params']) {
  const { pair, tanggal } = await params;
  const date = parseRateDate(tanggal);
  const resolved = date ? await resolvePairSlug(pair) : null;
  return resolved && date ? { ...resolved, date } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { base, quote, baseName, quoteName, date } = resolved;
  const day = longDate.format(asDate(date));
  return {
    title: `Kurs ${base} ke ${quote} pada ${day} — Kurspektif`,
    description: `Kurs referensi ${baseName} (${base}) ke ${quoteName} (${quote}) pada ${day}, dibanding kurs terbaru, dengan tabel konversi.`,
    alternates: { canonical: `/kurs/${pairToSlug(`${base}/${quote}`)}/${date}` },
  };
}

export default async function KursTanggalPage({ params }: Props) {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  const { base, quote, baseName, quoteName, date } = resolved;
  const slug = pairToSlug(`${base}/${quote}`);

  const [onDate, latest] = await Promise.all([
    fetchRateOnOrBefore(base, quote, date).catch(() => undefined),
    fetchLatestRate(base, quote).catch(() => null),
  ]);
  const shifted = onDate && onDate.date !== date;
  const sincePct = onDate && latest ? (latest.rate / onDate.rate - 1) * 100 : null;
  const sinceTone = sincePct === null || fmtPct(sincePct) === '0%' ? 'text-muted' : sincePct > 0 ? 'text-up' : 'text-down';

  return (
    <PublicShell>
      <h1 className="text-balance text-[clamp(36px,5.5vw,80px)] font-black leading-[0.95] tracking-[-0.04em]">
        Kurs {base} ke {quote} pada {longDate.format(asDate(date))}
      </h1>
      <p className="mt-5 max-w-[60ch] text-[17px] leading-relaxed">
        {baseName} ke {quoteName}.{' '}
        {shifted
          ? `${fullDate.format(asDate(date))} tidak ada kurs referensi (akhir pekan atau hari libur), jadi yang berlaku adalah kurs hari kerja sebelumnya: ${fullDate.format(asDate(onDate.date))}.`
          : onDate
            ? `Kurs referensi harian ${fullDate.format(asDate(date))}.`
            : ''}
      </p>

      {onDate === undefined ? (
        <p className="mt-12 text-[17px] text-down">Kurs sedang tidak bisa dimuat. Coba lagi beberapa saat lagi.</p>
      ) : onDate === null ? (
        <p className="mt-12 max-w-[60ch] text-[17px] leading-relaxed">
          Belum ada kurs {base}/{quote} untuk tanggal itu. Data referensi dimulai {longDate.format(asDate(FIRST_RATE_DATE))},
          dan sebagian mata uang baru tersedia jauh setelahnya. Coba tanggal yang lebih baru.
        </p>
      ) : (
        <>
          <p className="mt-14 text-[clamp(72px,12vw,180px)] font-black leading-[0.85] tracking-[-0.05em] tabular-nums">
            {formatRate(onDate.rate)}
          </p>
          <p className="mt-4 text-[17px] tabular-nums">
            {quote} per 1 {base}
          </p>

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-surface p-6">
              <h2 className="text-[17px] font-semibold">Dibanding sekarang</h2>
              {latest && sincePct !== null ? (
                <dl className="mt-5 grid grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm text-muted">Kurs terbaru ({longDate.format(asDate(latest.date))})</dt>
                    <dd className="mt-1 font-mono text-2xl">{formatRate(latest.rate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Perubahan sejak itu</dt>
                    <dd className={`mt-1 font-mono text-2xl ${sinceTone}`}>{fmtPct(sincePct)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-[15px] text-muted">Kurs terbaru sedang tidak bisa dimuat.</p>
              )}
              <p className="mt-5 text-[15px] text-muted">
                <Link href={`/kurs/${slug}`} className="text-ink underline underline-offset-4 hover:decoration-transparent">
                  Grafik dan kurs {base}/{quote} hari ini
                </Link>
              </p>
            </section>

            <section className="rounded-2xl bg-surface p-6">
              <h2 className="text-[17px] font-semibold">Konversi dengan kurs ini</h2>
              <table className="mt-4 w-full text-[15px]">
                <tbody className="divide-y divide-line">
                  {AMOUNTS.map((amount) => (
                    <tr key={amount}>
                      <td className="py-2.5 font-mono">
                        {amount.toLocaleString('id-ID')} {base}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {formatRate(amount * onDate.rate)} {quote}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </>
      )}

      <section className="mt-14 rounded-2xl bg-surface p-6">
        <h2 className="text-[17px] font-semibold">Cek tanggal lain</h2>
        <div className="mt-4">
          <RateDateForm slug={slug} initial={date} />
        </div>
      </section>

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

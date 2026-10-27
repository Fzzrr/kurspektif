import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { watchedPairs, watchlistSnapshot } from '@/lib/watchlist';
import { formatRate } from '@/lib/rateStats';
import { fmtPct, isMoving } from '@/lib/moversText';
import { currencyToFlag } from '@/lib/flags';
import RemovePairButton from '@/components/dashboard/RemovePairButton';

export const metadata = { title: 'Pasangan saya — Kurspektif' };

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export default async function PasanganSayaPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [pairs, user] = userId
    ? await Promise.all([
        watchedPairs(userId),
        prisma.user.findUnique({ where: { id: userId }, select: { weeklyDigest: true } }),
      ])
    : [[], null];
  const rows = await watchlistSnapshot(pairs).catch(() => pairs.map((pair) => ({ pair, rate: null, date: null, weekPct: null, reason: null, movers: null })));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Pasangan saya</h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed">
        Pasangan yang kamu simpan dari dashboard, dengan perubahan 7 hari terakhir.{' '}
        {user?.weeklyDigest
          ? 'Ringkasannya dikirim ke emailmu tiap Senin pagi.'
          : 'Ringkasan mingguan sedang mati; nyalakan di Profil.'}
      </p>

      {rows.length === 0 ? (
        <div className="mt-10 bg-surface px-6 py-10">
          <p className="text-[17px] font-medium">Belum ada pasangan tersimpan</p>
          <p className="mt-2 max-w-[56ch] text-[15px] text-muted">
            Pilih pasangan di dashboard, lalu tekan tombol simpan di samping pemilih mata uang. Pasangan yang disimpan
            muncul di sini dan di email ringkasan tiap Senin.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block bg-ink px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-muted">
            Buka dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line">
          {rows.map((row) => {
            const [base, quote] = row.pair.split('/');
            const tone =
              row.weekPct === null || !isMoving(row.weekPct) ? 'text-muted' : row.weekPct > 0 ? 'text-up' : 'text-down';
            return (
              <li key={row.pair} className="grid gap-4 py-6 md:grid-cols-12 md:items-center md:gap-6">
                <div className="md:col-span-3">
                  <p className="text-[28px] font-semibold tracking-[-0.02em]">
                    {currencyToFlag(base)} {row.pair}
                  </p>
                  <p className="mt-1 text-sm text-muted tabular-nums">
                    {row.rate !== null ? `1 ${base} = ${formatRate(row.rate)} ${quote}` : 'Kurs belum tersedia'}
                    {row.date && ` · ${dateFormatter.format(new Date(row.date))}`}
                  </p>
                </div>
                <p className={`text-[22px] font-semibold tabular-nums md:col-span-2 ${tone}`}>
                  {row.weekPct !== null ? fmtPct(row.weekPct) : '—'}
                  <span className="block text-sm font-normal text-muted">7 hari</span>
                </p>
                <p className="text-[15px] leading-relaxed md:col-span-4">{row.reason ?? 'Data minggu ini belum cukup.'}</p>
                <div className="flex flex-wrap items-center gap-2 md:col-span-3 md:justify-end">
                  <Link
                    href={`/dashboard?pair=${base}-${quote}`}
                    className="bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-muted"
                  >
                    Buka di dashboard
                  </Link>
                  <RemovePairButton pair={row.pair} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

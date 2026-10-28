import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MAX_PAIRS, watchedPairs, watchlistSnapshot, type WatchedSnapshot } from '@/lib/watchlist';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import { toAlertDTO } from '@/lib/alerts';
import { eventsFor } from '@/lib/calendar';
import { todayKey } from '@/lib/timeAgo';
import WatchRow from '@/components/dashboard/watchlist/WatchRow';
import AddPair from '@/components/dashboard/watchlist/AddPair';
import WeekAgenda from '@/components/dashboard/watchlist/WeekAgenda';

export const metadata = { title: 'Pantauan — Kurspektif' };

// Hari kalender yang diambil supaya dapat ~90 hari kerja untuk grafik & posisi.
const HISTORY_DAYS = 135;

export default async function PantauanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [pairs, user, alerts, currencies] = userId
    ? await Promise.all([
        watchedPairs(userId),
        prisma.user.findUnique({ where: { id: userId }, select: { weeklyDigest: true } }),
        prisma.rateAlert.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        fetchSupportedCurrencies().catch(() => []),
      ])
    : [[], null, [], []];
  const rows: WatchedSnapshot[] = await watchlistSnapshot(pairs, HISTORY_DAYS).catch(() =>
    pairs.map((pair) => ({ pair, rate: null, date: null, weekPct: null, reason: null, movers: null, series: [] })),
  );

  const names = new Map(currencies.map((c) => [c.code, c.name]));
  const alertDTOs = alerts.map(toAlertDTO);
  const codes = [...new Set(pairs.flatMap((pair) => pair.split('/')))];
  const events = eventsFor(codes, todayKey(), 7);
  const addPair = <AddPair currencies={currencies} saved={pairs} max={MAX_PAIRS} />;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Pantauan</h1>
      <p className="mt-2 max-w-[64ch] text-[15px] text-muted">
        <span className="font-mono text-ink">{pairs.length}</span> dari {MAX_PAIRS} pasangan dipantau.{' '}
        {user?.weeklyDigest
          ? 'Ringkasannya dikirim ke emailmu tiap Senin pagi.'
          : 'Ringkasan mingguan sedang mati; nyalakan di Profil.'}
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
        <div className="min-w-0 space-y-4">
          {rows.length === 0 ? (
            <section className="rounded-2xl bg-surface p-6">
              <h2 className="text-lg font-semibold">Belum ada pasangan dipantau</h2>
              <p className="mt-2 max-w-[56ch] text-[15px] text-muted">
                Pasangan yang kamu pantau tampil di sini dengan posisi kursnya dalam 90 hari, alert, dan agenda bank
                sentral yang bisa menggerakkannya. Mulai dari salah satu saran di bawah atau pilih sendiri.
              </p>
              <div className="mt-6 max-w-md">{addPair}</div>
            </section>
          ) : (
            rows.map((row) => {
              const [base, quote] = row.pair.split('/');
              return (
                <WatchRow
                  key={row.pair}
                  row={row}
                  baseName={names.get(base) ?? base}
                  quoteName={names.get(quote) ?? quote}
                  alerts={alertDTOs.filter((a) => a.base === base && a.quote === quote)}
                />
              );
            })
          )}
        </div>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-10 xl:self-start">
          {rows.length > 0 && (
            <section className="rounded-2xl bg-surface p-5">
              <h2 className="text-sm font-medium">Tambah pasangan</h2>
              <div className="mt-4">{addPair}</div>
            </section>
          )}
          <WeekAgenda events={events} pairs={pairs} />
        </aside>
      </div>
    </div>
  );
}

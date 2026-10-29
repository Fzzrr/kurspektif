// Dipanggil Vercel Cron sekali sehari (lihat vercel.json). Tiga tugas harian
// dalam satu route, karena paket Hobby Vercel hanya memberi dua cron:
// 1. memperbarui arsip berita;
// 2. mengecek alert yang belum tercapai, mengirim email, lalu menandainya
//    tercapai supaya tidak terkirim berulang;
// 3. mengabarkan pasangan Pantauan yang bergerak tajam dari hari kerja sebelumnya.
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { fetchUsdRates, toISODate } from '@/lib/frankfurter';
import { POSITION_DAYS, describeCondition, isHit, isPositional, percentileOf, type AlertDirection } from '@/lib/alerts';
import { EMAIL_SENDER } from '@/lib/email';
import { formatRate } from '@/lib/rateStats';
import { refreshNewsArchive } from '@/lib/marketaux';
import { fetchWeeklyMoversMany } from '@/lib/movers';
import { explain } from '@/lib/moversText';
import { alertEmail, movesEmail } from '@/lib/emailTemplates';
import { SHARP_MOVE_PCT, newSharpMove } from '@/lib/moves';
import { watchlistSnapshot } from '@/lib/watchlist';
import { unsubscribeApiUrl, unsubscribePageUrl } from '@/lib/unsubscribe';

type SendResult = { failed: number; errors: string[] };

export async function GET(request: Request) {
  // Vercel Cron mengirim "Authorization: Bearer <CRON_SECRET>". Tanpa secret
  // terpasang, semua permintaan ditolak — route ini publik secara URL.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.APP_URL || new URL(request.url).origin;
  // Tiap tugas berdiri sendiri: satu gagal tidak menghentikan yang lain.
  const [newArticles, alerts, moves] = await Promise.all([
    refreshNewsArchive(),
    checkAlerts(resend, baseUrl).catch((err) => ({ checked: 0, triggered: 0, failed: 0, errors: [`Alert: ${String(err)}`] })),
    notifyMoves(resend, baseUrl).catch((err) => ({ users: 0, sent: 0, failed: 0, errors: [`Gerak tajam: ${String(err)}`] })),
  ]);

  // Rute ini dilindungi CRON_SECRET, jadi aman menyertakan alasan kegagalan.
  return NextResponse.json({ newArticles, ...alerts, moves });
}

async function checkAlerts(resend: Resend, baseUrl: string): Promise<SendResult & { checked: number; triggered: number }> {
  const alerts = await prisma.rateAlert.findMany({
    where: { triggeredAt: null },
    include: { user: { select: { email: true } } },
  });
  if (alerts.length === 0) return { checked: 0, triggered: 0, failed: 0, errors: [] };

  // Satu permintaan ke Frankfurter untuk semua mata uang yang dipakai —
  // setahun penuh, karena alert posisi butuh riwayatnya.
  const codes = [...new Set(alerts.flatMap((alert) => [alert.base, alert.quote]))].filter((code) => code !== 'USD');
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - POSITION_DAYS);
  const byDate = codes.length > 0 ? await fetchUsdRates(codes, toISODate(from), toISODate(to)) : new Map();
  const days = [...byDate.keys()].sort().map((date) => ({ date, rates: { USD: 1, ...byDate.get(date) } as Record<string, number> }));

  // Kurs pasangan per hari, hanya hari yang punya kedua sisi — mata uang di
  // luar ECB kadang diperbarui di hari berbeda.
  const pairSeries = (base: string, quote: string) =>
    days.filter(({ rates }) => rates[base] && rates[quote]).map(({ date, rates }) => ({ date, rate: rates[quote] / rates[base] }));

  // Kumpulkan dulu alert yang tercapai, supaya penggerak mingguannya cukup
  // diambil sekali untuk semua pasangan yang terlibat.
  const hits = alerts.flatMap((alert) => {
    const series = pairSeries(alert.base, alert.quote);
    if (series.length === 0) return [];
    const rates = series.map((point) => point.rate);
    const rate = rates[rates.length - 1];
    const percentile = percentileOf(rate, rates);
    if (!isHit(alert.direction as AlertDirection, rate, alert.threshold, percentile)) return [];
    const prev = rates.at(-2);
    return [{
      alert,
      rate,
      date: series[series.length - 1].date,
      percentile,
      dayPct: prev ? (rate / prev - 1) * 100 : null,
      yearHigh: rate >= Math.max(...rates),
      yearLow: rate <= Math.min(...rates),
    }];
  });
  const hitPairs = [...new Set(hits.map(({ alert }) => `${alert.base}/${alert.quote}`))];
  const movers = hitPairs.length > 0 ? await fetchWeeklyMoversMany(hitPairs).catch(() => new Map()) : new Map();

  let triggered = 0;
  const errors: string[] = [];

  // ponytail: kirim satu per satu; free tier Resend ~2 email/detik — tambah
  // jeda atau batch API kalau banyak alert tercapai di hari yang sama.
  for (const { alert, rate, date, percentile, dayPct, yearHigh, yearLow } of hits) {
    const pair = `${alert.base}/${alert.quote}`;
    const direction = alert.direction as AlertDirection;
    const week = movers.get(pair);
    const email = alertEmail({
      pair,
      condition: describeCondition(
        direction,
        isPositional(direction) ? String(alert.threshold) : formatRate(alert.threshold),
        alert.quote,
      ),
      rate,
      date,
      dayPct,
      yearPercentile: percentile,
      yearHigh,
      yearLow,
      reason: week ? explain(week) : null,
      pairUrl: `${baseUrl}/dashboard?pair=${alert.base}-${alert.quote}`,
      manageUrl: `${baseUrl}/dashboard#alert`,
    });
    const sent = await resend.emails.send({ from: EMAIL_SENDER, to: alert.user.email, ...email });
    // Gagal kirim → jangan tandai tercapai, supaya dicoba lagi besok.
    if (sent.error) {
      const reason = `${pair} (alert ${alert.id}): ${sent.error.message}`;
      console.error('Alert email gagal:', reason);
      errors.push(reason);
      continue;
    }
    await prisma.rateAlert.update({ where: { id: alert.id }, data: { triggeredAt: new Date(), triggeredRate: rate } });
    triggered++;
  }

  return { checked: alerts.length, triggered, failed: errors.length, errors };
}

// Satu email per pengguna berisi semua pasangan Pantauan-nya yang bergerak
// >= SHARP_MOVE_PCT dari hari kerja sebelumnya. Tanggal kurs yang dikabarkan
// disimpan di WatchedPair.lastMoveDate supaya tidak terkirim lagi besok kalau
// kurs belum terbit (akhir pekan, libur).
async function notifyMoves(resend: Resend, baseUrl: string): Promise<SendResult & { users: number; sent: number }> {
  const users = await prisma.user.findMany({
    where: { moveAlerts: true, watchedPairs: { some: {} } },
    select: {
      id: true,
      email: true,
      name: true,
      watchedPairs: { orderBy: { createdAt: 'asc' }, select: { id: true, base: true, quote: true, lastMoveDate: true } },
    },
  });
  const result = { users: 0, sent: 0, failed: 0, errors: [] as string[] };
  if (users.length === 0) return result;

  // ~90 hari kerja: kurs dua hari terakhir untuk geraknya, sisanya untuk posisi.
  const pairs = [...new Set(users.flatMap((user) => user.watchedPairs.map((p) => `${p.base}/${p.quote}`)))];
  const snapshots = new Map((await watchlistSnapshot(pairs, 135)).map((row) => [row.pair, row]));

  // ponytail: kirim satu per satu seperti alert; pakai batch API kalau
  // penggunanya sudah ratusan.
  for (const user of users) {
    const moves = user.watchedPairs.flatMap((watched) => {
      const pair = `${watched.base}/${watched.quote}`;
      const snapshot = snapshots.get(pair);
      const move = snapshot ? newSharpMove(snapshot.series, watched.lastMoveDate) : null;
      if (!snapshot || !move) return [];
      const window = snapshot.series.slice(-90).map((point) => point.rate);
      return [{
        watchedId: watched.id,
        row: {
          pair,
          ...move,
          percentile90: window.length >= 20 ? percentileOf(move.rate, window) : null,
          reason: snapshot.reason,
          url: `${baseUrl}/dashboard?pair=${watched.base}-${watched.quote}`,
        },
      }];
    });
    if (moves.length === 0) continue;
    result.users++;

    const email = movesEmail({
      name: user.name,
      rows: moves.map(({ row }) => row),
      thresholdPct: SHARP_MOVE_PCT,
      pantauanUrl: `${baseUrl}/dashboard/pantauan`,
      unsubscribeUrl: unsubscribePageUrl(baseUrl, user.id, 'gerak'),
    });
    const sent = await resend.emails.send({
      from: EMAIL_SENDER,
      to: user.email,
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(baseUrl, user.id, 'gerak')}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      ...email,
    });
    // Gagal kirim → jangan tandai terkabar, supaya dicoba lagi besok.
    if (sent.error) {
      const reason = `Gerak tajam (user ${user.id}): ${sent.error.message}`;
      console.error(reason);
      result.failed++;
      result.errors.push(reason);
      continue;
    }
    await prisma.$transaction(
      moves.map(({ watchedId, row }) =>
        prisma.watchedPair.update({ where: { id: watchedId }, data: { lastMoveDate: row.date } }),
      ),
    );
    result.sent++;
  }
  return result;
}

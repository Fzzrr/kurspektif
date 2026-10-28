// Dipanggil Vercel Cron sekali sehari (lihat vercel.json). Mengecek semua alert
// yang belum tercapai terhadap kurs referensi terbaru, mengirim email, lalu
// menandai alert tercapai supaya tidak terkirim berulang. Sekalian memperbarui
// arsip berita — paket Hobby Vercel hanya memberi dua cron.
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
import { alertEmail } from '@/lib/emailTemplates';

export async function GET(request: Request) {
  // Vercel Cron mengirim "Authorization: Bearer <CRON_SECRET>". Tanpa secret
  // terpasang, semua permintaan ditolak — route ini publik secara URL.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [newArticles, alerts] = await Promise.all([
    refreshNewsArchive(),
    prisma.rateAlert.findMany({
      where: { triggeredAt: null },
      include: { user: { select: { email: true } } },
    }),
  ]);
  if (alerts.length === 0) return NextResponse.json({ newArticles, checked: 0, triggered: 0, failed: 0 });

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  const baseUrl = process.env.APP_URL || new URL(request.url).origin;
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

  // Rute ini dilindungi CRON_SECRET, jadi aman menyertakan alasan kegagalan.
  return NextResponse.json({ newArticles, checked: alerts.length, triggered, failed: errors.length, errors });
}

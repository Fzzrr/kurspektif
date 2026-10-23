// Dipanggil Vercel Cron sekali sehari (lihat vercel.json). Mengecek semua alert
// yang belum tercapai terhadap kurs referensi terbaru, mengirim email, lalu
// menandai alert tercapai supaya tidak terkirim berulang.
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { fetchUsdRates, toISODate } from '@/lib/frankfurter';
import { isHit, type AlertDirection } from '@/lib/alerts';
import { EMAIL_SENDER } from '@/lib/email';

const rateFormatter = new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 6 });

export async function GET(request: Request) {
  // Vercel Cron mengirim "Authorization: Bearer <CRON_SECRET>". Tanpa secret
  // terpasang, semua permintaan ditolak — route ini publik secara URL.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const alerts = await prisma.rateAlert.findMany({
    where: { triggeredAt: null },
    include: { user: { select: { email: true } } },
  });
  if (alerts.length === 0) return NextResponse.json({ checked: 0, triggered: 0, failed: 0 });

  // Satu permintaan ke Frankfurter untuk semua mata uang yang dipakai.
  const codes = [...new Set(alerts.flatMap((alert) => [alert.base, alert.quote]))].filter((code) => code !== 'USD');
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);
  const byDate = codes.length > 0 ? await fetchUsdRates(codes, toISODate(from), toISODate(to)) : new Map();
  // Nilai terbaru per mata uang — tiap mata uang bisa diperbarui di hari berbeda.
  const usdRate: Record<string, number> = { USD: 1 };
  for (const date of [...byDate.keys()].sort()) Object.assign(usdRate, byDate.get(date));

  const resend = new Resend(process.env.RESEND_API_KEY);
  const dashboardUrl = `${process.env.APP_URL || new URL(request.url).origin}/dashboard`;
  let triggered = 0;
  const errors: string[] = [];

  // ponytail: kirim satu per satu; free tier Resend ~2 email/detik — tambah
  // jeda atau batch API kalau banyak alert tercapai di hari yang sama.
  for (const alert of alerts) {
    const baseRate = usdRate[alert.base];
    const quoteRate = usdRate[alert.quote];
    if (!baseRate || !quoteRate) continue;
    const rate = quoteRate / baseRate;
    if (!isHit(alert.direction as AlertDirection, rate, alert.threshold)) continue;

    const pair = `${alert.base}/${alert.quote}`;
    const condition = alert.direction === 'atas' ? 'naik di atas' : 'turun di bawah';
    const target = rateFormatter.format(alert.threshold);
    const now = rateFormatter.format(rate);
    const sent = await resend.emails.send({
      from: EMAIL_SENDER,
      to: alert.user.email,
      subject: `${pair} ${condition} ${target} — Kurspektif`,
      html:
        `<p>Alert kurs kamu tercapai: <strong>${pair}</strong> ${condition} ${target} ${alert.quote}.</p>` +
        `<p>Kurs referensi terbaru: <strong>${now} ${alert.quote}</strong>.</p>` +
        `<p><a href="${dashboardUrl}">Buka dashboard Kurspektif</a></p>` +
        `<p style="color:#888">Alert ini tidak akan dikirim lagi sampai kamu mengeditnya.</p>`,
    });
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
  return NextResponse.json({ checked: alerts.length, triggered, failed: errors.length, errors });
}

// Dipanggil Vercel Cron tiap Senin pagi (lihat vercel.json). Mengirim email
// ringkasan minggu lalu untuk pasangan yang disimpan tiap pengguna.
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { watchlistSnapshot, type WatchedSnapshot } from '@/lib/watchlist';
import { EMAIL_SENDER, sendAll } from '@/lib/email';
import { digestEmail } from '@/lib/emailTemplates';
import { unsubscribeApiUrl, unsubscribePageUrl } from '@/lib/unsubscribe';
import { todayKey } from '@/lib/timeAgo';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { weeklyDigest: true, watchedPairs: { some: {} } },
    select: {
      id: true,
      email: true,
      name: true,
      watchedPairs: { orderBy: { createdAt: 'asc' }, select: { base: true, quote: true } },
      _count: { select: { rateAlerts: { where: { triggeredAt: null } } } },
    },
  });
  if (users.length === 0) return NextResponse.json({ users: 0, sent: 0, failed: 0, errors: [] });

  const pairsOf = (user: (typeof users)[number]) => user.watchedPairs.map((p) => `${p.base}/${p.quote}`);
  // Satu snapshot untuk semua pasangan semua pengguna: kurs terbaru +
  // penggerak mingguan, dua request total.
  const snapshots = new Map<string, WatchedSnapshot>(
    (await watchlistSnapshot([...new Set(users.flatMap(pairsOf))])).map((row) => [row.pair, row]),
  );
  const baseUrl = process.env.APP_URL || new URL(request.url).origin;

  const emails = users.map((user) => {
    const email = digestEmail({
      name: user.name,
      rows: pairsOf(user).map((pair) => {
        const snapshot = snapshots.get(pair);
        return {
          pair,
          rate: snapshot?.rate ?? null,
          date: snapshot?.date ?? null,
          movers: snapshot?.movers ?? null,
          reason: snapshot?.reason ?? null,
          url: `${baseUrl}/dashboard?pair=${pair.replace('/', '-')}`,
        };
      }),
      activeAlerts: user._count.rateAlerts,
      pantauanUrl: `${baseUrl}/dashboard/pantauan`,
      unsubscribeUrl: unsubscribePageUrl(baseUrl, user.id),
    });

    return {
      from: EMAIL_SENDER,
      to: user.email,
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(baseUrl, user.id)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      ...email,
    };
  });

  // Ringkasan tidak dicatat di database, jadi kunci idempotensi per hari yang
  // mencegah email ganda kalau cron terpicu dua kali.
  const failed = await sendAll(new Resend(process.env.RESEND_API_KEY), emails, `ringkasan/${todayKey()}`);
  const errors = [...failed].map(([index, reason]) => `Ringkasan (user ${users[index].id}): ${reason}`);
  errors.forEach((reason) => console.error(reason));

  return NextResponse.json({ users: users.length, sent: emails.length - failed.size, failed: failed.size, errors });
}

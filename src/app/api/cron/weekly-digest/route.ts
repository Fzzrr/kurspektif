// Dipanggil Vercel Cron tiap Senin pagi (lihat vercel.json). Mengirim email
// ringkasan minggu lalu untuk pasangan yang disimpan tiap pengguna, plus
// agenda ekonomi minggu ini.
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { fetchWeeklyMoversMany } from '@/lib/movers';
import { explain, fmtPct } from '@/lib/moversText';
import { eventsFor } from '@/lib/calendar';
import { dayLabel, todayKey } from '@/lib/timeAgo';
import { EMAIL_SENDER } from '@/lib/email';
import { unsubscribeApiUrl, unsubscribePageUrl } from '@/lib/unsubscribe';

const BATCH_SIZE = 100; // batas batch API Resend

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { weeklyDigest: true, watchedPairs: { some: {} } },
    select: { id: true, email: true, name: true, watchedPairs: { orderBy: { createdAt: 'asc' }, select: { base: true, quote: true } } },
  });
  if (users.length === 0) return NextResponse.json({ users: 0, sent: 0, failed: 0 });

  const pairsOf = (user: (typeof users)[number]) => user.watchedPairs.map((p) => `${p.base}/${p.quote}`);
  const movers = await fetchWeeklyMoversMany([...new Set(users.flatMap(pairsOf))]);
  const baseUrl = process.env.APP_URL || new URL(request.url).origin;
  const dashboardUrl = `${baseUrl}/dashboard`;
  const today = todayKey();

  const emails = users.map((user) => {
    const pairs = pairsOf(user);
    const rows = pairs.map((pair) => {
      const data = movers.get(pair);
      if (!data) return `<li><strong>${pair}</strong> — data minggu ini belum cukup.</li>`;
      const color = data.pairChangePct > 0 ? '#16a34a' : data.pairChangePct < 0 ? '#dc2626' : '#666';
      return (
        `<li style="margin-bottom:10px"><strong>${pair}</strong> ` +
        `<span style="color:${color}">${fmtPct(data.pairChangePct)}</span><br>` +
        `<span style="color:#444">${escape(explain(data))}</span></li>`
      );
    });
    const codes = [...new Set(pairs.flatMap((pair) => pair.split('/')))];
    const agenda = eventsFor(codes, today, 7).map(
      (event) => `<li>${dayLabel(event.date)}${event.time ? ` ${event.time} WIB` : ''} — ${event.title}</li>`,
    );

    return {
      from: EMAIL_SENDER,
      to: user.email,
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(baseUrl, user.id)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      subject: `Ringkasan minggu ini: ${pairs
        .slice(0, 3)
        .map((pair) => `${pair} ${movers.get(pair) ? fmtPct(movers.get(pair)!.pairChangePct) : '—'}`)
        .join(', ')}`,
      html:
        `<p>Halo${user.name ? ` ${escape(user.name)}` : ''}, ini pergerakan pasangan yang kamu simpan selama 7 hari terakhir.</p>` +
        `<ul style="padding-left:18px">${rows.join('')}</ul>` +
        (agenda.length > 0
          ? `<p><strong>Agenda minggu ini</strong></p><ul style="padding-left:18px">${agenda.join('')}</ul>`
          : '') +
        `<p><a href="${dashboardUrl}">Buka dashboard Kurspektif</a></p>` +
        `<p style="color:#888;font-size:12px">Kurs referensi harian, bukan kurs jual/beli bank. ` +
        `<a href="${unsubscribePageUrl(baseUrl, user.id)}" style="color:#888">Berhenti menerima ringkasan ini</a>.</p>`,
    };
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  const errors: string[] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    const result = await resend.batch.send(chunk);
    if (result.error) errors.push(result.error.message);
    else sent += chunk.length;
  }

  return NextResponse.json({ users: users.length, sent, failed: emails.length - sent, errors });
}

// Isi semua email Kurspektif: alert, ringkasan mingguan, atur ulang kata
// sandi, dan konfirmasi email baru. Fungsi murni (tanpa Resend/Prisma) supaya
// bisa dites dan dipratinjau tanpa mengirim apa pun.
//
// HTML email tidak kenal CSS modern: tata letak pakai <table>, semua gaya
// inline, latar terang (klien email sering membalik warna tema gelap dengan
// hasil buruk). Setiap email juga punya versi teks biasa.
import { formatRate } from './rateStats';
import { fmtPct, isMoving } from './moversText';
import type { WeeklyMovers } from './movers';

export type EmailContent = { subject: string; html: string; text: string };

export const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = '#111111';
const MUTED = '#5f6368';
const LINE = '#ececec';
const UP = '#15803d';
const DOWN = '#b91c1c';

const DISCLAIMER =
  'Kurs tengah referensi bank sentral yang terbit sekali per hari kerja, bukan kurs jual/beli bank atau money changer. Kurspektif adalah alat informasi, bukan nasihat keuangan.';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
/** "2026-10-24" → "Jumat, 24 Oktober". */
export const formatDate = (isoDate: string) => dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));

const changeColor = (pct: number) => (fmtPct(pct) === '0%' ? MUTED : pct > 0 ? UP : DOWN);

// ---------------------------------------------------------------------------
// Potongan tata letak
// ---------------------------------------------------------------------------

function layout({ title, preheader, body, footer }: { title: string; preheader: string; body: string; footer: string }) {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;">
    <tr><td style="padding:28px 32px 0;font:700 18px/1 ${FONT};color:${INK};letter-spacing:-0.02em;">Kurspektif.</td></tr>
    <tr><td style="padding:24px 32px 16px;">${body}</td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:16px 32px 0;font:12px/1.6 ${FONT};color:${MUTED};">${footer}</td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font:600 22px/1.3 ${FONT};color:${INK};letter-spacing:-0.01em;">${text}</h1>`;

const p = (html: string, extra = '') =>
  `<p style="margin:0 0 16px;font:15px/1.6 ${FONT};color:${INK};${extra}">${html}</p>`;

const note = (html: string) => p(html, `font-size:13px;color:${MUTED};`);

const link = (href: string, label: string) => `<a href="${href}" style="color:${INK};">${label}</a>`;

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>
<td style="background:${INK};border-radius:8px;"><a href="${href}" style="display:inline-block;padding:12px 20px;font:600 15px/1 ${FONT};color:#ffffff;text-decoration:none;">${label}</a></td>
</tr></table>`;
}

/** Tabel label–nilai, satu baris per fakta. */
function facts(rows: [label: string, valueHtml: string][]) {
  const cells = rows
    .map(
      ([label, value]) => `<tr>
<td style="padding:10px 16px 10px 0;border-top:1px solid ${LINE};font:14px/1.5 ${FONT};color:${MUTED};vertical-align:top;white-space:nowrap;">${label}</td>
<td style="padding:10px 0;border-top:1px solid ${LINE};font:14px/1.5 ${FONT};color:${INK};text-align:right;font-variant-numeric:tabular-nums;">${value}</td>
</tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${cells}</table>`;
}

// ---------------------------------------------------------------------------
// Alert tercapai
// ---------------------------------------------------------------------------

export type AlertEmailData = {
  pair: string;
  /** Kalimat kondisi dari describeCondition(), mis. "naik di atas 18.000 IDR". */
  condition: string;
  rate: number;
  /** Tanggal kurs referensi, YYYY-MM-DD. */
  date: string;
  /** Perubahan dari hari kerja sebelumnya, persen; null kalau tidak ada data. */
  dayPct: number | null;
  /** Persen hari dalam setahun yang kursnya lebih rendah dari `rate`. */
  yearPercentile: number;
  yearHigh: boolean;
  yearLow: boolean;
  /** Penjelasan penggerak minggu ini dari explain(); null kalau datanya kurang. */
  reason: string | null;
  pairUrl: string;
  manageUrl: string;
};

export function alertEmail(data: AlertEmailData): EmailContent {
  const [base, quote] = data.pair.split('/');
  const rate = formatRate(data.rate);
  const date = formatDate(data.date);
  const condition = data.condition.charAt(0).toUpperCase() + data.condition.slice(1);
  const position = data.yearHigh
    ? 'Tertinggi dalam setahun'
    : data.yearLow
      ? 'Terendah dalam setahun'
      : `Lebih tinggi dari ${data.yearPercentile}% hari dalam setahun`;

  const rows: [string, string][] = [['Kondisi alert', condition]];
  if (data.dayPct !== null) {
    rows.push(['Perubahan sehari', `<span style="color:${changeColor(data.dayPct)};">${fmtPct(data.dayPct)}</span>`]);
  }
  rows.push(['Posisi setahun', position]);

  const html = layout({
    title: `${data.pair} ${data.condition}`,
    preheader: `Kurs referensi ${data.pair} ${date}: ${rate} ${quote}.`,
    body:
      h1(`Alert ${data.pair} tercapai`) +
      p(`${data.pair} kini <strong>${escapeHtml(data.condition)}</strong>.`) +
      `<p style="margin:8px 0 4px;font:600 34px/1.1 ${FONT};color:${INK};letter-spacing:-0.02em;font-variant-numeric:tabular-nums;">${rate} <span style="font-size:15px;font-weight:400;color:${MUTED};letter-spacing:0;">${quote} per 1 ${base}</span></p>` +
      note(`Kurs referensi ${date}`) +
      facts(rows) +
      (data.reason ? p(`<strong>Kenapa bergerak?</strong> ${escapeHtml(data.reason)}`) : '') +
      button(`Lihat grafik ${data.pair}`, data.pairUrl) +
      note(
        `Alert ini sudah berhenti supaya kamu tidak menerima email yang sama tiap hari. ${link(data.manageUrl, 'Edit alert di dashboard')} untuk mengaktifkannya lagi dengan batas baru.`,
      ),
    footer: DISCLAIMER,
  });

  const text = [
    `Alert ${data.pair} tercapai`,
    '',
    `${data.pair} kini ${data.condition}.`,
    `Kurs referensi ${date}: ${rate} ${quote} per 1 ${base}`,
    '',
    `Kondisi alert: ${condition}`,
    ...(data.dayPct !== null ? [`Perubahan sehari: ${fmtPct(data.dayPct)}`] : []),
    `Posisi setahun: ${position}`,
    ...(data.reason ? ['', `Kenapa bergerak? ${data.reason}`] : []),
    '',
    `Lihat grafik: ${data.pairUrl}`,
    `Alert ini sudah berhenti. Edit alert untuk mengaktifkannya lagi: ${data.manageUrl}`,
    '',
    DISCLAIMER,
  ].join('\n');

  return { subject: `${data.pair} ${data.condition} — Kurspektif`, html, text };
}

// ---------------------------------------------------------------------------
// Ringkasan mingguan
// ---------------------------------------------------------------------------

export type DigestRow = {
  pair: string;
  rate: number | null;
  /** Tanggal kurs terakhir, YYYY-MM-DD. */
  date: string | null;
  movers: WeeklyMovers | null;
  /** Penjelasan dari explain(). */
  reason: string | null;
  url: string;
};

export type DigestEmailData = {
  name: string | null;
  rows: DigestRow[];
  activeAlerts: number;
  pantauanUrl: string;
  unsubscribeUrl: string;
};

/** "IDR melemah 0,95%" / "USD stabil". */
function sideText({ code, strengthPct }: { code: string; strengthPct: number }) {
  if (!isMoving(strengthPct)) return `${code} stabil`;
  return `${code} ${strengthPct > 0 ? 'menguat' : 'melemah'} ${fmtPct(Math.abs(strengthPct)).replace('+', '')}`;
}

export function digestEmail(data: DigestEmailData): EmailContent {
  const moving = data.rows.filter((row) => row.movers);
  const top = [...moving].sort((a, b) => Math.abs(b.movers!.pairChangePct) - Math.abs(a.movers!.pairChangePct))[0];
  const latestDate = data.rows.map((row) => row.date).filter(Boolean).sort().at(-1) ?? null;
  const greeting = data.name ? `Halo ${escapeHtml(data.name)}` : 'Halo';
  const count = data.rows.length;

  const blocks = data.rows
    .map((row) => {
      const [base, quote] = row.pair.split('/');
      const pct = row.movers?.pairChangePct ?? null;
      const details: string[] = [];
      if (row.movers) details.push(`${row.movers.sides.map(sideText).join(', ')} terhadap mata uang utama.`);
      const volatile = row.movers?.volatileDay;
      if (volatile && Math.abs(volatile.changePct) >= 0.01) {
        details.push(`Hari paling bergejolak: ${formatDate(volatile.date)} (${fmtPct(volatile.changePct)}).`);
      }
      return `<tr><td style="padding:16px 0;border-top:1px solid ${LINE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font:600 17px/1.3 ${FONT};color:${INK};"><a href="${row.url}" style="color:${INK};text-decoration:none;">${row.pair}</a></td>
<td style="font:600 17px/1.3 ${FONT};text-align:right;font-variant-numeric:tabular-nums;color:${pct === null ? MUTED : changeColor(pct)};">${pct === null ? '—' : fmtPct(pct)}</td>
</tr><tr>
<td style="padding-top:2px;font:13px/1.5 ${FONT};color:${MUTED};font-variant-numeric:tabular-nums;">${row.rate !== null ? `${formatRate(row.rate)} ${quote} per 1 ${base}` : 'Kurs belum tersedia'}</td>
<td style="padding-top:2px;font:13px/1.5 ${FONT};color:${MUTED};text-align:right;">7 hari</td>
</tr></table>
<p style="margin:10px 0 0;font:14px/1.6 ${FONT};color:${INK};">${row.reason ? escapeHtml(row.reason) : 'Data minggu ini belum cukup.'}</p>
${details.length > 0 ? `<p style="margin:4px 0 0;font:13px/1.6 ${FONT};color:${MUTED};">${details.join(' ')}</p>` : ''}
</td></tr>`;
    })
    .join('');

  const alertLine =
    data.activeAlerts > 0
      ? `Kamu punya <strong>${data.activeAlerts} alert aktif</strong>. Kami kabari begitu salah satunya tercapai.`
      : `Belum ada alert aktif. ${link(data.pantauanUrl, 'Pasang alert di Pantauan')} supaya dikabari saat kurs mencapai angka yang kamu tunggu.`;

  const subject = `Ringkasan minggu ini: ${data.rows
    .slice(0, 3)
    .map((row) => `${row.pair} ${row.movers ? fmtPct(row.movers.pairChangePct) : '—'}`)
    .join(', ')}`;
  const preheader = top
    ? `${top.pair} bergerak paling jauh: ${fmtPct(top.movers!.pairChangePct)} dalam 7 hari.`
    : `Pergerakan ${count} pasangan di Pantauanmu.`;

  const html = layout({
    title: subject,
    preheader,
    body:
      h1('Ringkasan minggu ini') +
      p(
        `${greeting}, ini pergerakan ${count} pasangan di Pantauanmu selama 7 hari terakhir${latestDate ? `, sampai kurs referensi ${formatDate(latestDate)}` : ''}.`,
      ) +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-bottom:1px solid ${LINE};">${blocks}</table>` +
      p(alertLine) +
      button('Buka Pantauan', data.pantauanUrl),
    footer: `${DISCLAIMER}<br><br>Kamu menerima email ini karena ringkasan mingguan menyala di akunmu. <a href="${data.unsubscribeUrl}" style="color:${MUTED};">Berhenti menerima ringkasan ini</a>; bisa dinyalakan lagi di Profil.`,
  });

  const text = [
    'Ringkasan minggu ini',
    '',
    `${data.name ? `Halo ${data.name}` : 'Halo'}, ini pergerakan ${count} pasangan di Pantauanmu selama 7 hari terakhir${latestDate ? `, sampai kurs referensi ${formatDate(latestDate)}` : ''}.`,
    '',
    ...data.rows.flatMap((row) => {
      const [base, quote] = row.pair.split('/');
      return [
        `${row.pair}  ${row.movers ? fmtPct(row.movers.pairChangePct) : '—'} (7 hari)`,
        row.rate !== null ? `${formatRate(row.rate)} ${quote} per 1 ${base}` : 'Kurs belum tersedia',
        row.reason ?? 'Data minggu ini belum cukup.',
        ...(row.movers ? [`${row.movers.sides.map(sideText).join(', ')} terhadap mata uang utama.`] : []),
        '',
      ];
    }),
    data.activeAlerts > 0 ? `Kamu punya ${data.activeAlerts} alert aktif.` : 'Belum ada alert aktif.',
    `Buka Pantauan: ${data.pantauanUrl}`,
    '',
    DISCLAIMER,
    `Berhenti menerima ringkasan ini: ${data.unsubscribeUrl}`,
  ].join('\n');

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Atur ulang kata sandi
// ---------------------------------------------------------------------------

export function passwordResetEmail({ email, link: url, hasPassword }: { email: string; link: string; hasPassword: boolean }): EmailContent {
  const intro = hasPassword
    ? `Ada permintaan untuk mengatur ulang kata sandi akun Kurspektif <strong>${escapeHtml(email)}</strong>. Klik tombol di bawah untuk membuat kata sandi baru.`
    : `Ada permintaan untuk membuat kata sandi bagi akun Kurspektif <strong>${escapeHtml(email)}</strong>. Akun ini selama ini masuk lewat Google; setelah kata sandi dibuat, kamu bisa masuk dengan keduanya.`;

  const html = layout({
    title: 'Atur ulang kata sandi',
    preheader: 'Tautan untuk membuat kata sandi baru, berlaku 1 jam.',
    body:
      h1(hasPassword ? 'Atur ulang kata sandi' : 'Buat kata sandi') +
      p(intro) +
      button('Buat kata sandi baru', url) +
      facts([
        ['Berlaku', '1 jam sejak email ini dikirim'],
        ['Dipakai', 'Sekali saja'],
      ]) +
      note(`Tombol tidak berfungsi? Salin tautan ini ke browser:<br><a href="${url}" style="color:${MUTED};word-break:break-all;">${url}</a>`) +
      note('Tidak merasa meminta ini? Abaikan saja. Kata sandimu tidak berubah, dan tidak ada yang bisa menggantinya tanpa tautan ini.'),
    footer: 'Email ini dikirim karena ada permintaan atur ulang kata sandi di halaman masuk Kurspektif.',
  });

  const text = [
    hasPassword ? 'Atur ulang kata sandi' : 'Buat kata sandi',
    '',
    hasPassword
      ? `Ada permintaan untuk mengatur ulang kata sandi akun Kurspektif ${email}.`
      : `Ada permintaan untuk membuat kata sandi bagi akun Kurspektif ${email} (selama ini masuk lewat Google).`,
    '',
    `Buat kata sandi baru: ${url}`,
    'Tautan berlaku 1 jam dan hanya bisa dipakai sekali.',
    '',
    'Tidak merasa meminta ini? Abaikan saja. Kata sandimu tidak berubah.',
  ].join('\n');

  return { subject: 'Atur ulang kata sandi — Kurspektif', html, text };
}

// ---------------------------------------------------------------------------
// Konfirmasi email baru
// ---------------------------------------------------------------------------

export function emailChangeEmail({ link: url, oldEmail, newEmail }: { link: string; oldEmail: string; newEmail: string }): EmailContent {
  const html = layout({
    title: 'Konfirmasi email baru',
    preheader: `Konfirmasi untuk mengganti email akun Kurspektif ke ${newEmail}.`,
    body:
      h1('Konfirmasi email baru') +
      p('Ada permintaan untuk mengganti email akun Kurspektif. Klik tombol di bawah untuk menyelesaikannya.') +
      facts([
        ['Email lama', escapeHtml(oldEmail)],
        ['Email baru', `<strong>${escapeHtml(newEmail)}</strong>`],
      ]) +
      button('Konfirmasi email ini', url) +
      note('Setelah dikonfirmasi, kamu masuk dengan email baru ini. Pantauan, alert, dan ringkasan mingguan ikut pindah; email alert dan ringkasan dikirim ke alamat baru.') +
      note(`Tautan berlaku 1 jam. Tombol tidak berfungsi? Salin tautan ini ke browser:<br><a href="${url}" style="color:${MUTED};word-break:break-all;">${url}</a>`) +
      note('Bukan kamu yang meminta? Abaikan saja. Email akun tidak berubah tanpa konfirmasi dari alamat ini.'),
    footer: 'Email ini dikirim karena alamat ini dimasukkan sebagai email baru di pengaturan profil Kurspektif.',
  });

  const text = [
    'Konfirmasi email baru',
    '',
    `Ada permintaan untuk mengganti email akun Kurspektif dari ${oldEmail} ke ${newEmail}.`,
    '',
    `Konfirmasi: ${url}`,
    'Tautan berlaku 1 jam. Setelah dikonfirmasi, Pantauan, alert, dan ringkasan mingguan ikut pindah ke alamat baru.',
    '',
    'Bukan kamu yang meminta? Abaikan saja. Email akun tidak berubah tanpa konfirmasi.',
  ].join('\n');

  return { subject: 'Konfirmasi email baru — Kurspektif', html, text };
}

// ---------------------------------------------------------------------------
// Verifikasi email pendaftaran
// ---------------------------------------------------------------------------

export function verifyEmailEmail({ email, link: url }: { email: string; link: string }): EmailContent {
  const html = layout({
    title: 'Verifikasi email',
    preheader: 'Satu langkah lagi untuk mengaktifkan akun Kurspektif.',
    body:
      h1('Verifikasi email') +
      p(`Ada pendaftaran akun Kurspektif dengan alamat <strong>${escapeHtml(email)}</strong>. Klik tombol di bawah untuk mengaktifkannya.`) +
      button('Aktifkan akun', url) +
      note(`Tautan berlaku 24 jam. Tombol tidak berfungsi? Salin tautan ini ke browser:<br><a href="${url}" style="color:${MUTED};word-break:break-all;">${url}</a>`) +
      note('Tidak merasa mendaftar? Jangan klik tombolnya, abaikan saja. Akun yang tidak diverifikasi tidak bisa dipakai masuk.'),
    footer: 'Email ini dikirim karena alamat ini dipakai untuk mendaftar di Kurspektif.',
  });

  const text = [
    'Verifikasi email',
    '',
    `Ada pendaftaran akun Kurspektif dengan alamat ${email}.`,
    '',
    `Aktifkan akun: ${url}`,
    'Tautan berlaku 24 jam.',
    '',
    'Tidak merasa mendaftar? Jangan buka tautannya, abaikan saja. Akun yang tidak diverifikasi tidak bisa dipakai masuk.',
  ].join('\n');

  return { subject: 'Verifikasi email — Kurspektif', html, text };
}

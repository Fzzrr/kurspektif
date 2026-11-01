import type { CreateBatchOptions, Resend } from 'resend';

// Alamat pengirim semua email (Resend). Tanpa domain terverifikasi, pakai
// pengirim uji Resend — hanya mengirim ke email pemilik akun Resend; set
// RESEND_FROM_EMAIL dari domain terverifikasi untuk mengirim ke siapa pun.
export const EMAIL_SENDER = process.env.RESEND_FROM_EMAIL || 'Kurspektif <onboarding@resend.dev>';

// Di `npm run dev` pengirim uji Resend menolak alamat selain pemilik akun
// Resend. Supaya alur email tetap bisa dites, tautannya dicetak ke terminal.
// Tidak pernah aktif di production: di sana kegagalan kirim tetap error.
export function devLinkFallback(label: string, to: string, link: string, reason: string): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  console.warn(`\n[dev] ${label} untuk ${to} tidak terkirim (${reason}).\n[dev] Buka tautan ini: ${link}\n`);
  return true;
}

const BATCH_SIZE = 100; // batas batch API Resend

/**
 * Kirim banyak email lewat batch API Resend: satu request per 100 email, jadi
 * tidak menabrak batas request per detik. Validasi "permissive" membuat satu
 * alamat bermasalah tidak menggagalkan email lain di batch yang sama.
 * Mengembalikan alasan gagal per indeks `emails`; indeks yang tidak ada = terkirim.
 * `idempotencyKey`: Resend mengabaikan pengiriman ulang dengan kunci yang sama
 * dalam 24 jam (mis. cron terpicu dua kali).
 */
export async function sendAll(resend: Resend, emails: CreateBatchOptions, idempotencyKey?: string) {
  const failed = new Map<number, string>();
  for (let start = 0; start < emails.length; start += BATCH_SIZE) {
    const chunk = emails.slice(start, start + BATCH_SIZE);
    const { data, error } = await resend.batch.send(chunk, {
      batchValidation: 'permissive',
      idempotencyKey: idempotencyKey && `${idempotencyKey}/${start}`,
    });
    if (error) chunk.forEach((_, i) => failed.set(start + i, error.message));
    else for (const { index, message } of data.errors) failed.set(start + index, message);
  }
  return failed;
}

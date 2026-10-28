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

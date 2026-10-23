// Alamat pengirim semua email (Resend). Tanpa domain terverifikasi, pakai
// pengirim uji Resend — hanya mengirim ke email pemilik akun Resend; set
// RESEND_FROM_EMAIL dari domain terverifikasi untuk mengirim ke siapa pun.
export const EMAIL_SENDER = process.env.RESEND_FROM_EMAIL || 'Kurspektif <onboarding@resend.dev>';

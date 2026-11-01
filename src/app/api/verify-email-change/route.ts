import { NextResponse } from 'next/server';

// Alamat lama di email konfirmasi yang sudah terkirim. Tidak mengubah apa pun:
// hanya meneruskan ke halaman konfirmasi, tempat perubahan dilakukan lewat tombol.
export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const target = new URL('/konfirmasi-email', request.url);
  if (token) target.searchParams.set('token', token);
  return NextResponse.redirect(target);
}

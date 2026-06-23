import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

// Pakai config edge-safe (tanpa Prisma/bcrypt) untuk menjaga route.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/dashboard/:path*'], // hanya proteksi dashboard
};

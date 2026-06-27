import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig = {
  pages: { signIn: '/login' },
  providers: [Google({ allowDangerousEmailAccountLinking: true })], // Credentials ditambahkan di auth.ts (butuh Node)
  callbacks: {
    // Dipakai middleware untuk memproteksi route.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const onDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (onDashboard) return isLoggedIn; // belum login → redirect ke signIn page
      return true;
    },
  },
} satisfies NextAuthConfig;
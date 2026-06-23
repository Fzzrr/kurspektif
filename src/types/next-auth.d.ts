import type { DefaultSession } from 'next-auth';

// Menambahkan `id` ke session.user dan token agar ber-type di auth.ts.
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

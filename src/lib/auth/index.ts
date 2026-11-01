// Entry auth sisi Node — pakai ini di server component, route handler & action:
//   import { auth, signIn, signOut, handlers } from '@/lib/auth';
// JANGAN import dari sini di proxy.ts (Edge) — di sana pakai '@/lib/auth/config' yang edge-safe.
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './config';
import { loginLimiter, loginIpLimiter } from '@/lib/rateLimit';

// Cost factor bcrypt — dipakai bersama register (actions.ts) agar dummy-compare
// di bawah punya timing setara compare asli (pertahanan timing-attack).
export const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_COST);

// Kode ini sampai ke client lewat `signIn(...).code` → LoginForm.
class UnverifiedEmail extends CredentialsSignin {
  code = 'unverified';
}

// Sidik kata sandi yang ikut disimpan di token sesi. Berubah begitu kata sandi
// diganti atau diatur ulang, jadi sesi lama di perangkat lain ikut berakhir.
// Yang disimpan hash dari hash bcrypt, bukan hash bcrypt-nya sendiri.
const passwordStamp = (hash: string | null) => createHash('sha256').update(hash ?? '').digest('base64url').slice(0, 16);

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // wajib jwt karena pakai Credentials
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds, request) {
        const email = String(creds?.email ?? '').toLowerCase();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;

        const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

        // Batasi per IP (lintas email) DAN per IP+email.
        if (!(await loginIpLimiter.check(`login-ip:${ip}`)).success) return null;
        if (!(await loginLimiter.check(`login:${ip}:${email}`)).success) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          await bcrypt.compare(password, DUMMY_HASH); // dummy compare untuk timing attack
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        // Dicek setelah kata sandi benar, supaya pesan "belum diverifikasi"
        // tidak membocorkan email mana yang terdaftar.
        if (!user.emailVerified) throw new UnverifiedEmail();
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  events: {
    // Google sudah membuktikan pemilik email (lihat callback signIn). Kalau
    // akunnya didaftarkan dengan kata sandi tapi belum pernah diverifikasi,
    // kata sandi itu bisa jadi milik orang lain yang mendaftarkan email ini:
    // buang, supaya hanya pemilik asli yang bisa masuk. Pemiliknya tetap bisa
    // membuat kata sandi lewat "Lupa kata sandi".
    async linkAccount({ user }) {
      await prisma.user.updateMany({
        where: { id: user.id, emailVerified: null },
        data: { emailVerified: new Date(), password: null },
      });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === 'google'){
        return Boolean((profile as {email_verified?: boolean})?.email_verified); // hanya izinkan jika email terverifikasi
      }
      return true;
    },
    // Dipanggil setiap auth() di server. Sesi JWT tidak tersimpan di database,
    // jadi di sinilah sesi dicabut: akun sudah dihapus atau kata sandinya
    // berganti sejak token dibuat → kembalikan null (dianggap belum masuk).
    // ponytail: satu query per auth(); kalau terasa, simpan hasilnya per request
    // dengan React cache() atau periksa hanya tiap beberapa menit.
    async jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      // Foto profil bisa berupa data URI puluhan KB; di dalam cookie JWT itu
      // membengkakkan setiap request. Foto selalu dibaca dari database.
      delete token.picture;
      if (!token.id) return token;

      const account = await prisma.user.findUnique({ where: { id: token.id as string }, select: { password: true } });
      if (!account) return null;
      const stamp = passwordStamp(account.password);
      // Masuk, pembaruan sesi oleh pemiliknya sendiri, atau token lama tanpa sidik: catat sidik terkini.
      if (user || trigger === 'update' || token.pw === undefined) token.pw = stamp;
      else if (token.pw !== stamp) return null;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
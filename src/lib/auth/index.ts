// Barrel khusus sisi Node (auth.ts) — pakai ini di server component & route handler:
//   import { auth, signIn, signOut, handlers } from '@/lib/auth';
// JANGAN import dari sini di proxy.ts (Edge) — di sana pakai '@/lib/auth/config' yang edge-safe.
export * from './auth';

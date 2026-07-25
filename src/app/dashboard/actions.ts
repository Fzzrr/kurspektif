'use server';

import { signOut } from '@/lib/auth';

// Server Action terpisah (bukan inline di komponen) karena akan dipakai dari
// DashboardSidebar yang merupakan Client Component — server action harus
// diimpor dari modul ber-'use server', tidak bisa didefinisikan inline di sana.
export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
}

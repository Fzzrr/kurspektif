import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import DashboardSidebar from '@/components/dashboard/layout/DashboardSidebar';

// Layout ini membungkus SEMUA route di bawah /dashboard (page.tsx, berita/,
// pasangan-saya/, alert/, tentang-sentimen/) — sidebar & footer disclaimer
// dirender sekali di sini, bukan diulang di tiap halaman.
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const displayName = session?.user?.name ?? session?.user?.email ?? 'Pengguna';

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <DashboardSidebar userName={displayName} />

      <main className="min-w-0 flex-1 px-6 py-8 md:px-10 md:py-10">
        {children}

        <p className="mx-auto mt-12 max-w-6xl text-center font-mono text-[11px] text-muted">
          Alat informasi & edukasi, bukan nasihat finansial.
        </p>
      </main>
    </div>
  );
}

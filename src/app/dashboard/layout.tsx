import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardSidebar from '@/components/dashboard/layout/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const dbUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, password: true },
      })
    : null;

  const displayName = dbUser?.name ?? dbUser?.email ?? 'Pengguna';
  const userEmail = dbUser?.email ?? '';
  const userImage = dbUser?.image ?? null;
  const hasPassword = Boolean(dbUser?.password);

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <DashboardSidebar
        userName={displayName}
        userEmail={userEmail}
        userImage={userImage}
        hasPassword={hasPassword}
      />

      <main className="min-w-0 flex-1 px-6 py-8 md:px-10 md:py-10">
        {children}

        <p className="mx-auto mt-12 max-w-6xl text-center font-mono text-[11px] text-muted">
          Alat informasi & edukasi, bukan nasihat finansial.
        </p>
      </main>
    </div>
  );
}
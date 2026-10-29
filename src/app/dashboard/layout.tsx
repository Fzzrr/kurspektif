import type { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardSidebar from '@/components/dashboard/layout/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const dbUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          image: true,
          password: true,
          weeklyDigest: true,
          moveAlerts: true,
          _count: { select: { watchedPairs: true, rateAlerts: { where: { triggeredAt: null } } } },
        },
      })
    : null;

  const displayName = dbUser?.name ?? dbUser?.email ?? 'Pengguna';
  const userEmail = dbUser?.email ?? '';
  const userImage = dbUser?.image ?? null;
  const hasPassword = Boolean(dbUser?.password);
  const weeklyDigest = dbUser?.weeklyDigest ?? true;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink md:flex-row">
      <DashboardSidebar
        userName={displayName}
        userEmail={userEmail}
        userImage={userImage}
        hasPassword={hasPassword}
        weeklyDigest={weeklyDigest}
        moveAlerts={dbUser?.moveAlerts ?? true}
        watchCount={dbUser?._count.watchedPairs ?? 0}
        activeAlertCount={dbUser?._count.rateAlerts ?? 0}
      />

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 md:py-10">
        {children}

        <p className="mx-auto mt-12 max-w-6xl text-center font-mono text-[11px] text-muted">
          Alat informasi & edukasi, bukan nasihat finansial.
        </p>
      </main>
    </div>
  );
}
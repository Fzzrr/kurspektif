import { auth, signOut } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 font-mono text-muted">
      <p>Hello, {session?.user?.name ?? session?.user?.email} 👋</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button className="rounded-lg border border-line px-4 py-2 transition-colors hover:bg-paper">
          Sign out
        </button>
      </form>
    </main>
  );
}

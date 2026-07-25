'use client';

// Sidebar navigasi dashboard. Client Component karena butuh usePathname()
// untuk tahu route mana yang sedang aktif (server component tidak bisa
// membaca pathname saat ini secara reaktif seperti ini).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Wordmark from '@/components/ui/Wordmark';
import {
  LayoutDashboardIcon,
  NewspaperIcon,
  HeartHandshakeIcon,
  BellIcon,
  InfoIcon,
} from '@/components/ui/icons';
import { signOutAction } from '@/app/dashboard/actions';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/dashboard/berita', label: 'Berita', icon: NewspaperIcon },
  { href: '/dashboard/pasangan-saya', label: 'Pasangan saya', icon: HeartHandshakeIcon },
  { href: '/dashboard/alert', label: 'Alert', icon: BellIcon },
  { href: '/dashboard/tentang-sentimen', label: 'Tentang sentimen', icon: InfoIcon },
] as const;

// "Ardi Rahmadan" -> "AR". Ambil huruf pertama dari maksimal dua kata.
function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

type Props = {
  userName: string;
};

export default function DashboardSidebar({ userName }: Props) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white text-ink md:flex">
      <div className="px-6 pt-8">
        <Wordmark className="h-5 w-auto text-ink" />
      </div>

      <nav className="mt-10 flex-1 space-y-1 px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          // Item "Dashboard" hanya aktif tepat di /dashboard; item lain aktif
          // untuk path-nya sendiri dan sub-path (berguna saat sub-route ditambah nanti).
          const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${
                isActive
                  ? 'bg-accent-soft font-medium text-accent'
                  : 'text-muted hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-paper">
            {getInitials(userName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-ink">{userName}</p>
            <p className="font-mono text-[11px] text-muted">Akun gratis</p>
          </div>
        </div>

        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg border border-line py-2 font-mono text-xs text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "@/components/ui/Wordmark";
import {
  LayoutDashboardIcon,
  NewspaperIcon,
  BellIcon,
  InfoIcon,
} from "@/components/ui/icons";
import { signOutAction } from "@/app/dashboard/actions";
import { getInitials } from "@/lib/avatar";
import ProfileSettingsModal from "@/components/dashboard/profile/ProfileSettingsModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/berita", label: "Berita", icon: NewspaperIcon },
  // Alert tinggal di kartu dashboard — tautan ini menggulir ke sana.
  { href: "/dashboard#alert", label: "Alert", icon: BellIcon },
  { href: "/dashboard/metodologi", label: "Metodologi", icon: InfoIcon },
] as const;

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false; // pathname tidak pernah memuat hash
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

type Props = {
  userName: string;
  userEmail: string;
  userImage: string | null;
  hasPassword: boolean;
};

export default function DashboardSidebar({
  userName,
  userEmail,
  userImage,
  hasPassword,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const avatar = userImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={userImage}
      alt=""
      className="size-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-paper">
      {getInitials(userName)}
    </span>
  );

  return (
    <>
      {/* Ponsel: sidebar disembunyikan, diganti header (logo + akun) di atas
        dan bar navigasi di bawah layar. */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/" aria-label="Kurspektif — ke halaman utama">
          <Wordmark className="h-5 w-auto text-ink" />
        </Link>
        <div className="flex items-center gap-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="font-mono text-xs text-muted transition-colors hover:text-ink"
            >
              Keluar
            </button>
          </form>
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Buka pengaturan profil"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {avatar}
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[10px] transition-colors ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper/80 text-ink backdrop-blur-xl md:flex">
        <div className="px-6 pt-8">
          <Link
            href="/"
            aria-label="Kurspektif — ke halaman utama"
            className="inline-block"
          >
            <Wordmark className="h-6 w-auto text-ink" />
          </Link>
        </div>

        <nav className="mt-10 flex-1 space-y-1 px-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${
                  active
                    ? "bg-accent-soft font-medium text-accent before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-accent"
                    : "text-muted hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-4 py-5">
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Buka pengaturan profil"
            className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {avatar}
            <div className="min-w-0">
              <p className="truncate font-mono text-sm text-ink">{userName}</p>
              <p className="font-mono text-[11px] text-muted">Akun gratis</p>
            </div>
          </button>

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

      <ProfileSettingsModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={{
          name: userName,
          email: userEmail,
          image: userImage,
          hasPassword,
        }}
      />
    </>
  );
}

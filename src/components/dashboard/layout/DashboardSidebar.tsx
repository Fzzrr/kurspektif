"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Wordmark from "@/components/ui/Wordmark";
import {
  LayoutDashboardIcon,
  NewspaperIcon,
  BellIcon,
  BookmarkIcon,
  InfoIcon,
  ChevronDown,
  SettingsIcon,
  LogOutIcon,
} from "@/components/ui/icons";
import { signOutAction } from "@/app/dashboard/actions";
import { getInitials } from "@/lib/avatar";
import { useDismiss } from "@/lib/useDismiss";
import ProfileSettingsModal from "@/components/dashboard/profile/ProfileSettingsModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/berita", label: "Berita", icon: NewspaperIcon },
  { href: "/dashboard/pantauan", label: "Pantauan", icon: BookmarkIcon },
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
  weeklyDigest: boolean;
  watchCount: number;
  activeAlertCount: number;
};

export default function DashboardSidebar({
  userName,
  userEmail,
  userImage,
  hasPassword,
  weeklyDigest,
  watchCount,
  activeAlertCount,
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
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-ink">
      {getInitials(userName)}
    </span>
  );

  const menu = {
    userName,
    userEmail,
    avatar,
    watchCount,
    activeAlertCount,
    onOpenSettings: () => setProfileOpen(true),
  };

  return (
    <>
      {/* Ponsel: sidebar disembunyikan, diganti header (logo + akun) di atas
        dan bar navigasi di bawah layar. */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/" aria-label="Kurspektif — ke halaman utama">
          <Wordmark className="h-5 w-auto text-ink" />
        </Link>
        <AccountMenu {...menu} placement="down" />
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
                className={`flex items-center gap-3 px-3 py-2 text-[15px] transition-colors ${
                  active ? "font-medium text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <AccountMenu {...menu} placement="up" />
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
          weeklyDigest,
        }}
      />
    </>
  );
}

type AccountMenuProps = {
  userName: string;
  userEmail: string;
  avatar: ReactNode;
  watchCount: number;
  activeAlertCount: number;
  onOpenSettings: () => void;
  /** "up" di dasar sidebar desktop, "down" di header ponsel. */
  placement: "up" | "down";
};

const itemClass =
  "flex w-full items-center gap-3 px-3 py-2 text-left font-mono text-sm text-muted transition-colors hover:bg-white/5 hover:text-ink";

// Menu akun: ringkasan isi akun + pintasan pengaturan dan keluar. Di desktop
// pemicunya baris nama + email; di ponsel cukup avatar, jadi nama dan email
// ditampilkan di puncak panel.
function AccountMenu({
  userName,
  userEmail,
  avatar,
  watchCount,
  activeAlertCount,
  onOpenSettings,
  placement,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const compact = placement === "down";
  const close = () => setOpen(false);
  useDismiss(rootRef, open, close);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={compact ? "Buka menu akun" : undefined}
        className={
          compact
            ? "rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            : `flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-white/5 ${open ? "bg-white/5" : ""}`
        }
      >
        {avatar}
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{userName}</span>
              <span className="block truncate font-mono text-[11px] text-muted">{userEmail}</span>
            </span>
            <ChevronDown className={`size-4 shrink-0 text-muted transition-transform ${open ? "" : "rotate-180"}`} />
          </>
        )}
      </button>

      {open && (
        <div
          style={{ transformOrigin: compact ? "top right" : "bottom" }}
          className={`menu-in absolute z-50 bg-black/70 p-1 shadow-[0_28px_70px_-18px_rgba(0,0,0,1)] backdrop-blur-xl ${
            compact ? "right-0 top-full mt-2 w-64" : "inset-x-0 bottom-full mb-2"
          }`}
        >
          {compact && (
            <div className="px-3 pb-2 pt-2.5">
              <p className="truncate text-sm font-medium text-ink">{userName}</p>
              <p className="truncate font-mono text-[11px] text-muted">{userEmail}</p>
            </div>
          )}

          <div className={compact ? "border-t border-line pt-1" : ""}>
            <Stat href="/dashboard/pantauan" label="Pantauan" value={watchCount} onNavigate={close} />
            <Stat href="/dashboard#alert" label="Alert aktif" value={activeAlertCount} onNavigate={close} />
          </div>

          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              onClick={() => {
                close();
                onOpenSettings();
              }}
              className={itemClass}
            >
              <SettingsIcon className="size-4" />
              Pengaturan profil
            </button>
            <form action={signOutAction}>
              <button type="submit" className={itemClass}>
                <LogOutIcon className="size-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ href, label, value, onNavigate }: { href: string; label: string; value: number; onNavigate: () => void }) {
  return (
    <Link href={href} onClick={onNavigate} className={`${itemClass} justify-between`}>
      {label}
      <span className="text-ink">{value}</span>
    </Link>
  );
}

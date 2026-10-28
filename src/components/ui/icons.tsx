// Kumpulan ikon SVG yang dipakai di form auth, landing page, & dashboard.
// Ukuran selalu diatur pemanggil lewat `className` (mis. `size-5`, `size-[1.1em]`).

type IconProps = { className?: string };

// Props bersama ikon garis 24×24 — supaya bobot & ujung garis konsisten.
const strokeIcon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function BookmarkIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg {...strokeIcon} fill={filled ? 'currentColor' : 'none'} className={className}>
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
    </svg>
  );
}

// Chevron bawah — petunjuk "gulir ke bawah" di hero.
export function ChevronDown({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Lonceng — menandai contoh notifikasi/alert.
export function BellIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

// Ikon silang — menutup menu navigasi mobile.
export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Mata terbuka — ditampilkan saat password tersembunyi (klik untuk menampilkan).
export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

// Mata dicoret — ditampilkan saat password terlihat (klik untuk menyembunyikan).
export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" strokeLinecap="round" />
      <path d="M9.4 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7-.4 1-1.2 2.2-2.4 3.3M6.1 6.1C4 7.4 2.6 9.4 3 12c.4 1 3.5 5 9 5 1 0 1.9-.1 2.7-.4" strokeLinecap="round" />
    </svg>
  );
}

// Dua panah horizontal berlawanan arah — tombol "tukar" pasangan mata uang.
export function SwapIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M3 7h13M13 3l4 4-4 4" />
      <path d="M21 17H8M8 21l-4-4 4-4" />
    </svg>
  );
}

// Koran terlipat — menandai item navigasi "Berita".
export function NewspaperIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M4 4h12v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
      <path d="M16 8h4v10a2 2 0 0 1-2 2h-2" />
      <path d="M7 8h6M7 11h6M7 14h4" />
    </svg>
  );
}

// Lingkaran "i" — menandai item navigasi "Tentang sentimen".
export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v5h1" />
    </svg>
  );
}

// Grid 4 kotak — menandai item navigasi "Dashboard".
export function LayoutDashboardIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

// Siluet orang — menandai tab "Profil" di modal pengaturan.
export function UserIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

// Kamera — overlay "ganti foto" saat avatar profil di-hover.
export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M3 8h3l2-3h8l2 3h3v11H3V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

// Pensil — tombol "ubah" pada baris pengaturan.
export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

// Gerigi — "Pengaturan profil" di menu akun.
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

// Pintu keluar — "Keluar" di menu akun.
export function LogOutIcon({ className }: IconProps) {
  return (
    <svg {...strokeIcon} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

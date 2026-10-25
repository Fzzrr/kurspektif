import type { ReactNode } from 'react';
import AuthSidePanel from './AuthSidePanel';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:h-svh lg:flex-row lg:overflow-hidden">
      {/* Kiri: form. Kanan: panel terang (hanya di layar lebar). */}
      <div className="flex flex-1 flex-col bg-paper px-5 py-8 sm:px-12 lg:overflow-y-auto lg:px-16 lg:py-8 xl:px-24">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          {children}
        </div>
        <footer className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-1 text-[13px] text-muted sm:mt-6 sm:flex-row sm:justify-between sm:gap-4">
          <span>© 2026 Kurspektif</span>
          <span>Alat informasi &amp; edukasi, bukan nasihat finansial.</span>
        </footer>
      </div>

      <AuthSidePanel />
    </div>
  );
}

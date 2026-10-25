// Kelas Tailwind yang dipakai bersama oleh form auth (login & register).
// Disatukan di sini agar tampilan input/tombol konsisten di seluruh halaman.

// Tanpa margin — untuk input yang berdiri sendiri (tanpa label di atasnya).
export const bareInputClass =
  'block w-full bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30';

export const inputClass = `mt-1.5 ${bareInputClass}`;

export const labelClass =
  'block text-sm text-muted';

export const primaryButtonClass =
  'mt-1 flex w-full items-center justify-center gap-2 bg-ink py-3 text-[15px] font-medium text-paper transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper';

export const socialButtonClass =
  'inline-flex w-full items-center justify-center gap-2 bg-surface py-3 text-[15px] font-medium text-ink transition-colors hover:bg-accent-soft';

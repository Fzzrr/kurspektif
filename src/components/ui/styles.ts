// Kelas Tailwind yang dipakai bersama oleh form auth (login & register).
// Disatukan di sini agar tampilan input/tombol konsisten di seluruh halaman.

export const inputClass =
  'mt-1.5 block w-full rounded-lg border border-line bg-surface px-4 py-2.5 font-mono text-sm text-ink placeholder:text-muted/60 shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export const labelClass =
  'block font-mono text-[11px] font-light uppercase tracking-[0.15em] text-muted';

export const primaryButtonClass =
  'mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 font-mono text-sm font-medium text-paper shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper';

export const socialButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface py-3 font-mono text-sm font-medium text-ink shadow-sm transition-colors hover:bg-paper';

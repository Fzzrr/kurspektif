'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from '@/components/ui/icons';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Diberi aksen saat filter menyala (nilainya bukan "semua"). */
  active?: boolean;
  icon?: ReactNode;
  /** Kelas untuk pembungkus terluar — mengatur perilaku flex-nya di induk. */
  className?: string;
};

// Pengganti <select> native. Panel opsi milik <select> digambar oleh sistem
// operasi, bukan halaman — CSS apa pun tidak sampai ke sana. Satu-satunya cara
// menyamakan tampilannya dengan tema adalah menggambar panelnya sendiri.
export default function SelectMenu<T extends string>({
  options,
  value,
  onChange,
  active = false,
  icon,
  className = 'shrink-0',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Klik di luar & tombol Escape: dua hal yang pada <select> native diurus
  // browser, dan jadi tanggung jawab kita begitu panelnya dibuat sendiri.
  // Listener hanya dipasang selama panel terbuka.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`flex w-full min-w-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-sm text-ink transition-colors ${
          active ? 'border-accent bg-accent-soft/60' : 'border-line hover:bg-paper'
        }`}
      >
        {icon}
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={`ml-auto size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* `z-30` menaruh panel di atas kartu berita di bawahnya — kartu punya
          shadow sendiri dan akan menimpa panel kalau nilainya terlalu rendah.
          `max-h-72` untuk daftar panjang (mis. ~30 mata uang): panelnya
          menggulung sendiri alih-alih memanjang melewati layar. */}
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-72 min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-1 shadow-[0_18px_40px_-20px_rgba(14,31,26,0.45)]">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left font-mono text-sm transition-colors ${
                  isSelected ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

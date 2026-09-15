'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, SearchIcon } from '@/components/ui/icons';

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
  /** Kotak pencarian di puncak panel; menyaring opsi berdasarkan label. */
  searchable?: boolean;
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
  searchable = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Klik di luar & tombol Escape: dua hal yang pada <select> native diurus
  // browser, dan jadi tanggung jawab kita begitu panelnya dibuat sendiri.
  // Listener hanya dipasang selama panel terbuka.
  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : options;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        className={`flex w-full min-w-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-sm text-ink transition-colors ${
          active ? 'border-accent bg-accent-soft/60' : 'border-line hover:bg-accent-soft'
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
        <div className="menu-in absolute left-0 top-full z-30 mt-2 max-h-72 min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-paper/85 p-1 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {searchable && (
            // `sticky` menjaga kotak cari tetap terlihat saat daftar digulung.
            <label className="sticky top-0 z-10 mb-1 flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 transition-colors focus-within:border-accent">
              <SearchIcon className="size-4 shrink-0 text-muted" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari..."
                className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted/60"
              />
            </label>
          )}
          {visibleOptions.length === 0 && (
            <p className="px-3 py-2 font-mono text-sm text-muted">Tidak ditemukan</p>
          )}
          {visibleOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`block w-full whitespace-nowrap rounded-xl px-3 py-2 text-left font-mono text-sm transition-colors ${
                  isSelected ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-accent-soft hover:text-ink'
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

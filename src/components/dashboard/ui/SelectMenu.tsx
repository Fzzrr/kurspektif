'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, SearchIcon } from '@/components/ui/icons';
import { useDismiss } from '@/lib/useDismiss';

type Option<T extends string> = {
  value: T;
  label: string;
  /** Bendera atau simbol kecil di depan label. */
  icon?: string;
  /** Baris kedua yang lebih kecil, mis. nama lengkap mata uang. */
  hint?: string;
  /** Teks tambahan yang ikut dicari tapi tidak ditampilkan. */
  keywords?: string;
};

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

  function close() {
    setOpen(false);
    setQuery('');
  }

  useDismiss(rootRef, open, close);
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? options.filter((option) =>
        [option.label, option.hint, option.keywords].some((text) => text?.toLowerCase().includes(normalizedQuery)),
      )
    : options;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        title={selected?.hint ? `${selected.label} - ${selected.hint}` : undefined}
        className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 font-mono text-sm text-ink transition-colors ${
          active ? 'bg-accent-soft font-medium' : 'bg-accent-soft/60 hover:bg-accent-soft'
        }`}
      >
        {icon}
        {selected && <OptionText option={selected} strong />}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* `z-30` menaruh panel di atas kartu berita di bawahnya — kartu punya
          shadow sendiri dan akan menimpa panel kalau nilainya terlalu rendah.
          `max-h-72` untuk daftar panjang (mis. ~30 mata uang): panelnya
          menggulung sendiri alih-alih memanjang melewati layar. */}
      {open && (
        <div className="menu-in absolute left-0 top-full z-30 mt-2 max-h-72 w-full overflow-y-auto overscroll-contain bg-black/70 p-1 shadow-[0_28px_70px_-18px_rgba(0,0,0,1)] backdrop-blur-xl">
          {searchable && (
            // `sticky` menjaga kotak cari tetap terlihat saat daftar digulung —
            // latar dibuat solid (bukan translucent seperti panelnya) supaya
            // opsi yang lewat di baliknya tidak tembus dan mengganggu keterbacaan.
            // Shadow di bawahnya menegaskan batas dari daftar yang bergulir.
            <label className="sticky top-0 z-10 mb-1 flex items-center gap-2 bg-paper px-3 py-2 shadow-[0_10px_16px_-6px_rgba(0,0,0,0.8)] ring-1 ring-transparent transition-[box-shadow] focus-within:ring-accent/40">
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
                className={`flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left font-mono text-sm transition-colors ${
                  isSelected ? 'bg-white/10 text-accent' : 'text-muted hover:bg-white/5 hover:text-ink'
                }`}
              >
                <OptionText option={option} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Label satu baris, atau dua baris (label + hint) kalau opsinya punya hint.
function OptionText<T extends string>({ option, strong = false }: { option: Option<T>; strong?: boolean }) {
  return (
    <>
      {option.icon && <span className="shrink-0 text-base leading-none">{option.icon}</span>}
      {option.hint ? (
        <span className="min-w-0 text-left leading-tight">
          <span className={`block truncate ${strong ? 'font-semibold text-ink' : ''}`}>{option.label}</span>
          <span className={`block font-sans text-xs text-muted ${strong ? 'truncate' : ''}`}>{option.hint}</span>
        </span>
      ) : (
        <span className="truncate">{option.label}</span>
      )}
    </>
  );
}

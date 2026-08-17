'use client';

import { SearchIcon } from '@/components/ui/icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

// Berdiri sendiri di paling atas halaman, dipisah dari NewsFilterBar supaya
// bisa dipusatkan tanpa ikut mengatur tata letak filter di bawahnya.
export default function NewsSearchBar({ value, onChange }: Props) {
  return (
    <label className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5">
      <SearchIcon className="size-4 shrink-0 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari berita, sumber, atau pasangan mata uang..."
        className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted/60"
      />
    </label>
  );
}
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FIRST_RATE_DATE, todayKey } from '@/lib/timeAgo';

type Props = { slug: string; initial?: string };

// Pemilih tanggal untuk halaman /kurs/<pasangan>/<tanggal>. Input tanggal
// bawaan browser: kalender di ponsel, ketik di desktop, tanpa pustaka.
export default function RateDateForm({ slug, initial }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initial ?? '');
  const today = todayKey();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (date) router.push(`/kurs/${slug}/${date}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-2 text-sm text-muted">
        Tanggal
        <input
          type="date"
          required
          min={FIRST_RATE_DATE}
          max={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-11 bg-accent-soft px-3 font-mono text-[15px] text-ink outline-none [color-scheme:dark] focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <button type="submit" className="h-11 bg-ink px-5 text-[15px] font-medium text-paper hover:opacity-90">
        Lihat kurs
      </button>
    </form>
  );
}

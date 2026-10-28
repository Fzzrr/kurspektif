'use client';

import { useState } from 'react';

const TOP_COUNT = 6;

type CurrencyCount = { code: string; name: string; count: number };

type Props = {
  /** Mata uang yang muncul di berita, urut paling sering dibahas. */
  currencies: CurrencyCount[];
  value: string;
  onChange: (value: string) => void;
};

// Peringkat mata uang yang paling sering dibahas, sekaligus filternya.
// Layar lebar: daftar dengan batang tipis sepanjang porsinya terhadap yang
// teratas. Ponsel/tablet: satu baris chip yang digulir menyamping.
export default function CurrencyFilter({ currencies, value, onChange }: Props) {
  const [showAll, setShowAll] = useState(false);
  const max = currencies[0]?.count ?? 0;
  // Mata uang yang sedang dipilih tetap terlihat walau di luar enam teratas.
  const listed = showAll
    ? currencies
    : currencies.filter((c, index) => index < TOP_COUNT || c.code === value);

  const toggle = (code: string) => onChange(value === code ? 'semua' : code);

  return (
    <section className="xl:rounded-2xl xl:bg-surface xl:p-5">
      <div className="hidden items-baseline justify-between xl:flex">
        <h2 className="text-sm font-medium">Paling banyak dibahas</h2>
        {value !== 'semua' && (
          <button type="button" onClick={() => onChange('semua')} className="text-xs text-muted hover:text-ink">
            Semua mata uang
          </button>
        )}
      </div>

      {/* Ponsel & tablet */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 xl:hidden"
        role="group"
        aria-label="Saring menurut mata uang"
      >
        <Chip active={value === 'semua'} onClick={() => onChange('semua')}>
          Semua mata uang
        </Chip>
        {currencies.map((c) => (
          <Chip key={c.code} active={value === c.code} onClick={() => toggle(c.code)} title={c.name}>
            {c.code} <span className="font-mono text-muted">{c.count}</span>
          </Chip>
        ))}
      </div>

      {/* Layar lebar */}
      <ul className="mt-3 hidden xl:block" role="group" aria-label="Saring menurut mata uang">
        {listed.map((c) => {
          const active = value === c.code;
          return (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => toggle(c.code)}
                aria-pressed={active}
                className={`block w-full rounded-lg px-3 py-2.5 text-left ${active ? 'bg-accent-soft' : 'hover:bg-paper/60'}`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm">
                    <span className="font-medium text-ink">{c.code}</span>
                    <span className="ml-2 text-muted">{c.name}</span>
                  </span>
                  <span className="font-mono text-sm text-ink">{c.count}</span>
                </span>
                <span className="mt-2 block h-0.5 bg-line">
                  <span
                    className={`block h-full ${active ? 'bg-ink' : 'bg-muted'}`}
                    style={{ width: `${max ? (c.count / max) * 100 : 0}%` }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {currencies.length > TOP_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-2 hidden px-3 text-xs text-muted hover:text-ink xl:block"
        >
          {showAll ? 'Tampilkan lebih sedikit' : `Tampilkan semua ${currencies.length} mata uang`}
        </button>
      )}

      {currencies.length === 0 && (
        <p className="mt-3 hidden px-3 text-sm text-muted xl:block">Belum ada mata uang yang dibahas.</p>
      )}
    </section>
  );
}

function Chip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`h-9 shrink-0 whitespace-nowrap px-3.5 text-sm ${
        active ? 'bg-ink text-paper [&_span]:text-paper/70' : 'bg-surface text-ink hover:bg-accent-soft'
      }`}
    >
      {children}
    </button>
  );
}

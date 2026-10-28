import { SENTIMENT, type Sentiment } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/marketaux';

export type SentimentFilterValue = 'semua' | Sentiment;

const ORDER: Sentiment[] = ['positif', 'netral', 'negatif'];

type Props = {
  /** Berita yang sudah lolos filter lain — sumber hitungan dan proporsi. */
  items: NewsItem[];
  value: SentimentFilterValue;
  onChange: (value: SentimentFilterValue) => void;
};

// Arah sentimen sekaligus filternya: batang proporsi positif/netral/negatif
// dari berita yang sedang tampil, lalu satu baris per sentimen dengan jumlahnya.
// Ponsel: empat sel berjajar; layar lebar (kolom kanan): daftar.
export default function SentimentFilter({ items, value, onChange }: Props) {
  const counts = Object.fromEntries(
    ORDER.map((s) => [s, items.filter((item) => item.sentiment === s).length]),
  ) as Record<Sentiment, number>;

  const options: { value: SentimentFilterValue; label: string; count: number; color?: string }[] = [
    { value: 'semua', label: 'Semua', count: items.length },
    ...ORDER.map((s) => ({ value: s, label: SENTIMENT[s].label, count: counts[s], color: SENTIMENT[s].color })),
  ];

  return (
    <section className="rounded-2xl bg-surface p-4 xl:p-5">
      <h2 className="text-sm font-medium">Arah sentimen</h2>

      {/* Proporsi digambar dari jumlah yang sama dengan angka di bawahnya. Tanpa
          berita, batang tetap ada sebagai jalur kosong. */}
      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
        {ORDER.map((s) =>
          counts[s] > 0 ? (
            <span key={s} style={{ flexGrow: counts[s], backgroundColor: SENTIMENT[s].color }} />
          ) : null,
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 xl:grid-cols-1 xl:gap-0.5" role="group" aria-label="Saring menurut sentimen">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`flex flex-col items-start gap-1 rounded-lg px-2.5 py-2 text-left xl:h-10 xl:flex-row xl:items-center xl:justify-between xl:px-3 xl:py-0 ${
                active ? 'bg-accent-soft text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              <span className="flex items-center gap-2 text-xs xl:text-sm">
                {option.color && (
                  <span className="inline-block size-2 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
                )}
                {option.label}
              </span>
              <span className={`font-mono text-lg leading-none xl:text-sm ${active ? 'text-ink' : 'text-ink/80'}`}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

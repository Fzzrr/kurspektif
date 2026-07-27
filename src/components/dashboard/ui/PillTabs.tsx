'use client';

// Kontrol tab berbentuk pil, dipakai untuk pasangan kurs cepat (PairSelector)
// dan pilihan rentang waktu grafik (RateChartCard). Generik lewat <T extends
// string> supaya bisa dipakai untuk daftar opsi apa pun tanpa "as"/cast.
type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function PillTabs<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: Props<T>) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-paper p-1 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
              isActive ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

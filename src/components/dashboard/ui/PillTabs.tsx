'use client';

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
      className={`inline-flex items-center gap-1 bg-accent-soft p-1 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 font-mono text-[13px] transition-colors ${
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
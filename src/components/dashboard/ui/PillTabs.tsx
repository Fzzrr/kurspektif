'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

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
  const instanceId = useId();

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
            className={`relative rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
              isActive ? 'text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`pill-active-bg-${instanceId}`}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
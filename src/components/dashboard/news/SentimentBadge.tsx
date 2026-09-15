import { SENTIMENT, type Sentiment } from '@/lib/sentiment';

// Pill sentimen: latar tipis + teks berwarna sentimennya, tanpa kapital.
export default function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const { color, label } = SENTIMENT[sentiment];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

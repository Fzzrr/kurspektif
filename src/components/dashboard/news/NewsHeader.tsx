import { SENTIMENT, type Sentiment } from '@/lib/sentiment';
import { NEWS_ITEMS } from '@/lib/mock/news';

export default function NewsHeader() {
  const counts = (Object.keys(SENTIMENT) as Sentiment[]).map((sentiment) => ({
    sentiment,
    label: SENTIMENT[sentiment].label,
    color: SENTIMENT[sentiment].color,
    count: NEWS_ITEMS.filter((item) => item.sentiment === sentiment).length,
  }));

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Berita</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Berita finansial dunia.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Mata uang, ekonomi makro, kebijakan bank sentral, dan komoditas — setiap berita ditandai
          sentimen agar kamu bisa membaca arah, bukan cuma judul.
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        {counts.map(({ sentiment, label, color, count }) => (
          <span
            key={sentiment}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-ink"
          >
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
            {label} {count}
          </span>
        ))}
      </div>
    </div>
  );
}
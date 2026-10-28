import { SENTIMENT, type Sentiment } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/marketaux';
import { dayLabel, formatTimeAgo, timeOfDay } from '@/lib/timeAgo';

type Props = {
  dayKey: string;
  /** Semua berita hari itu (untuk jumlah di judul). */
  items: NewsItem[];
  /** Yang sudah tampil (dibatasi "Tampilkan lagi"). */
  shown: NewsItem[];
  /** Hari teratas: berita pertamanya jadi berita utama. */
  withLead: boolean;
};

const ORDER: Sentiment[] = ['positif', 'netral', 'negatif'];

// Satu hari di linimasa berita: judul hari + jumlah per sentimen, lalu berita
// urut jam terbit. Di hari teratas, berita terbaru tampil besar sebagai utama.
export default function NewsDay({ dayKey, items, shown, withLead }: Props) {
  const lead = withLead ? shown[0] : undefined;
  const rest = lead ? shown.slice(1) : shown;

  return (
    <section aria-labelledby={`hari-${dayKey}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3">
        <h2 id={`hari-${dayKey}`} className="text-base font-semibold">
          {dayLabel(dayKey)}
        </h2>
        <p className="flex items-center gap-3 text-xs text-muted">
          <span>
            <span className="font-mono text-ink">{items.length}</span> berita
          </span>
          {ORDER.map((s) => {
            const count = items.filter((item) => item.sentiment === s).length;
            return (
              <span key={s} className="flex items-center gap-1.5" title={SENTIMENT[s].label}>
                <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: SENTIMENT[s].color }} />
                <span className="font-mono">{count}</span>
                <span className="sr-only">{SENTIMENT[s].label}</span>
              </span>
            );
          })}
        </p>
      </div>

      {lead && <NewsLead item={lead} />}

      <ul className="divide-y divide-line">
        {rest.map((item) => (
          <NewsRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function NewsLead({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-b border-line py-6"
    >
      {item.image && (
        <div className="aspect-[2/1] overflow-hidden rounded-lg bg-surface">
          <img src={item.image} alt="" className="size-full object-cover transition-opacity group-hover:opacity-90" />
        </div>
      )}
      <Meta item={item} className={item.image ? 'mt-5' : ''} showAgo />
      <h3 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.01em] decoration-muted underline-offset-4 group-hover:underline md:text-2xl xl:text-[28px] xl:leading-tight">
        {item.headline}
      </h3>
      {item.summary && (
        <p className="mt-3 line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-muted">{item.summary}</p>
      )}
    </a>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-4 py-5 sm:gap-5"
      >
        <time
          dateTime={item.publishedAt}
          className="hidden w-12 shrink-0 pt-px font-mono text-sm text-muted sm:block"
        >
          {timeOfDay(item.publishedAt)}
        </time>

        <div className="min-w-0 flex-1">
          <Meta item={item} />
          <h3 className="mt-1.5 line-clamp-3 text-base font-medium leading-snug text-ink decoration-muted underline-offset-4 group-hover:underline">
            {item.headline}
          </h3>
          {item.summary && (
            <p className="mt-1.5 hidden text-sm leading-relaxed text-muted sm:line-clamp-2">{item.summary}</p>
          )}
        </div>

        {item.image && (
          <div className="aspect-square w-20 shrink-0 self-start overflow-hidden rounded-lg bg-surface sm:aspect-[16/10] sm:w-28 lg:w-36">
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-opacity group-hover:opacity-90"
            />
          </div>
        )}
      </a>
    </li>
  );
}

// Baris kecil di atas judul: sentimen, sumber, pasangan, waktu.
// Di baris linimasa, jam terbit sudah ada di kolom kiri (layar sm ke atas),
// jadi "x jam lalu" hanya untuk berita utama dan ponsel.
function Meta({ item, className = '', showAgo = false }: { item: NewsItem; className?: string; showAgo?: boolean }) {
  const { color, label } = SENTIMENT[item.sentiment];
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted ${className}`}>
      <span className="flex items-center gap-1.5 text-ink">
        <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <Part>{item.source}</Part>
      {item.pair && <Part className="font-mono text-ink">{item.pair}</Part>}
      <Part className={showAgo ? '' : 'sm:hidden'}>{formatTimeAgo(item.publishedAt)}</Part>
    </p>
  );
}

// Titik pemisah menempel di depan bagiannya, supaya saat baris terbungkus
// tidak ada "·" yang menggantung di ujung baris.
function Part({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <span aria-hidden className="mr-2 text-muted">·</span>
      {children}
    </span>
  );
}

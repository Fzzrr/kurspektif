import MarketMoversCard from './rate/MarketMoversCard';
import NewsListCard from './news/NewsListCard';

// 3fr/2fr ~= proporsi 60/40 dari desain — kartu kiri (movers) lebih lebar
// dari kartu kanan (daftar berita).
export default function InsightRow() {
  return (
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
      <MarketMoversCard />
      <NewsListCard />
    </div>
  );
}

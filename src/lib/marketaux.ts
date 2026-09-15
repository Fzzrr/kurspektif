import type { Sentiment } from '@/lib/sentiment';

const MARKETAUX_BASE = 'https://api.marketaux.com/v1/news/all';

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: Sentiment;
  pair?: string;
  image?: string;
};

type MarketauxEntity = { name?: string; type?: string; sentiment_score?: number };
type MarketauxArticle = {
  uuid: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url?: string;
  entities?: MarketauxEntity[];
};

function toSentiment(entities: MarketauxEntity[] | undefined): Sentiment {
  const scores = (entities ?? [])
    .map((e) => e.sentiment_score)
    .filter((score): score is number => typeof score === 'number');
  if (scores.length === 0) return 'netral';

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  if (avg > 0.15) return 'positif';
  if (avg < -0.15) return 'negatif';
  return 'netral';
}

// Pasangan diambil apa adanya dari entity Marketaux (mis. "USD/JPY") — itu
// pasangan yang benar-benar dibahas artikelnya. Jangan dikarang jadi X/IDR:
// artikel USD/JPY tidak membahas rupiah sama sekali.
function mapArticle(article: MarketauxArticle): NewsItem {
  return {
    id: article.uuid,
    headline: article.title,
    summary: article.description,
    source: article.source,
    url: article.url,
    publishedAt: article.published_at,
    sentiment: toSentiment(article.entities),
    pair: article.entities?.find((e) => e.type === 'currency')?.name,
    image: article.image_url,
  };
}

// Tier gratis Marketaux membatasi hasil ke 3 artikel per request TERLEPAS
// dari `limit` yang dikirim (sudah dites manual, limit=30 tetap balik 3).
// Untuk dapat lebih banyak tanpa upgrade plan: tarik beberapa halaman
// sekaligus dan gabungkan. 8 halaman x revalidate 3 jam = 64 request/hari,
// masih di bawah kuota 100/hari (termasuk widget "Berita terkait" yang
// memanggil fungsi ini juga — sama-sama kena cache fetch Next.js karena
// URL-nya identik dalam jendela revalidate yang sama). Hasilnya 24 artikel
// unik per refresh, vs 9 kalau cuma 3 halaman.
const PAGES_TO_FETCH = 8;
const REVALIDATE_SECONDS = 10_800;

export async function fetchCurrencyNews(): Promise<NewsItem[]> {
  const apiKey = process.env.MARKETAUX_API_KEY;
  if (!apiKey) throw new Error('MARKETAUX_API_KEY is not set');

  // `search` di Marketaux tidak mendukung sintaks boolean (OR/tanda kutip) —
  // sudah dites manual, query semacam itu selalu balik 0 hasil. Cukup andalkan
  // `entity_types=currency` untuk menyaring ke berita bermuatan mata uang.
  const baseParams = {
    api_token: apiKey,
    entity_types: 'currency',
    filter_entities: 'true',
    language: 'id,en',
    limit: '30',
  };

  const pageNumbers = Array.from({ length: PAGES_TO_FETCH }, (_, i) => i + 1);
  const results = await Promise.allSettled(
    pageNumbers.map(async (page) => {
      const params = new URLSearchParams({ ...baseParams, page: String(page) });
      const res = await fetch(`${MARKETAUX_BASE}?${params}`, { next: { revalidate: REVALIDATE_SECONDS } });
      if (!res.ok) throw new Error(`Failed to fetch news (${res.status})`);
      const data: { data: MarketauxArticle[] } = await res.json();
      return data.data;
    }),
  );

  const fulfilled = results.filter((r): r is PromiseFulfilledResult<MarketauxArticle[]> => r.status === 'fulfilled');
  if (fulfilled.length === 0) throw (results[0] as PromiseRejectedResult).reason;

  const seen = new Set<string>();
  const articles = fulfilled
    .flatMap((r) => r.value)
    .filter((article) => (seen.has(article.uuid) ? false : (seen.add(article.uuid), true)));

  return articles.map(mapArticle);
}

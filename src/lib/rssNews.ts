// Berita berbahasa Indonesia dari RSS penerbit lokal — menutup celah Marketaux
// yang hampir tidak pernah membahas rupiah. Hanya artikel yang menyebut
// rupiah yang diambil.
import { createHash } from 'node:crypto';
import type { NewsItem } from './marketaux';
import type { Sentiment } from './sentiment';

const FEEDS = [
  'https://www.cnbcindonesia.com/market/rss',
  'https://www.antaranews.com/rss/ekonomi-finansial.xml',
  'https://www.cnnindonesia.com/ekonomi/rss',
];
const REVALIDATE_SECONDS = 1800;

// Urutan penting: "dolar singapura" harus dicek sebelum "dolar".
const COUNTERPARTS: [RegExp, string][] = [
  [/dolar singapura/i, 'SGD'],
  [/dolar australia/i, 'AUD'],
  [/dolar hong ?kong/i, 'HKD'],
  [/\b(dolar|dollar|usd|greenback)\b/i, 'USD'],
  [/\byen\b/i, 'JPY'],
  [/\beuro\b/i, 'EUR'],
  [/\b(yuan|renminbi)\b/i, 'CNY'],
  [/\bringgit\b/i, 'MYR'],
  [/\briyal\b/i, 'SAR'],
  [/\bwon\b/i, 'KRW'],
  [/\b(poundsterling|pound sterling)\b/i, 'GBP'],
];

// ponytail: sentimen dari kata kerja di dekat "rupiah" pada judul — kasar
// tapi bisa dijelaskan; ganti ke model bahasa kalau labelnya sering meleset.
const UP = /rupiah\b[^.,;:]{0,30}\b(menguat|naik|perkasa|bangkit|rebound|terapresiasi|melesat|melonjak)/i;
const DOWN = /rupiah\b[^.,;:]{0,30}\b(melemah|turun|anjlok|ambruk|tertekan|jatuh|terdepresiasi|keok|loyo|ambles)/i;

function sentimentOf(title: string): Sentiment {
  if (UP.test(title)) return 'positif';
  if (DOWN.test(title)) return 'negatif';
  return 'netral';
}

/** "USD/IDR" kalau mata uang lawannya disebut; "IDR" saja kalau tidak — jangan dikarang. */
function pairOf(text: string): string {
  const counterpart = COUNTERPARTS.find(([pattern]) => pattern.test(text))?.[1];
  return counterpart ? `${counterpart}/IDR` : 'IDR';
}

const decode = (text: string) =>
  text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (item: string, name: string) => item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '';

function imageOf(item: string): string | undefined {
  const url =
    item.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/)?.[1] ??
    item.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ??
    item.match(/<img[^>]*src="([^"]+)"/)?.[1];
  return url?.replace(/&amp;/g, '&');
}

export function parseFeed(xml: string): NewsItem[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.flatMap((item) => {
    const headline = decode(tag(item, 'title'));
    const summary = decode(tag(item, 'description'));
    const url = decode(tag(item, 'link'));
    const published = new Date(decode(tag(item, 'pubDate')));
    if (!headline || !url || Number.isNaN(published.getTime())) return [];
    if (!/\brupiah\b/i.test(`${headline} ${summary}`)) return [];

    return [
      {
        id: `rss-${createHash('sha1').update(url).digest('hex').slice(0, 24)}`,
        headline,
        summary,
        source: new URL(url).hostname.replace(/^www\./, ''),
        url,
        publishedAt: published.toISOString(),
        sentiment: sentimentOf(headline),
        pair: pairOf(`${headline} ${summary}`),
        image: imageOf(item),
      },
    ];
  });
}

export async function fetchIndonesianNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kurspektif/1.0)' },
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error(`${feed}: ${res.status}`);
      return parseFeed(await res.text());
    }),
  );
  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

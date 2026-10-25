import type { MetadataRoute } from 'next';
import { POPULAR_PAIRS, pairToSlug } from '@/lib/pairs';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return [
    { url: `${base}/`, changeFrequency: 'weekly' },
    { url: `${base}/kurs`, changeFrequency: 'daily' },
    ...POPULAR_PAIRS.map((pair) => ({ url: `${base}/kurs/${pairToSlug(pair)}`, changeFrequency: 'daily' as const })),
    { url: `${base}/metodologi`, changeFrequency: 'monthly' },
  ];
}

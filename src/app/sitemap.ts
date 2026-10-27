import type { MetadataRoute } from 'next';
import { FEATURED_PAIRS, pairToSlug } from '@/lib/pairs';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return [
    { url: `${base}/`, changeFrequency: 'weekly' },
    { url: `${base}/kurs`, changeFrequency: 'daily' },
    ...FEATURED_PAIRS.map((pair) => ({ url: `${base}/kurs/${pairToSlug(pair)}`, changeFrequency: 'daily' as const })),
    { url: `${base}/metodologi`, changeFrequency: 'monthly' },
    { url: `${base}/syarat`, changeFrequency: 'yearly' },
    { url: `${base}/privasi`, changeFrequency: 'yearly' },
  ];
}

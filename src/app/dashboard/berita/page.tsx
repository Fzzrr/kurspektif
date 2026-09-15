import NewsBoard from '@/components/dashboard/NewsBoard';
import { fetchCurrencyNews, type NewsItem } from '@/lib/marketaux';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';

type Props = { searchParams: Promise<{ currency?: string }> };

export default async function BeritaPage({ searchParams }: Props) {
  const { currency } = await searchParams;
  const currencies = await fetchSupportedCurrencies();

  let items: NewsItem[] = [];
  try {
    items = await fetchCurrencyNews();
  } catch (err) {
    console.error('Gagal mengambil berita:', err);
  }

  return <NewsBoard items={items} currencies={currencies} initialCurrency={currency} />;
}

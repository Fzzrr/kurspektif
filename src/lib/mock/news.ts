import type { Sentiment } from '@/lib/sentiment';

export type NewsRegion = 'Indonesia' | 'Asia' | 'AS & Eropa' | 'Global';
export type NewsCategory = 'Ekonomi' | 'Mata uang' | 'Bank sentral' | 'Komoditas' | 'Pasar saham';

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timeAgo: string;
  sentiment: Sentiment;
  region: NewsRegion;
  category: NewsCategory;
  pair?: string;
  isHeadline?: boolean;
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    headline: 'Powell isyaratkan The Fed siap tahan suku bunga lebih lama dari ekspektasi pasar',
    summary:
      'Pernyataan terbaru ketua The Fed di hadapan Kongres menggeser ekspektasi pemangkasan suku bunga ke kuartal akhir tahun ini, mendorong dolar AS menguat ke level tertinggi enam pekan.',
    source: 'Reuters',
    timeAgo: '1 jam lalu',
    sentiment: 'negatif',
    region: 'AS & Eropa',
    category: 'Bank sentral',
    pair: 'USD/IDR',
    isHeadline: true,
  },
  {
    id: '2',
    headline: 'Surplus neraca perdagangan Mei lebih tinggi dari konsensus, dukung rupiah',
    summary:
      'Surplus neraca perdagangan Mei tercatat lebih tinggi dari perkiraan pasar, memberi sedikit dukungan bagi nilai tukar rupiah di tengah tekanan eksternal.',
    source: 'CNBC Indonesia',
    timeAgo: '3 jam lalu',
    sentiment: 'positif',
    region: 'Indonesia',
    category: 'Ekonomi',
    pair: 'USD/IDR',
  },
  {
    id: '3',
    headline: 'Yen Jepang stabil di 156, BoJ pertahankan pendekatan hati-hati',
    summary:
      'Yen bergerak stabil di kisaran 156 per dolar AS. Bank of Japan mempertahankan pendekatan kebijakan yang hati-hati di tengah ketidakpastian global.',
    source: 'Bloomberg',
    timeAgo: '5 jam lalu',
    sentiment: 'netral',
    region: 'Asia',
    category: 'Mata uang',
    pair: 'JPY/IDR',
  },
  {
    id: '4',
    headline: 'Harga minyak Brent menguat 2,1% setelah OPEC+ pertahankan kuota produksi',
    summary:
      'Harga minyak mentah Brent naik 2,1% setelah OPEC+ memutuskan mempertahankan kuota produksi saat ini, mengurangi kekhawatiran kelebihan pasokan di pasar global.',
    source: 'Financial Times',
    timeAgo: '6 jam lalu',
    sentiment: 'positif',
    region: 'Global',
    category: 'Komoditas',
  },
  {
    id: '5',
    headline: 'Wall Street ditutup melemah di tengah kekhawatiran inflasi jasa AS',
    summary:
      'Bursa saham Wall Street ditutup melemah setelah data inflasi sektor jasa AS keluar lebih tinggi dari ekspektasi, memicu kekhawatiran suku bunga akan bertahan tinggi lebih lama.',
    source: 'Wall Street Journal',
    timeAgo: '9 jam lalu',
    sentiment: 'negatif',
    region: 'AS & Eropa',
    category: 'Pasar saham',
    pair: 'USD/IDR',
  },
  {
    id: '6',
    headline: 'BI: cadangan devisa Mei naik tipis ke USD 150,2 miliar',
    summary:
      'Kenaikan didorong penerbitan sukuk global dan penerimaan pajak. Cadangan cukup untuk membiayai 6,4 bulan impor.',
    source: 'Antara',
    timeAgo: 'Kemarin',
    sentiment: 'positif',
    region: 'Indonesia',
    category: 'Ekonomi',
    pair: 'USD/IDR',
  },
  {
    id: '7',
    headline: 'Inflasi inti Singapura sesuai ekspektasi di 3,1% pada Mei',
    summary:
      'MAS belum memberi sinyal perubahan kebijakan. Pasar memperkirakan stance saat ini bertahan hingga akhir tahun.',
    source: 'Channel News Asia',
    timeAgo: 'Kemarin',
    sentiment: 'netral',
    region: 'Asia',
    category: 'Ekonomi',
    pair: 'SGD/IDR',
  },
  {
    id: '8',
    headline: 'Euro tertekan di bawah 1,07 setelah data PMI manufaktur Jerman mengecewakan',
    summary:
      'Kontraksi melebar pada sektor manufaktur. ECB diperkirakan mempertahankan jalur pemangkasan secara bertahap.',
    source: 'Bloomberg',
    timeAgo: '2 hari lalu',
    sentiment: 'negatif',
    region: 'AS & Eropa',
    category: 'Mata uang',
    pair: 'EUR/IDR',
  },
  {
    id: '9',
    headline: 'Emas tembus rekor baru di USD 2.450/oz, dorong arus masuk safe-haven',
    summary:
      'Ketegangan geopolitik dan ekspektasi pelemahan dolar dalam jangka menengah jadi pendorong utama.',
    source: 'Reuters',
    timeAgo: '2 hari lalu',
    sentiment: 'positif',
    region: 'Global',
    category: 'Komoditas',
  },
];

export const REGIONS: NewsRegion[] = ['Indonesia', 'Asia', 'AS & Eropa', 'Global'];
export const CATEGORIES: NewsCategory[] = ['Ekonomi', 'Mata uang', 'Bank sentral', 'Komoditas', 'Pasar saham'];

// Diturunkan dari data, bukan ditulis manual — daftar opsinya ikut bertambah
// sendiri saat ada berita baru dengan pasangan yang belum pernah muncul.
// Berita komoditas murni (minyak, emas) sengaja tidak ber-`pair`.
export const NEWS_PAIRS: string[] = Array.from(
  new Set(NEWS_ITEMS.map((item) => item.pair).filter((pair): pair is string => Boolean(pair))),
).sort();
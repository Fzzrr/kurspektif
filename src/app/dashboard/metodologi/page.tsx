// Cara kerja tiap angka di dashboard. Angka-angka di sini harus sama dengan
// kodenya: ambang sentimen (lib/marketaux.ts), ambang "stabil" dan keranjang
// (MarketMoversCard.tsx, lib/movers.ts), jendela posisi historis
// (DashboardLiveSection.tsx), jadwal cron (vercel.json).
import type { ReactNode } from 'react';

export const metadata = { title: 'Metodologi — Kurspektif' };

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'sumber-kurs',
    title: 'Sumber kurs',
    body: (
      <>
        <p>
          Kurs diambil dari Frankfurter (frankfurter.dev), layanan terbuka yang mengumpulkan kurs referensi harian
          terbitan bank sentral. Kurs ini terbit sekali per hari kerja — tidak ada pembaruan di akhir pekan dan hari
          libur.
        </p>
        <p>
          Ini <strong className="font-medium text-ink">kurs tengah</strong>, bukan kurs jual/beli bank atau money
          changer. Saat menukar uang, kamu biasanya mendapat kurs sedikit lebih buruk karena ada selisih (spread) dan
          biaya.
        </p>
      </>
    ),
  },
  {
    id: 'posisi-historis',
    title: 'Mahal atau murah',
    body: (
      <p>
        Kurs hari ini dibandingkan dengan 90 hari kerja terakhir. &ldquo;Lebih tinggi dari 80% hari&rdquo; artinya kurs
        sekarang lebih tinggi dari 80% hari dalam periode itu. Ini posisi relatif, bukan ramalan arah berikutnya.
      </p>
    ),
  },
  {
    id: 'penggerak',
    title: 'Yang menggerakkan pasangan minggu ini',
    body: (
      <>
        <p>
          Kalau USD/IDR naik, belum tentu dolar yang menguat — bisa jadi rupiah yang melemah. Untuk memisahkannya, tiap
          mata uang dibandingkan dengan sekeranjang mata uang utama: USD, EUR, JPY, GBP, CNY, dan SGD. Kekuatannya
          adalah rata-rata perubahan terhadap isi keranjang (selain dirinya sendiri) selama 7 hari terakhir.
        </p>
        <p>
          Perubahan di bawah ±0,2% dianggap stabil. &ldquo;Hari paling bergejolak&rdquo; adalah hari dengan perubahan
          harian terbesar pada pasangan itu dalam seminggu.
        </p>
      </>
    ),
  },
  {
    id: 'sentimen',
    title: 'Sentimen berita',
    body: (
      <>
        <p>
          Berita dan skor sentimennya berasal dari Marketaux. Tiap artikel punya skor per entitas yang dibahas, dari −1
          (sangat negatif) sampai 1 (sangat positif). Skor itu kami rata-ratakan: di atas 0,15 positif, di bawah −0,15
          negatif, sisanya netral.
        </p>
        <p>
          Skor dihitung mesin dari teks artikel, bukan oleh analis. &ldquo;Positif&rdquo; berarti nada beritanya
          positif terhadap yang dibahas — bukan tanda kurs akan naik, apalagi sinyal untuk membeli. Sebagian besar
          berita berbahasa Inggris dan membahas pasar global, jadi berita tentang rupiah masih sedikit.
        </p>
      </>
    ),
  },
  {
    id: 'alert',
    title: 'Alert kurs',
    body: (
      <p>
        Alert dicek sekali sehari sekitar pukul 08.00 WIB terhadap kurs referensi terbaru. Saat batasnya terlewati, kami
        kirim satu email lalu alert itu berhenti sampai kamu mengeditnya. Karena kursnya harian, pergerakan singkat di
        tengah hari tidak akan terdeteksi.
      </p>
    ),
  },
];

export default function MetodologiPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs text-muted">Metodologi</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Dari mana angka-angka ini</h1>
      <p className="mt-3 text-sm text-muted">
        Penjelasan singkat cara tiap bagian dashboard dihitung, supaya kamu tahu seberapa jauh angkanya bisa dipercaya.
      </p>

      <div className="mt-8 divide-y divide-line">
        {SECTIONS.map(({ id, title, body }) => (
          <section key={id} id={id} className="scroll-mt-20 py-6 md:scroll-mt-8">
            <h2 className="text-sm font-medium text-ink">{title}</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted">{body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

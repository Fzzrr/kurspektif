// Cara kerja tiap angka di dashboard. Angka-angka di sini harus sama dengan
// kodenya: ambang sentimen (lib/marketaux.ts), ambang "stabil" dan keranjang
// (MarketMoversCard.tsx, lib/movers.ts), jendela posisi historis
// (lib/rateStats.ts), jadwal cron (vercel.json). Dipakai di /metodologi (publik)
// dan /dashboard/metodologi.
import type { ReactNode } from 'react';

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
          Ini <strong className="font-semibold">kurs tengah</strong>, bukan kurs jual/beli bank atau money
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
          Berita berbahasa Indonesia diambil dari RSS CNBC Indonesia, Antara, dan CNN Indonesia — hanya yang menyebut
          rupiah. Sentimennya ditentukan dari kata kerja di dekat kata &ldquo;rupiah&rdquo; pada judul:
          &ldquo;menguat&rdquo;, &ldquo;naik&rdquo;, dan sejenisnya positif; &ldquo;melemah&rdquo;,
          &ldquo;anjlok&rdquo;, dan sejenisnya negatif; sisanya netral. Pasangannya diambil dari mata uang lain yang
          disebut artikel — kalau tidak ada, cukup ditandai IDR.
        </p>
        <p>
          Semua skor dihitung mesin, bukan oleh analis. &ldquo;Positif&rdquo; berarti nada beritanya positif terhadap
          yang dibahas — bukan tanda kurs akan naik, apalagi sinyal untuk membeli.
        </p>
      </>
    ),
  },
  {
    id: 'agenda',
    title: 'Agenda ekonomi',
    body: (
      <p>
        Jadwal keputusan suku bunga The Fed, ECB, Bank of England, Bank of Japan, dan Bank Indonesia, serta rilis inflasi AS, disalin dari situs resmi
        masing-masing lembaga dan dikonversi ke WIB. Peristiwa ini sering menggerakkan kurs, tapi tidak selalu — dan
        arahnya tidak bisa ditebak dari jadwalnya saja. Kalender mencakup USD, EUR, GBP, JPY, dan IDR.
      </p>
    ),
  },
  {
    id: 'alert',
    title: 'Alert kurs',
    body: (
      <>
        <p>
          Alert dicek sekali sehari sekitar pukul 08.00 WIB terhadap kurs referensi terbaru. Saat kondisinya terpenuhi,
          kami kirim satu email lalu alert itu berhenti sampai kamu mengeditnya. Karena kursnya harian, pergerakan
          singkat di tengah hari tidak akan terdeteksi.
        </p>
        <p>
          Alert posisi (&ldquo;masuk 20% termurah setahun&rdquo;) membandingkan kurs terbaru dengan semua hari kerja
          dalam 365 hari terakhir: alert terkirim saat kurs lebih rendah dari, misalnya, 80% hari lainnya.
        </p>
      </>
    ),
  },
  {
    id: 'ringkasan',
    title: 'Ringkasan mingguan',
    body: (
      <p>
        Tiap Senin sekitar pukul 07.00 WIB, kami kirim email berisi perubahan 7 hari terakhir untuk pasangan yang kamu
        simpan, penjelasan sisi mana yang menggerakkannya, dan agenda ekonomi minggu itu. Bisa dimatikan di Profil.
      </p>
    ),
  },
];

// `poster`: judul seukuran poster untuk halaman publik; di dashboard cukup
// seukuran judul halaman lain.
type Props = { poster?: boolean; figures?: Partial<Record<string, ReactNode>> };

export default function MethodologyContent({ poster = false, figures = {} }: Props) {
  return (
    <div>
      <h1
        className={
          poster
            ? 'text-balance text-[clamp(44px,7vw,104px)] font-black leading-[0.9] tracking-[-0.04em]'
            : 'text-[34px] font-semibold leading-tight tracking-[-0.02em]'
        }
      >
        Dari mana angka-angka ini
      </h1>
      <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed">
        Cara tiap bagian Kurspektif dihitung, supaya kamu tahu seberapa jauh angkanya bisa dipercaya.
      </p>

      <div className={poster ? 'mt-20 space-y-16 sm:mt-28' : 'mt-12 space-y-12'}>
        {SECTIONS.map(({ id, title, body }) => (
          <section key={id} id={id} className="grid scroll-mt-20 gap-3 md:scroll-mt-8 lg:grid-cols-12 lg:gap-6">
            <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.01em] lg:col-span-4">{title}</h2>
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="max-w-[62ch] space-y-4 text-[17px] leading-relaxed">{body}</div>
              {figures[id] && <div className="mt-8">{figures[id]}</div>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

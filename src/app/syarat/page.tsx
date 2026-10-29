import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';

export const metadata = { title: 'Syarat & Ketentuan' };

export default function SyaratPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      updated="26 Oktober 2026"
      intro={
        <p>
          Dengan memakai Kurspektif, kamu menyetujui syarat di bawah ini. Bacalah bersama{' '}
          <Link href="/privasi" className="underline underline-offset-4 hover:decoration-transparent">
            Kebijakan Privasi
          </Link>
          .
        </p>
      }
      sections={[
        {
          title: 'Apa itu Kurspektif',
          body: (
            <p>
              Kurspektif adalah alat informasi dan edukasi tentang nilai tukar. Kurspektif gratis dan tidak menjual,
              membeli, atau menukar mata uang.
            </p>
          ),
        },
        {
          title: 'Bukan nasihat keuangan',
          body: (
            <p>
              Kurs, analisis penggerak, sentimen berita, dan alert bukan rekomendasi untuk membeli, menjual, atau
              menukar mata uang. Keputusan keuangan sepenuhnya tanggung jawabmu.
            </p>
          ),
        },
        {
          title: 'Akurasi data',
          body: (
            <>
              <p>
                Kurs yang ditampilkan adalah kurs tengah referensi harian dari bank sentral, bukan kurs jual/beli bank
                atau money changer, dan bisa berbeda dari kurs saat kamu bertransaksi.
              </p>
              <p>
                Kurs dan berita berasal dari pihak ketiga dan bisa terlambat, kurang lengkap, atau
                keliru. Sentimen berita dihitung mesin dan bisa salah membaca maksud artikel. Cara tiap angka dihitung
                dijelaskan di{' '}
                <Link href="/metodologi" className="underline underline-offset-4 hover:decoration-transparent">
                  Metodologi
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          title: 'Alert dan email',
          body: (
            <p>
              Alert dicek sekali sehari dengan kurs referensi terbaru, jadi pergerakan di tengah hari tidak terdeteksi,
              dan email bisa terlambat atau gagal terkirim. Jangan mengandalkan alert untuk keputusan yang waktunya
              penting.
            </p>
          ),
        },
        {
          title: 'Akunmu',
          body: (
            <ul>
              <li>Pakai email yang benar-benar milikmu dan jaga kerahasiaan kata sandimu.</li>
              <li>Kamu bertanggung jawab atas aktivitas di akunmu.</li>
              <li>Kamu bisa menghapus akunmu kapan saja di Profil.</li>
            </ul>
          ),
        },
        {
          title: 'Pemakaian yang tidak diperbolehkan',
          body: (
            <ul>
              <li>Mencoba masuk ke akun orang lain atau membobol keamanan layanan.</li>
              <li>Mengambil data secara otomatis dalam jumlah besar yang membebani layanan.</li>
              <li>Memakai Kurspektif untuk hal yang melanggar hukum.</li>
            </ul>
          ),
        },
        {
          title: 'Perubahan layanan',
          body: (
            <p>
              Fitur bisa berubah, ditambah, atau dihentikan. Akun yang melanggar syarat ini dapat dinonaktifkan. Kalau
              syarat ini berubah, tanggal di atas ikut diperbarui.
            </p>
          ),
        },
      ]}
    />
  );
}

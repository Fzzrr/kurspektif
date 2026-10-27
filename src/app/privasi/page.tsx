import Link from 'next/link';
import LegalPage from '@/components/legal/LegalPage';

export const metadata = { title: 'Kebijakan Privasi — Kurspektif' };

// Isinya mengikuti apa yang benar-benar disimpan dan dikirim aplikasi ini
// (prisma/schema.prisma, cron email, Auth.js). Ubah halaman ini setiap kali
// ada data atau layanan pihak ketiga baru.
export default function PrivasiPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      updated="26 Oktober 2026"
      intro={
        <p>
          Halaman ini menjelaskan data apa yang disimpan Kurspektif tentang kamu, untuk apa, dan bagaimana kamu bisa
          mengubah atau menghapusnya.
        </p>
      }
      sections={[
        {
          title: 'Data yang kami simpan',
          body: (
            <ul>
              <li>Nama dan alamat email, dari formulir daftar atau dari akun Google-mu.</li>
              <li>Foto profil, kalau kamu mengunggahnya atau masuk lewat Google.</li>
              <li>Kata sandi dalam bentuk hash bcrypt. Kata sandi aslinya tidak pernah kami simpan.</li>
              <li>Alert kurs, pasangan mata uang yang kamu simpan, dan pilihanmu soal ringkasan mingguan.</li>
            </ul>
          ),
        },
        {
          title: 'Data yang tidak kami kumpulkan',
          body: (
            <p>
              Kurspektif tidak memakai alat analitik, iklan, atau pelacak. Kurs, berita, dan agenda yang kamu lihat
              diambil dari sumber publik tanpa mengirim data pribadimu ke sana.
            </p>
          ),
        },
        {
          title: 'Untuk apa data dipakai',
          body: (
            <ul>
              <li>Memasukkan kamu ke akunmu dan menjaga akun tetap aman.</li>
              <li>Mengirim email alert saat kondisi yang kamu pasang tercapai.</li>
              <li>Mengirim ringkasan mingguan untuk pasangan yang kamu simpan, kalau fitur itu aktif.</li>
              <li>Mengirim email verifikasi saat kamu mengganti email atau mengatur ulang kata sandi.</li>
            </ul>
          ),
        },
        {
          title: 'Layanan pihak ketiga',
          body: (
            <ul>
              <li>Supabase: database tempat data akunmu disimpan.</li>
              <li>Resend: pengiriman email.</li>
              <li>Google: hanya kalau kamu memilih masuk dengan Google.</li>
              <li>Penyedia hosting yang menjalankan situs ini.</li>
            </ul>
          ),
        },
        {
          title: 'Cookie',
          body: (
            <p>
              Kami hanya memakai cookie yang dibutuhkan untuk masuk: cookie sesi dan cookie keamanan dari Auth.js. Tidak
              ada cookie iklan atau pelacak.
            </p>
          ),
        },
        {
          title: 'Email dari kami',
          body: (
            <p>
              Ringkasan mingguan bisa dimatikan kapan saja dari tautan di bagian bawah emailnya atau di Profil.
              Email alert hanya dikirim untuk alert yang kamu pasang sendiri; hapus alert-nya kalau tidak ingin
              menerimanya lagi.
            </p>
          ),
        },
        {
          title: 'Mengubah dan menghapus data',
          body: (
            <p>
              Nama, foto, email, kata sandi, dan pilihan email bisa diubah di Profil. Kamu juga bisa menghapus akun di
              Profil: akun, alert, dan pasangan tersimpan langsung dihapus permanen dari database kami.
            </p>
          ),
        },
        {
          title: 'Perubahan kebijakan',
          body: (
            <p>
              Kalau kebijakan ini berubah, tanggal di atas ikut diperbarui. Lihat juga{' '}
              <Link href="/syarat" className="underline underline-offset-4 hover:decoration-transparent">
                Syarat &amp; Ketentuan
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  );
}

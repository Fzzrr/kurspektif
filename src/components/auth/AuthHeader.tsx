import Link from 'next/link';
import Wordmark from '../ui/Wordmark';

// Header form auth: logo yang kembali ke beranda. Ajakan pindah ke halaman
// masuk/daftar ada di bawah form, bukan sebagai label kecil di atas judul.
export default function AuthHeader() {
  return (
    <Link href="/" aria-label="Kurspektif — beranda" className="inline-block leading-none text-ink">
      <Wordmark className="block h-5 w-auto sm:h-7" />
    </Link>
  );
}

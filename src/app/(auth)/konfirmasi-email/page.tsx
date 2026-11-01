import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import { primaryButtonClass } from '@/components/ui/styles';
import { confirmEmailChangeAction } from './actions';

export const metadata = { title: 'Konfirmasi email baru', robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; status?: string }> };

const titleClass = 'text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]';

const RESULT: Record<string, { title: string; body: string }> = {
  done: { title: 'Email diperbarui', body: 'Mulai sekarang kamu masuk dengan email baru ini. Alert dan ringkasan juga dikirim ke sana.' },
  expired: { title: 'Tautan kedaluwarsa', body: 'Tautan konfirmasi berlaku 1 jam. Minta tautan baru dari Profil di dashboard.' },
  taken: { title: 'Email sudah dipakai', body: 'Alamat itu sudah terdaftar di akun lain, jadi email akunmu tidak diubah.' },
  invalid: { title: 'Tautan tidak valid', body: 'Tautan ini rusak atau sudah dipakai. Minta tautan baru dari Profil di dashboard.' },
};

export default async function KonfirmasiEmailPage({ searchParams }: Props) {
  const { token = '', status } = await searchParams;
  const result = status ? (RESULT[status] ?? RESULT.invalid) : token ? null : RESULT.invalid;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <AuthHeader />
        <div className="mx-auto w-full max-w-md space-y-5">
          {result ? (
            <>
              <h1 className={titleClass}>{result.title}</h1>
              <p className="text-[17px] leading-relaxed">{result.body}</p>
              <Link href={status === 'done' ? '/login' : '/dashboard'} className={primaryButtonClass}>
                {status === 'done' ? 'Masuk' : 'Ke dashboard'}
              </Link>
            </>
          ) : (
            <>
              <h1 className={titleClass}>Konfirmasi email baru</h1>
              <p className="text-[17px] leading-relaxed">
                Klik tombol di bawah untuk memakai alamat ini sebagai email akun Kurspektif. Kalau kamu tidak meminta
                perubahan ini, tutup saja halaman ini.
              </p>
              <form action={confirmEmailChangeAction}>
                <input type="hidden" name="token" value={token} />
                <button type="submit" className={primaryButtonClass}>
                  Konfirmasi email ini
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

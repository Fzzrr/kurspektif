import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import { primaryButtonClass } from '@/components/ui/styles';
import { verifyEmailAction } from '../register/actions';

export const metadata = { title: 'Verifikasi email — Kurspektif', robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; status?: string }> };

const titleClass = 'text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]';

export default async function VerifikasiEmailPage({ searchParams }: Props) {
  const { token = '', status } = await searchParams;

  return (
    <AuthLayout>
      <div className="space-y-6">
        <AuthHeader />
        <div className="mx-auto w-full max-w-md space-y-5">
          {status === 'done' ? (
            <>
              <h1 className={titleClass}>Akun aktif</h1>
              <p className="text-[17px] leading-relaxed">Email kamu sudah terverifikasi. Silakan masuk.</p>
              <Link href="/login" className={primaryButtonClass}>
                Masuk
              </Link>
            </>
          ) : token && !status ? (
            <>
              <h1 className={titleClass}>Aktifkan akun</h1>
              <p className="text-[17px] leading-relaxed">
                Klik tombol di bawah untuk memastikan email ini milikmu. Kalau kamu tidak merasa mendaftar, tutup saja
                halaman ini.
              </p>
              <form action={verifyEmailAction}>
                <input type="hidden" name="token" value={token} />
                <button type="submit" className={primaryButtonClass}>
                  Aktifkan akun
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className={titleClass}>{status === 'expired' ? 'Tautan kedaluwarsa' : 'Tautan tidak valid'}</h1>
              <p className="text-[17px] leading-relaxed">
                {status === 'expired' ? 'Tautan verifikasi berlaku 24 jam.' : 'Tautan ini rusak atau sudah dipakai.'}{' '}
                <Link href="/register" className="underline underline-offset-4">
                  Daftar lagi
                </Link>{' '}
                dengan email yang sama untuk menerima tautan baru.
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

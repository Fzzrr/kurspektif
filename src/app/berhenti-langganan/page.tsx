import Link from 'next/link';
import PublicShell from '@/components/landing/PublicShell';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { unsubscribeAction } from './actions';

export const metadata = { title: 'Berhenti berlangganan — Kurspektif', robots: { index: false } };

type Props = { searchParams: Promise<{ u?: string; t?: string; status?: string }> };

const titleClass = 'text-balance text-[clamp(40px,6vw,88px)] font-black leading-[0.9] tracking-[-0.04em]';

export default async function BerhentiLanggananPage({ searchParams }: Props) {
  const { u = '', t = '', status } = await searchParams;
  const valid = status === undefined && verifyUnsubscribeToken(u, t);

  return (
    <PublicShell cta={false}>
      <div className="max-w-3xl">
        {status === 'done' ? (
          <>
            <h1 className={titleClass}>Langganan dihentikan</h1>
            <p className="mt-6 text-[17px] leading-relaxed">
              Kamu tidak akan menerima ringkasan mingguan lagi. Email alert kurs tetap dikirim untuk alert yang kamu
              pasang. Kalau berubah pikiran, aktifkan lagi di dashboard: Profil, lalu Ringkasan mingguan.
            </p>
          </>
        ) : valid ? (
          <>
            <h1 className={titleClass}>Berhenti menerima ringkasan mingguan?</h1>
            <p className="mt-6 text-[17px] leading-relaxed">
              Email tiap Senin pagi tentang pasangan yang kamu simpan tidak akan dikirim lagi. Alert kurs tidak
              terpengaruh.
            </p>
            <form action={unsubscribeAction} className="mt-10">
              <input type="hidden" name="u" value={u} />
              <input type="hidden" name="t" value={t} />
              <button type="submit" className="bg-ink px-6 py-3 text-[15px] font-medium text-paper hover:bg-muted">
                Ya, berhenti berlangganan
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className={titleClass}>Tautan tidak valid</h1>
            <p className="mt-6 text-[17px] leading-relaxed">
              Tautan ini rusak atau tidak lengkap. Kamu tetap bisa mematikan ringkasan mingguan di dashboard: Profil,
              lalu Ringkasan mingguan.{' '}
              <Link href="/login" className="underline underline-offset-4 hover:decoration-transparent">
                Masuk
              </Link>
            </p>
          </>
        )}
      </div>
    </PublicShell>
  );
}

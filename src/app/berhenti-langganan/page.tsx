import Link from 'next/link';
import PublicShell from '@/components/landing/PublicShell';
import { parseSubscription, verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { unsubscribeAction } from './actions';

export const metadata = { title: 'Berhenti berlangganan', robots: { index: false } };

type Props = { searchParams: Promise<{ u?: string; t?: string; k?: string; status?: string }> };

const titleClass = 'text-balance text-[clamp(40px,6vw,88px)] font-black leading-[0.9] tracking-[-0.04em]';

// Kalimat per jenis email; nama baris di Profil sama dengan judul toggle-nya.
const COPY = {
  ringkasan: {
    title: 'Berhenti menerima ringkasan mingguan?',
    what: 'Email tiap Senin pagi tentang pasangan yang kamu pantau tidak akan dikirim lagi.',
    done: 'Kamu tidak akan menerima ringkasan mingguan lagi.',
    row: 'Ringkasan mingguan',
  },
  gerak: {
    title: 'Berhenti menerima kabar pergerakan tajam?',
    what: 'Email saat pasangan di Pantauan bergerak 1% atau lebih dalam sehari tidak akan dikirim lagi.',
    done: 'Kamu tidak akan menerima kabar pergerakan tajam lagi.',
    row: 'Kabar pergerakan tajam',
  },
};

export default async function BerhentiLanggananPage({ searchParams }: Props) {
  const { u = '', t = '', k, status } = await searchParams;
  const kind = parseSubscription(k);
  const copy = COPY[kind];
  const valid = status === undefined && verifyUnsubscribeToken(u, t, undefined, kind);

  return (
    <PublicShell cta={false}>
      <div className="max-w-3xl">
        {status === 'done' ? (
          <>
            <h1 className={titleClass}>Langganan dihentikan</h1>
            <p className="mt-6 text-[17px] leading-relaxed">
              {copy.done} Email alert kurs tetap dikirim untuk alert yang kamu pasang. Kalau berubah pikiran, aktifkan
              lagi di dashboard: Profil, lalu {copy.row}.
            </p>
          </>
        ) : valid ? (
          <>
            <h1 className={titleClass}>{copy.title}</h1>
            <p className="mt-6 text-[17px] leading-relaxed">{copy.what} Alert kurs tidak terpengaruh.</p>
            <form action={unsubscribeAction} className="mt-10">
              <input type="hidden" name="u" value={u} />
              <input type="hidden" name="t" value={t} />
              <input type="hidden" name="k" value={kind} />
              <button type="submit" className="bg-ink px-6 py-3 text-[15px] font-medium text-paper hover:bg-muted">
                Ya, berhenti berlangganan
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className={titleClass}>Tautan tidak valid</h1>
            <p className="mt-6 text-[17px] leading-relaxed">
              Tautan ini rusak atau tidak lengkap. Kamu tetap bisa mematikannya di dashboard: Profil, lalu {copy.row}.{' '}
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

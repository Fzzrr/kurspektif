import type { ReactNode } from 'react';
import PublicShell from '@/components/landing/PublicShell';

// Kerangka halaman Syarat & Privasi: judul poster, tanggal pembaruan, lalu
// bagian-bagian dengan judul di kiri dan isi di kanan (seperti Metodologi).
type Props = { title: string; updated: string; intro: ReactNode; sections: { title: string; body: ReactNode }[] };

export default function LegalPage({ title, updated, intro, sections }: Props) {
  return (
    <PublicShell cta={false}>
      <h1 className="text-balance text-[clamp(44px,7vw,104px)] font-black leading-[0.9] tracking-[-0.04em]">{title}</h1>
      <p className="mt-5 text-[15px] text-muted">Terakhir diperbarui {updated}</p>
      <div className="mt-6 max-w-[62ch] text-[17px] leading-relaxed">{intro}</div>

      <div className="mt-20 space-y-14">
        {sections.map((section) => (
          <section key={section.title} className="grid gap-3 lg:grid-cols-12 lg:gap-6">
            <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.01em] lg:col-span-4">{section.title}</h2>
            <div className="max-w-[62ch] space-y-4 text-[17px] leading-relaxed lg:col-span-7 lg:col-start-6 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}

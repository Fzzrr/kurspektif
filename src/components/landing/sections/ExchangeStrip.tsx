import type { ReactNode } from "react";
import { costText, exchangeCost, formatAmount } from "@/lib/exchanges";
import { fmtAbsPct } from "@/lib/moversText";
import { formatRate } from "@/lib/rateStats";
import { isoToDate, shortDate } from "@/lib/timeAgo";
import Reveal from "../motion/Reveal";
import { heading, lead } from "../type";

// Catatan tukar diceritakan lewat empat fitur aslinya, berjajar sebagai empat
// langkah dalam satu bidang: form catat penukaran, kursmu dibanding kurs
// tengah, biaya per bulan, dan biaya per tempat. Kurs tengahnya asli (USD/IDR hari terakhir); catatan
// penukarannya contoh, dan tiap potongan bilang begitu. Biaya dihitung dengan
// exchangeCost yang sama dengan aplikasi.
const AMOUNT = 1000;
const STEPS = [
  "Kamu catat kurs yang kamu dapat.",
  "Kami ambil kurs tengah hari itu.",
  "Selisihnya terbaca sebagai biaya.",
  "Tempat termurahmu jadi kelihatan.",
];
// Selisih contoh terhadap kurs tengah: tiap catatan per bulan, dan tiap tempat.
const MONTHLY = [1.2, 0.9, 1.6, 0.85, 1.1, 0.85];
const PLACES = [
  { place: "Money changer", pct: 0.85 },
  { place: "Bank", pct: 1.6 },
  { place: "Kartu kredit", pct: 2.2 },
  { place: "Bandara", pct: 3.1 },
];
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" });

// Dibulatkan ke 5 rupiah seperti papan kurs money changer.
const round = (rate: number) => Math.round(rate / 5) * 5;

// Semua panel setinggi panel tertinggi; isi bawahnya didorong ke dasar (mt-auto).
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      data-ui
      className="flex h-full flex-col rounded-2xl bg-surface p-5 text-[14px] transition-[translate] duration-150 ease-snap group-hover:-translate-y-1.5"
    >
      <p className="mb-4 flex justify-between gap-3">
        <span className="font-semibold">{title}</span>
        <span className="text-muted">Contoh</span>
      </p>
      {children}
    </div>
  );
}

export default function ExchangeStrip({ midRate, midDate }: { midRate: number; midDate: string }) {
  const changer = round(midRate * 1.0085);
  const date = shortDate.format(isoToDate(midDate));
  const cost = (pct: number) => exchangeCost({ side: "beli", amount: AMOUNT, rate: midRate * (1 + pct / 100), midRate });

  // Enam bulan terakhir sampai bulan kurs tengah, satu catatan 1.000 USD per bulan.
  const end = isoToDate(midDate);
  const months = MONTHLY.map((pct, i) => {
    const month = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (MONTHLY.length - 1 - i), 1));
    return { label: monthFormatter.format(month), pct, total: cost(pct).total };
  });
  const peak = Math.max(...months.map((m) => m.total));
  const places = PLACES.map((p) => ({ ...p, total: cost(p.pct).total }));
  const worst = Math.max(...places.map((p) => p.pct));
  const saving = places[1].total - places[0].total;
  // Skala garis kurs tengah → kursmu: 0 sampai selisih terbesar.
  const spread = Math.max(...MONTHLY);

  const panels = [
    <Panel key="form" title="Catat penukaran">
      <div className="flex gap-1 rounded-xl bg-paper p-1 text-[14px]">
        <span className="flex-1 rounded-lg bg-ink py-1.5 text-center font-medium text-paper">Beli</span>
        <span className="flex-1 py-1.5 text-center text-muted">Jual</span>
      </div>
      <dl className="my-3 space-y-2">
        {[
          ["Jumlah", `${formatAmount(AMOUNT)} USD`],
          ["Kurs didapat", `${formatRate(changer)} IDR`],
          ["Tempat", "Money changer"],
          ["Tanggal", date],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 rounded-lg bg-paper px-3 py-2">
            <dt className="text-muted">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-auto rounded-lg bg-ink py-2.5 text-center font-semibold text-paper">Simpan catatan</p>
    </Panel>,

    <Panel key="mid" title="Kursmu vs kurs tengah">
      <ul className="space-y-3">
        {months.map((m) => (
          <li key={m.label} className="grid grid-cols-[2.5rem_1fr_3.5rem] items-center gap-3 tabular-nums">
            <span className="text-muted">{m.label}</span>
            <span aria-hidden className="relative h-3">
              <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
              <span className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-down" style={{ width: `${(m.pct / spread) * 100}%` }} />
              <span className="absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
              <span
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-down"
                style={{ left: `${(m.pct / spread) * 100}%` }}
              />
            </span>
            <span className="text-right">{fmtAbsPct(m.pct)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-ink" />
          Kurs tengah {formatRate(midRate)}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-down" />
          Kursmu
        </span>
      </p>
    </Panel>,

    <Panel key="month" title="Biaya per bulan">
      <div aria-hidden className="flex h-44 items-end gap-2">
        {months.map((m, i) => (
          <span key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={`w-full rounded-t-md ${i === months.length - 1 ? "bg-ink" : "bg-accent-soft"}`}
              style={{ height: `${(m.total / peak) * 150}px` }}
            />
            <span className="text-[12px] text-muted">{m.label}</span>
          </span>
        ))}
      </div>
      <p className="mt-auto flex items-baseline justify-between gap-3 pt-4">
        <span className="text-muted">Total 6 bulan</span>
        <span className="text-[17px] font-semibold tabular-nums">Rp {formatAmount(months.reduce((sum, m) => sum + m.total, 0))}</span>
      </p>
      <p className="mt-1 text-[13px] text-muted">
        Bulan ini Rp {formatAmount(months[months.length - 1].total)}, {costText(months[months.length - 1].pct)}.
      </p>
    </Panel>,

    <Panel key="place" title="Biaya per tempat">
      <ul className="mb-4 space-y-3">
        {places.map((p, i) => (
          <li key={p.place}>
            <p className="flex justify-between gap-3 tabular-nums">
              <span className={i === 0 ? "font-semibold" : ""}>{p.place}</span>
              <span className={i === 0 ? "font-semibold text-up" : "text-muted"}>{fmtAbsPct(p.pct)}</span>
            </p>
            <span aria-hidden className="mt-1.5 block h-2 rounded-full bg-accent-soft">
              <span className={`block h-full rounded-full ${i === 0 ? "bg-up" : "bg-muted"}`} style={{ width: `${(p.pct / worst) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto rounded-lg bg-up/15 px-3 py-2 leading-snug">
        Paling hemat: <span className="font-semibold">money changer</span>, Rp {formatAmount(saving)} lebih murah dari bank per{" "}
        {formatAmount(AMOUNT)} USD.
      </p>
    </Panel>,
  ];

  return (
    <section id="catatan" data-field className="scroll-mt-16 bg-paper px-5 pb-16 pt-28 text-ink sm:px-10 sm:pb-20 sm:pt-40">
      <Reveal className="grid gap-6 lg:grid-cols-12">
        <h2 className={`${heading} lg:col-span-5`}>Catatan tukar</h2>
        <p className={`max-w-[46ch] lg:col-span-6 lg:col-start-7 ${lead}`}>
          Simpan kurs yang kamu dapat di bank atau money changer. Kurspektif membandingkannya dengan kurs tengah hari itu,
          jadi biaya yang tersembunyi kelihatan.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <Reveal key={step} delay={i * 90} className="group flex flex-col gap-5">
            <p className="text-[20px] font-semibold leading-snug lg:min-h-[2.75em]">{step}</p>
            <div className="flex-1">{panels[i]}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

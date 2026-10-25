import type { Position as PositionData } from "@/lib/landing";
import { formatRate } from "@/lib/rateStats";
import Reveal from "../motion/Reveal";

// Total raksasa di kiri, "struk" yang menjumlahkannya di kanan: berapa hari
// dalam tiap bulan kurs USD/IDR lebih rendah dari hari ini. Baris-barisnya
// benar‑benar berjumlah sama dengan totalnya.
const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const day = (date: string) => dateFormatter.format(new Date(date));

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-4 py-1">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </li>
  );
}

export default function Position({ position }: { position: PositionData }) {
  return (
    <section className="grid gap-16 bg-surface px-5 py-28 sm:px-10 sm:py-40 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col justify-between gap-16 lg:col-span-6">
        <Reveal>
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Mahal atau murah?</h2>
          <p className="mt-4 max-w-[40ch] text-[17px] leading-relaxed">
            Kurs USD/IDR hari ini dibanding {position.total} hari kerja terakhir, dihitung ulang setiap hari.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-[clamp(120px,18vw,300px)] font-black leading-[0.8] tracking-[-0.05em] tabular-nums">
            {position.percentile}%
          </p>
          <p className="mt-5 max-w-[38ch] text-[17px]">
            hari dalam periode itu kursnya lebih rendah dari hari ini. Makin tinggi, makin mahal dolar saat ini.
          </p>
        </Reveal>
      </div>

      <Reveal delay={160} className="max-w-md lg:col-span-4 lg:col-start-8 lg:max-w-none">
        <div data-ui className="receipt bg-ink px-6 pb-12 pt-6 text-[14px] text-paper">
          <p className="font-semibold">Hari lebih rendah dari hari ini</p>
          <ul className="mt-2">
            {position.months.map((month) => (
              <Row key={month.label} label={month.label} value={`${month.lower} dari ${month.days}`} />
            ))}
          </ul>
          <p className="mt-5 font-semibold">Rentang {position.total} hari</p>
          <ul className="mt-2">
            <Row label={`Terendah, ${day(position.min.date)}`} value={formatRate(position.min.rate)} />
            <Row label={`Tertinggi, ${day(position.max.date)}`} value={formatRate(position.max.rate)} />
            <Row label="Rata-rata" value={formatRate(position.average)} />
          </ul>
          <p className="-mx-3 mt-5 flex justify-between bg-paper px-3 py-2 font-semibold text-ink">
            <span>Lebih rendah</span>
            <span className="tabular-nums">
              {position.lower} dari {position.total} = {position.percentile}%
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

import RateLineChart, { PLAIN_RATE_SERIES } from "../rate/RateLineChart";
import MoversMock from "../rate/MoversMock";
import Reveal from "../motion/Reveal";
import SectionHeading from "../ui/SectionHeading";

export default function DashboardPreview() {
  return (
    <section id="pratinjau" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <SectionHeading eyebrow="Pratinjau" title="Dashboard" />
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 overflow-hidden rounded-2xl transition-transform duration-500 hover:-translate-y-1">
          {/* Bar browser palsu */}
          <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="ml-2 min-w-0 flex-1 truncate font-mono text-xs text-muted">
              app.kurspektif.id/dashboard
            </span>
            <span className="ml-auto font-mono text-[9px] uppercase tracking-wide text-muted">
              Kurs harian
            </span>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono text-xs text-muted">USD → IDR</p>
              <p className="font-mono text-3xl font-medium">16.234</p>
              <RateLineChart data={PLAIN_RATE_SERIES} className="mt-3 w-full" showAverage />
            </div>

            <div className="rounded-xl bg-paper p-5">
              <MoversMock />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

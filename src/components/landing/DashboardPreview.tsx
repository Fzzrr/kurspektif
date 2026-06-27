import RateLineChart from "./RateLineChart";
import Reveal from "./Reveal";

export default function DashboardPreview() {
  return (
    <section id="pratinjau" className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Pratinjau
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Dashboard
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-36px_rgba(14,31,26,0.55)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_36px_80px_-40px_rgba(14,31,26,0.6)]">
        {/* Bar browser palsu */}
        <div className="flex items-center gap-2 border-b border-line bg-[#fcfbf8] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-2 font-mono text-xs text-muted">
            app.kurspektif.id/dashboard
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
            </span>
            Live
          </span>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-mono text-xs text-muted">USD → IDR</p>
            <p className="font-mono text-3xl font-medium">16.234</p>
            <RateLineChart className="mt-3 w-full" />
          </div>

          <div className="rounded-xl bg-paper p-5">
            <p className="text-sm font-medium">
              <span className="text-accent">✦</span> Yang menggerakkan minggu ini
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Rupiah cenderung melemah seiring ekspektasi The Fed menunda
              pemangkasan suku bunga, sementara data domestik relatif netral.
            </p>
          </div>
        </div>
        </div>
      </Reveal>
    </section>
  );
}

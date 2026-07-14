import Reveal from "../motion/Reveal";
import CtaLink from "../ui/CtaLink";
import { GlowBlob, SymbolBackdrop } from "../ui/decor";

export default function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Reveal>
        <div
          className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl px-6 py-10 text-paper sm:flex-row sm:items-center sm:px-10 sm:py-14"
          style={{ background: "linear-gradient(135deg, var(--color-ink), #13322a)" }}
        >
          <div aria-hidden className="shimmer-sweep pointer-events-none absolute inset-0" />
          <GlowBlob className="-right-10 -top-10 h-48 w-48" />
          <SymbolBackdrop className="text-[20vw] text-paper/[0.07] sm:text-[11rem]" />

          <h2 className="relative z-10 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Mulai pahami kursmu.
          </h2>
          <CtaLink href="/dashboard" variant="accent" className="relative z-10">
            Coba sekarang
          </CtaLink>
        </div>
      </Reveal>
    </section>
  );
}

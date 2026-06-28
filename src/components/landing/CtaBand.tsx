import Link from "next/link";
import Reveal from "./Reveal";
import { ArrowRight } from "../ui/icons";

export default function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Reveal>
        <div
          className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl px-6 py-10 text-paper sm:flex-row sm:items-center sm:px-10 sm:py-14"
          style={{ background: "linear-gradient(135deg, var(--color-ink), #13322a)" }}
        >
          {/* Sapuan shimmer + glow dekoratif */}
          <div aria-hidden className="shimmer-sweep pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="animate-glow pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
          />

          <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Mulai pahami kursmu.
          </h2>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-ink transition-all hover:shadow-[0_14px_30px_-10px_rgba(184,144,42,0.7)]"
          >
            Coba sekarang
            <ArrowRight className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

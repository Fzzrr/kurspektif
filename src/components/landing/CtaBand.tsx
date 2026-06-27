import Link from "next/link";

export default function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink px-10 py-14 text-paper sm:flex-row sm:items-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Mulai pahami kursmu.
        </h2>
        <Link
          href="/dashboard"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Coba sekarang →
        </Link>
      </div>
    </section>
  );
}

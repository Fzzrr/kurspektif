import Link from "next/link";
import RateCard from "./RateCard";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-2">
      {/* Kolom kiri — pesan utama */}
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Monitor kurs · konteks berita
        </p>

        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Bukan sekadar angka kurs — tapi{" "}
          <span className="text-accent">alasan</span> di baliknya.
        </h1>

        <p className="mt-5 max-w-md text-lg text-muted">
          Lacak nilai tukar untuk pasangan mata uang apa pun, lalu baca berita
          yang sudah ditandai sentimennya agar kamu paham kenapa kurs bergerak —
          bukan cuma seberapa.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Coba sekarang
          </Link>
          <Link
            href="#cara"
            className="rounded-xl border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-ink"
          >
            Lihat cara kerja
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-muted">
          Multi mata uang <span className="text-accent">·</span> Berita lokal &amp;
          global <span className="text-accent">·</span> Gratis
        </p>
      </div>

      {/* Kolom kanan — kartu signature */}
      <RateCard />
    </section>
  );
}

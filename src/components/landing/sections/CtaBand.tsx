import Link from "next/link";

// Seluruh band adalah satu tautan; kata kerjanya diset selebar halaman.
export default function CtaBand() {
  return (
    <section id="daftar">
      <Link
        href="/register"
        className="group flex min-h-[46svh] flex-col sm:min-h-[60svh] justify-between bg-ink px-5 pb-6 pt-6 text-paper transition-colors duration-200 hover:bg-paper hover:text-ink focus-visible:bg-paper focus-visible:text-ink sm:px-10"
      >
        <span className="flex items-start justify-between gap-6">
          <span className="max-w-[34ch] text-[20px] leading-snug">
            Gratis. Simpan pasanganmu, pasang alert, dan terima ringkasan tiap Senin pagi.
          </span>
          <svg
            aria-hidden
            viewBox="0 0 48 48"
            className="size-8 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:size-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path d="M12 36 36 12M16 12h20v20" />
          </svg>
        </span>
        <h2 className="text-[clamp(64px,23.4vw,460px)] font-black uppercase leading-[0.78] tracking-[-0.03em]">
          Daftar
        </h2>
      </Link>
    </section>
  );
}

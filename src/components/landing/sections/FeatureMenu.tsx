"use client";

// Menu "Fitur" di navbar publik: panel berisi tiap fitur dengan satu kalimat,
// masing-masing melompat ke babnya di landing (/#…, jadi bekerja juga dari
// /kurs atau /metodologi). Tertutup lewat klik di luar, Escape, atau memilih item.
import { useRef, useState } from "react";
import Link from "next/link";
import { useDismiss } from "@/lib/useDismiss";

export const FEATURES = [
  { label: "Cek kurs", text: "165 mata uang dan sisi mana yang menggerakkannya.", href: "/#coba" },
  { label: "Alert & Pantauan", text: "Email saat kurs menyentuh batasmu, ringkasan tiap Senin.", href: "/#pantauan" },
  { label: "Catatan tukar", text: "Biaya tersembunyi di bank dan money changer.", href: "/#catatan" },
  { label: "Berita", text: "Berita kurs yang sudah bertanda sentimen.", href: "/#berita" },
];

export default function FeatureMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useDismiss(root, open, close);

  return (
    <div ref={root} className="sm:relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="menu-fitur"
        className="flex items-center gap-1.5 opacity-80 hover:opacity-100 aria-expanded:opacity-100"
      >
        Fitur
        <svg aria-hidden viewBox="0 0 12 12" className={`size-3 transition-transform duration-200 ease-snap ${open ? "rotate-180" : ""}`}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          id="menu-fitur"
          data-ui
          className="menu-in absolute inset-x-3 top-[calc(100%+4px)] z-50 rounded-2xl bg-surface p-2 text-ink shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:right-0 sm:top-[calc(100%+20px)] sm:w-[520px]"
        >
          <ul className="grid gap-1 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature.href}>
                <Link href={feature.href} onClick={close} className="block rounded-xl p-3 hover:bg-accent-soft focus-visible:bg-accent-soft">
                  <span className="block text-[15px] font-semibold">{feature.label}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-muted">{feature.text}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/kurs"
            onClick={close}
            className="mt-1 flex items-center justify-between rounded-xl bg-paper px-3 py-3 text-[14px] font-medium hover:bg-accent-soft"
          >
            Lihat kurs semua pasangan hari ini
            <span aria-hidden>→</span>
          </Link>
          <Link href="/metodologi" onClick={close} className="block px-3 pb-1 pt-3 text-[14px] text-muted hover:text-ink">
            Cara kami menghitung
          </Link>
        </div>
      )}
    </div>
  );
}

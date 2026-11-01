"use client";

// Pencarian kurs di navbar publik: ketik pasangan apa pun ("JPY/IDR", "yen ke
// rupiah") lalu Enter untuk membuka halaman kursnya. Tanpa ketikan, muncul
// pasangan populer. Dibuka lewat klik atau ⌘K / Ctrl+K; Escape & klik di luar
// menutupnya.
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDismiss } from "@/lib/useDismiss";
import { parsePairQuery } from "@/lib/currencyNames";
import { currencyToFlag } from "@/lib/flags";
import { POPULAR_PAIRS, WORLD_PAIRS, pairToSlug } from "@/lib/pairs";

// Pasangan rupiah dan pasangan dunia berselang-seling, supaya saran tidak berat ke satu sisi.
const SUGGESTED = POPULAR_PAIRS.flatMap((pair, i) => [pair, WORLD_PAIRS[i]]).filter(Boolean);
const flags = (pair: string) => pair.split("/").map((code) => currencyToFlag(code) ?? "").join("");

export default function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    setText("");
  };
  useDismiss(root, open, close);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  const parsed = parsePairQuery(text);
  const typed = parsed?.join("/") ?? null;
  const query = text.trim().toUpperCase();
  const suggestions = [
    ...(typed ? [typed] : []),
    ...SUGGESTED.filter((pair) => pair !== typed && (!query || pair.includes(query.slice(0, 3)))),
  ].slice(0, 6);

  function submit(event: FormEvent) {
    event.preventDefault();
    const target = suggestions[0];
    if (!target) return;
    close();
    router.push(`/kurs/${pairToSlug(target)}`);
  }

  return (
    <div ref={root} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="cari-kurs"
        aria-label="Cari kurs"
        className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--nav-ink)_8%,transparent)] px-3 py-1.5 text-[13px] hover:bg-[color-mix(in_srgb,var(--nav-ink)_14%,transparent)]"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="hidden opacity-80 md:inline">Cari kurs</span>
        <kbd className="hidden rounded bg-[color-mix(in_srgb,var(--nav-ink)_10%,transparent)] px-1.5 font-sans text-[12px] opacity-70 xl:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          id="cari-kurs"
          data-ui
          className="menu-in absolute inset-x-3 top-[calc(100%+4px)] z-50 rounded-2xl bg-surface p-2 text-ink shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:left-0 sm:top-[calc(100%+20px)] sm:w-[380px]"
        >
          <form onSubmit={submit}>
            <input
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="JPY/IDR atau yen ke rupiah"
              aria-label="Pasangan mata uang"
              spellCheck={false}
              autoComplete="off"
              className="h-12 w-full rounded-xl bg-paper px-4 text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ink/40"
            />
          </form>
          <p className="px-3 pb-1 pt-3 text-[13px] text-muted">{typed ? "Buka halaman kurs" : "Pasangan populer"}</p>
          <ul>
            {suggestions.map((pair, i) => (
              <li key={pair}>
                <Link
                  href={`/kurs/${pairToSlug(pair)}`}
                  onClick={close}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] tabular-nums hover:bg-accent-soft ${
                    i === 0 && typed ? "bg-accent-soft font-semibold" : ""
                  }`}
                >
                  <span aria-hidden className="shrink-0 whitespace-nowrap">
                    {flags(pair)}
                  </span>
                  {pair}
                  {i === 0 && typed && <span className="ml-auto text-[13px] font-normal text-muted">Enter ↵</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

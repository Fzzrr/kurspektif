"use client";

// Satu hal yang bisa "dimainkan" di landing: judul section ini adalah kolom
// ketik. Tulis pasangan sebagai kode ("JPY/IDR"; nama seperti "yen ke rupiah" juga terbaca),
// jawabannya kurs hari ini, perubahan seminggu, dan sisi mana yang
// menggerakkannya — data asli. Pasangan contoh sudah dimuat server; pasangan
// lain diambil dari /api/rates + /api/movers. Tanpa JavaScript, jawaban
// untuk isian awal tetap tampil.
import { useEffect, useState } from "react";
import Link from "next/link";
import type { PairSnapshot } from "@/lib/landing";
import type { WeeklyMovers } from "@/lib/movers";
import { currencyLabel, parsePairQuery } from "@/lib/currencyNames";
import { explain, fmtPct, isMoving } from "@/lib/moversText";
import { formatRate } from "@/lib/rateStats";
import { pairToSlug } from "@/lib/pairs";
import { currencyToFlag } from "@/lib/flags";
import { isoToDate, shortDate } from "@/lib/timeAgo";
import Reveal from "../motion/Reveal";
import { heading, lead } from "../type";

type Answer = Pick<PairSnapshot, "pair" | "rate" | "date" | "weekPct" | "reason" | "movers">;
type Fetched = { key: string; answer: Answer | null };

const EXAMPLES = ["JPY/IDR", "EUR/USD", "MYR/IDR", "SGD/IDR"];
const flags = (codes: string[]) => codes.map((code) => currencyToFlag(code) ?? "").join("");
// Fakta data di balik kotak ini (lihat frankfurter.ts, movers.ts, timeAgo.ts).
const FACTS = [
  { value: "165", text: "mata uang, dipasangkan bebas" },
  { value: "6", text: "mata uang utama sebagai pembanding" },
  { value: "1999", text: "awal data kurs harian" },
];

async function fetchAnswer(base: string, quote: string): Promise<Answer | null> {
  const [rates, movers] = await Promise.all([
    fetch(`/api/rates?base=${base}&quote=${quote}&days=10`).then((res) => (res.ok ? res.json() : null)),
    fetch(`/api/movers?base=${base}&quote=${quote}`).then((res) => (res.ok ? (res.json() as Promise<WeeklyMovers | null>) : null)),
  ]);
  if (!rates?.latest) return null;
  return {
    pair: `${base}/${quote}`,
    rate: rates.latest.rate,
    date: rates.latest.date,
    weekPct: movers?.pairChangePct ?? null,
    reason: movers ? explain(movers) : null,
    movers,
  };
}

export default function PairLookup({ pairs, initial }: { pairs: PairSnapshot[]; initial: string }) {
  const [text, setText] = useState(initial);
  const [fetched, setFetched] = useState<Fetched | null>(null);
  const parsed = parsePairQuery(text);
  const key = parsed?.join("/") ?? null;
  const known = pairs.find((p) => p.pair === key && p.rate !== null);
  const needsFetch = key !== null && !known;

  useEffect(() => {
    if (!key || !needsFetch) return;
    const [base, quote] = key.split("/");
    let cancelled = false; // ketikan yang lebih baru menang
    const timer = setTimeout(() => {
      fetchAnswer(base, quote)
        .catch(() => null)
        .then((answer) => {
          if (!cancelled) setFetched({ key: `${base}/${quote}`, answer });
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, needsFetch]);

  const answer = known ?? (fetched?.key === key ? fetched.answer : undefined);
  const status = !key
    ? "Tulis dua kode mata uang, misalnya JPY/IDR."
    : answer === undefined
      ? "Memuat kurs…"
      : answer === null
        ? `Kurs ${key} tidak ditemukan. Coba kode tiga huruf, misalnya THB atau INR.`
        : null;

  return (
    <section
      id="coba"
      data-field
      className="grid scroll-mt-16 grid-cols-[minmax(0,1fr)] gap-12 bg-paper px-5 py-28 text-ink sm:px-10 sm:py-40 lg:grid-cols-12 lg:items-center lg:gap-6"
    >
      <Reveal className="lg:col-span-5">
        <h2 className={heading}>Cek kurs mata uang apa pun</h2>
        <p className={`mt-6 max-w-[36ch] ${lead}`}>
          Naik belum tentu menguat. Kami tunjukkan sisi mana yang sebenarnya bergerak minggu ini.
        </p>
        <dl className="mt-14 grid max-w-[560px] grid-cols-3 gap-6">
          {FACTS.map((fact) => (
            <div key={fact.value} className="flex flex-col-reverse justify-end gap-2">
              <dd className="text-[14px] leading-snug text-ink/80 sm:text-[17px]">{fact.text}</dd>
              <dt className={`${heading} tabular-nums`}>{fact.value}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
        <div data-ui className="rounded-2xl bg-surface p-3 lg:max-w-[600px]">
          {/* Kolom ketik: bendera kedua sisi di kiri, tombol balik arah di kanan. */}
          <div className="flex h-16 items-center gap-3 rounded-xl bg-paper pl-5 pr-3 focus-within:ring-2 focus-within:ring-ink/40">
            <span aria-hidden className="w-12 shrink-0 text-[22px] leading-none">
              {parsed ? flags(parsed) : "🔍"}
            </span>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              aria-label="Pasangan mata uang, misalnya JPY/IDR"
              aria-describedby="coba-jawaban"
              spellCheck={false}
              autoComplete="off"
              placeholder="JPY/IDR"
              className="min-w-0 flex-1 bg-transparent text-[24px] font-semibold uppercase tabular-nums text-ink caret-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={() => parsed && setText(`${parsed[1]}/${parsed[0]}`)}
              disabled={!parsed}
              aria-label="Balik arah pasangan"
              title="Balik arah pasangan"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-[18px] hover:bg-accent-soft disabled:opacity-40"
            >
              ⇄
            </button>
          </div>
          <div role="group" aria-label="Contoh pasangan" className="flex flex-wrap gap-2 px-1 pt-3">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setText(example)}
                aria-pressed={key === example}
                className="flex min-h-9 items-center gap-2 rounded-lg bg-paper/50 px-3 text-[14px] font-medium tabular-nums text-ink/80 hover:bg-paper hover:text-ink aria-pressed:bg-ink aria-pressed:text-paper"
              >
                <span aria-hidden>{flags(example.split("/"))}</span>
                {example}
              </button>
            ))}
          </div>

          <div id="coba-jawaban" aria-live="polite" className="px-2 pb-3 pt-8">
            {status || !answer ? <p className="text-[15px] text-muted">{status}</p> : <AnswerCard key={answer.pair} answer={answer} />}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  const [base, quote] = answer.pair.split("/");
  const pct = answer.weekPct;
  return (
    <div className="swap-in">
      <p className="text-[14px] text-muted">Kurs hari ini</p>
      <p className="mt-1 text-[32px] font-semibold leading-tight tabular-nums">
        1 {base} = {formatRate(answer.rate ?? 0)} {quote}
      </p>
      {pct !== null && (
        <p className={`mt-1 text-[15px] tabular-nums ${tone(pct)}`}>
          {pct > 0 ? "▲" : pct < 0 ? "▼" : "•"} {fmtPct(pct)} dalam seminggu
        </p>
      )}

      {answer.movers && (
        <div className="mt-6 rounded-xl bg-paper/60 p-4">
          <p className="text-[14px] font-semibold">Siapa yang bergerak?</p>
          {answer.reason && <p className="mt-1 text-[15px] leading-relaxed">{answer.reason}</p>}
          <Sides movers={answer.movers} />
        </div>
      )}

      <p className="mt-5 flex flex-wrap justify-between gap-3 text-[14px] text-muted">
        <span>{answer.date ? `${shortDate.format(isoToDate(answer.date))}` : ""}</span>
        <Link href={`/kurs/${pairToSlug(answer.pair)}`} className="link-line font-medium text-ink">
          Grafik setahun
        </Link>
      </p>
    </div>
  );
}

const tone = (pct: number) => (!isMoving(pct) ? "text-muted" : pct > 0 ? "text-up" : "text-down");

// Dua batang dari garis tengah: kekuatan tiap sisi terhadap mata uang utama.
function Sides({ movers }: { movers: WeeklyMovers }) {
  const max = Math.max(...movers.sides.map((s) => Math.abs(s.strengthPct)), 0.2);
  return (
    <ul className="mt-4 space-y-2.5">
      {movers.sides.map(({ code, strengthPct }) => {
        const bar = !isMoving(strengthPct) ? "bg-neutral" : strengthPct > 0 ? "bg-up" : "bg-down";
        const width = `${(Math.abs(strengthPct) / max) * 50}%`;
        return (
          <li key={code} className="grid grid-cols-[minmax(0,9rem)_1fr_4rem] items-center gap-3 text-[14px] tabular-nums">
            <span className="truncate">{currencyLabel(code)}</span>
            <span aria-hidden className="relative h-2 bg-accent-soft">
              <span className="absolute -inset-y-1 left-1/2 w-px bg-muted" />
              <span
                className={`side-bar absolute inset-y-0 ${bar}`}
                style={strengthPct >= 0 ? { left: "50%", width, transformOrigin: "left" } : { right: "50%", width, transformOrigin: "right" }}
              />
            </span>
            <span className={`text-right ${tone(strengthPct)}`}>{fmtPct(strengthPct)}</span>
          </li>
        );
      })}
      <li aria-hidden className="grid grid-cols-[minmax(0,9rem)_1fr_4rem] gap-3 text-[13px] text-muted">
        <span />
      </li>
    </ul>
  );
}

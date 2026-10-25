// Kalender peristiwa ekonomi yang biasa menggerakkan kurs. Data statis dari
// jadwal resmi — tidak perlu API, karena jadwalnya terbit setahun sekali.
// Waktu sudah dikonversi ke WIB; tanpa jam = jam pengumuman tidak dipastikan.
//
// Sumber:
//   FOMC   https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm (14.00 ET)
//   ECB    https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html (14.15 CET)
//   CPI AS https://www.bls.gov/schedule/news_release/cpi.htm (08.30 ET)
//   RDG BI https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2730825.aspx
//
// ponytail: tabel manual — perbarui tiap akhir tahun. Jadwal RDG BI 2027
// belum terbit saat ini ditulis (Okt 2026); tambahkan begitu BI mengumumkannya.

type Kind = 'fomc' | 'ecb' | 'uscpi' | 'birdg';

const KINDS: Record<Kind, { currency: string; title: string; why: string }> = {
  fomc: {
    currency: 'USD',
    title: 'Keputusan suku bunga The Fed',
    why: 'Suku bunga AS memengaruhi arus modal ke dolar.',
  },
  ecb: {
    currency: 'EUR',
    title: 'Keputusan suku bunga ECB',
    why: 'Suku bunga zona euro memengaruhi nilai euro.',
  },
  uscpi: {
    currency: 'USD',
    title: 'Rilis inflasi AS (CPI)',
    why: 'Inflasi tinggi membuat The Fed cenderung menahan atau menaikkan suku bunga.',
  },
  birdg: {
    currency: 'IDR',
    title: 'Keputusan suku bunga Bank Indonesia (RDG)',
    why: 'BI Rate dan langkah stabilisasi BI langsung memengaruhi rupiah.',
  },
};

const EVENTS: [string, Kind][] = [
  ['2026-09-17T01:00', 'fomc'],
  ['2026-09-23', 'birdg'],
  ['2026-10-21', 'birdg'],
  ['2026-10-29T01:00', 'fomc'],
  ['2026-10-29T20:15', 'ecb'],
  ['2026-11-10T20:30', 'uscpi'],
  ['2026-11-18', 'birdg'],
  ['2026-12-10T02:00', 'fomc'],
  ['2026-12-10T20:30', 'uscpi'],
  ['2026-12-16', 'birdg'],
  ['2026-12-17T20:15', 'ecb'],
  ['2027-01-13T20:30', 'uscpi'],
  ['2027-01-28T02:00', 'fomc'],
  ['2027-02-04T20:15', 'ecb'],
  ['2027-02-11T20:30', 'uscpi'],
  ['2027-03-10T20:30', 'uscpi'],
  ['2027-03-18T01:00', 'fomc'],
  ['2027-03-18T20:15', 'ecb'],
  ['2027-04-13T19:30', 'uscpi'],
  ['2027-04-29T01:00', 'fomc'],
  ['2027-04-29T19:15', 'ecb'],
  ['2027-05-12T19:30', 'uscpi'],
  ['2027-06-10T01:00', 'fomc'],
  ['2027-06-10T19:15', 'ecb'],
  ['2027-06-10T19:30', 'uscpi'],
  ['2027-07-14T19:30', 'uscpi'],
  ['2027-07-22T19:15', 'ecb'],
  ['2027-07-29T01:00', 'fomc'],
  ['2027-08-11T19:30', 'uscpi'],
  ['2027-09-09T19:15', 'ecb'],
  ['2027-09-14T19:30', 'uscpi'],
  ['2027-09-16T01:00', 'fomc'],
  ['2027-10-14T19:30', 'uscpi'],
  ['2027-10-28T01:00', 'fomc'],
  ['2027-10-28T19:15', 'ecb'],
  ['2027-11-10T20:30', 'uscpi'],
  ['2027-12-09T02:00', 'fomc'],
  ['2027-12-10T20:30', 'uscpi'],
  ['2027-12-16T20:15', 'ecb'],
];

export type EconomicEvent = {
  /** Tanggal WIB, YYYY-MM-DD. */
  date: string;
  /** Jam WIB "HH.MM", atau null kalau jamnya tidak dipastikan. */
  time: string | null;
  currency: string;
  title: string;
  why: string;
};

const ALL: EconomicEvent[] = EVENTS.map(([at, kind]) => ({
  date: at.slice(0, 10),
  time: at.length > 10 ? at.slice(11).replace(':', '.') : null,
  ...KINDS[kind],
}));

function shiftDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Peristiwa yang menyangkut salah satu `currencies`, dari `from` (inklusif)
 * sampai `days` hari ke depan. Negatif = ke belakang (mis. -7 untuk minggu lalu).
 */
export function eventsFor(currencies: string[], from: string, days: number): EconomicEvent[] {
  const [start, end] = days >= 0 ? [from, shiftDays(from, days)] : [shiftDays(from, days), from];
  return ALL.filter((e) => currencies.includes(e.currency) && e.date >= start && e.date <= end);
}

/** Mata uang yang punya jadwal di kalender ini. */
export const CALENDAR_CURRENCIES = [...new Set(Object.values(KINDS).map((k) => k.currency))];

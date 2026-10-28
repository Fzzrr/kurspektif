import { CALENDAR_CURRENCIES, type EconomicEvent } from '@/lib/calendar';
import { dayLabel } from '@/lib/timeAgo';

type Props = { events: EconomicEvent[]; pairs: string[] };

// Agenda 7 hari ke depan yang menyangkut mata uang di Pantauan, dengan
// pasangan mana saja yang bisa ikut bergerak.
export default function WeekAgenda({ events, pairs }: Props) {
  return (
    <section className="rounded-2xl bg-surface p-5">
      <h2 className="text-sm font-medium">Agenda 7 hari ke depan</h2>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          {pairs.length === 0
            ? 'Agenda bank sentral muncul di sini setelah kamu memantau pasangan.'
            : 'Tidak ada jadwal bank sentral untuk mata uang di pantauanmu minggu ini.'}{' '}
          Jadwal tersedia untuk {CALENDAR_CURRENCIES.join(', ')}.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {events.map((event) => {
            const affected = pairs.filter((pair) => pair.split('/').includes(event.currency));
            return (
              <li key={`${event.date}-${event.title}`} className="py-3.5 last:pb-0">
                <p className="text-xs text-muted">
                  {dayLabel(event.date)}
                  {event.time && <span className="font-mono"> · {event.time} WIB</span>}
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-ink">{event.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{event.why}</p>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {affected.map((pair) => (
                    <span key={pair} className="bg-accent-soft px-2 py-0.5 font-mono text-xs text-ink">
                      {pair}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

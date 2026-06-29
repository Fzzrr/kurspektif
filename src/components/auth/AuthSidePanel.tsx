import RateCard from '../landing/rate/RateCard';
import type { ChartPoint } from '../landing/rate/RateLineChart';
import { authHeadingTextStyle } from '../ui/styles';

const features = [
  'Multi-currency — any pair you want',
  'Local & global news tagged with sentiment',
  'Alerts carry the reason, not just the number',
];

// Data ilustrasi EUR → IDR (30 hari terakhir) — volatil (naik turun) tetapi tren net naik.
const eurSeries: ChartPoint[] = [
  { day: 'H-30', rate: 17650 },
  { day: 'H-29', rate: 17680 },
  { day: 'H-28', rate: 17640 },
  { day: 'H-27', rate: 17700 },
  { day: 'H-26', rate: 17760 },
  { day: 'H-25', rate: 17720, sentiment: 'netral' },
  { day: 'H-24', rate: 17690 },
  { day: 'H-23', rate: 17740 },
  { day: 'H-22', rate: 17800 },
  { day: 'H-21', rate: 17770 },
  { day: 'H-20', rate: 17730 },
  { day: 'H-19', rate: 17780 },
  { day: 'H-18', rate: 17840, sentiment: 'positif' },
  { day: 'H-17', rate: 17810 },
  { day: 'H-16', rate: 17770 },
  { day: 'H-15', rate: 17820 },
  { day: 'H-14', rate: 17880 },
  { day: 'H-13', rate: 17850 },
  { day: 'H-12', rate: 17800 },
  { day: 'H-11', rate: 17860 },
  { day: 'H-10', rate: 17910 },
  { day: 'H-9', rate: 17870 },
  { day: 'H-8', rate: 17830 },
  { day: 'H-7', rate: 17880 },
  { day: 'H-6', rate: 17840, sentiment: 'negatif' },
  { day: 'H-5', rate: 17890 },
  { day: 'H-4', rate: 17930 },
  { day: 'H-3', rate: 17900 },
  { day: 'H-2', rate: 17940 },
  { day: 'H-1', rate: 17965 },
];

export default function AuthSidePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink p-6 text-paper lg:flex lg:flex-1 lg:flex-col lg:justify-center xl:px-20">
      {/* Glow dekoratif di pojok kanan atas */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="auth-zoom relative mx-auto max-h-full w-full max-w-lg overflow-y-auto overflow-x-hidden">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          ✦ The context behind the numbers
        </p>

        <h2
          className="mt-4 leading-none"
          aria-label="See why the rate moves — not just how much."
        >
          <svg
            viewBox="0 0 1230 345"
            className="block h-auto w-full"
            role="img"
            aria-hidden="true"
          >
            <text
              x="0"
              y="100"
              fill="var(--color-paper)"
              xmlSpace="preserve"
              style={authHeadingTextStyle}
            >
              <tspan x="0">
                See <tspan fill="var(--color-accent)">why</tspan> the rate
              </tspan>
              <tspan x="0" dy="105">moves — not just</tspan>
              <tspan x="0" dy="105">how much.</tspan>
            </text>
          </svg>
        </h2>

        <p className="mt-4 max-w-md text-paper/70">
          News tagged with sentiment, charts that carry context, and weekly
          summaries explained in plain language.
        </p>

        <RateCard
          className="mt-6"
          pair="EUR → IDR"
          rate="17.965"
          changePercent="1,2%"
          changeDir="up"
          historical="Lebih tinggi dari 71% (90 hari terakhir)"
          data={eurSeries}
        />

        {/* Checklist fitur */}
        <ul className="mt-6 space-y-2.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-paper/90">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-up/20 text-up">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
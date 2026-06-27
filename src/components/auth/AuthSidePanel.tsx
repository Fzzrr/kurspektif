import React from 'react';
// 1. Import komponen yang baru dibuat
import LiveCurrencyChart from '../charts/LiveCurrencyChart';

const features = [
  'Multi-currency — any pair you want',
  'Local & global news tagged with sentiment',
  'Alerts carry the reason, not just the number',
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
              style={{
                fontFamily: 'var(--font-bricolage), sans-serif',
                fontSize: '100px',
                fontWeight: 800,
                letterSpacing: '-2.5px',
              }}
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

        {/* 2. Panggil komponen grafik dinamis di sini */}
        <LiveCurrencyChart />

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
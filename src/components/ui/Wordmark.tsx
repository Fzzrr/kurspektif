// Logo teks "Kurspektif" sebagai SVG. Dipakai di header login & register.

export default function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 940 170" className={className} role="img" aria-hidden="true">
      <text
        x="0"
        y="134"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-bricolage), sans-serif',
          fontSize: '125px',
          fontWeight: 800,
          letterSpacing: '-6px',
        }}
      >
        Kurspektif
      </text>
      <circle cx="620" cy="124" r="10" fill="var(--color-accent)" />
    </svg>
  );
}

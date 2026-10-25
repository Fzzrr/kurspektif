// Logo teks "Kurspektif" sebagai SVG. Dipakai di header auth, sidebar, navbar, footer.

// `viewBox` bisa dipersempit ke batas hurufnya (mis. di footer, supaya wordmark
// membentang tepat selebar halaman).
export default function Wordmark({ className, viewBox = '0 0 940 170' }: { className?: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className={className} role="img" aria-hidden="true">
      <text
        x="0"
        y="134"
        fill="currentColor"
        style={{
          fontFamily: 'var(--font-display), sans-serif',
          fontSize: '125px',
          fontWeight: 800,
          letterSpacing: '-6px',
        }}
      >
        Kurspektif
      </text>
      <circle cx="605" cy="124" r="10" fill="var(--color-accent)" />
    </svg>
  );
}

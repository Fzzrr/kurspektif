// Elemen dekoratif landing page. Semuanya murni hiasan: aria-hidden dan
// tidak menangkap pointer, jadi tak pernah mengganggu pembaca layar/interaksi.

/** Titik "live" yang berdenyut — dipakai di badge status. `className` mengatur
 *  warnanya (mis. `bg-accent`, `bg-up`). */
export function PulseDot({ className = "bg-accent" }: { className?: string }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${className}`}
      />
      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${className}`}
      />
    </span>
  );
}

/** Bola cahaya emas yang berdenyut di sudut panel. `className` mengatur posisi
 *  & ukurannya (mis. `-right-12 -top-12 h-40 w-40`). */
export function GlowBlob({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-glow pointer-events-none absolute rounded-full bg-accent/20 blur-3xl ${className}`}
    />
  );
}

/** Simbol mata uang raksasa yang hanyut pelan sebagai latar editorial.
 *  `className` menentukan ukuran & warnanya (outline atau tinta samar). */
export function SymbolBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <span
        className={`animate-drift select-none whitespace-nowrap font-display font-bold leading-none ${className}`}
      >
        $ € ¥ £
      </span>
    </div>
  );
}

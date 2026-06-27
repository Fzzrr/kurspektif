// Pemisah horizontal dengan label di tengah (mis. "Atau").

export default function AuthDivider({ label = 'Or' }: { label?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-line" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-paper px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}

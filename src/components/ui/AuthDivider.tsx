// Pemisah antara form dan tombol login sosial — cukup kata, tanpa garis.
export default function AuthDivider({ label = 'atau' }: { label?: string }) {
  return <p className="text-center text-sm text-muted">{label}</p>;
}

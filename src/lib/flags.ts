// Kode ISO 4217 -> emoji bendera. Kebanyakan kode mata uang dibentuk dari
// [kode negara][huruf mata uang] (IDR = ID + Rupiah, SGD = SG + Dollar),
// jadi dua huruf pertamanya biasanya = kode negara ISO 3166-1 alpha-2.
// Emoji bendera dibuat dari dua "regional indicator symbol" Unicode yang
// berpadanan dengan huruf A-Z — bukan gambar/aset terpisah.
export function currencyToFlag(code: string): string | null {
  // Kode berawalan "X" (XAU, XDR, XAF, dst.) menurut ISO 4217 khusus untuk
  // mata uang non-negara (emas, SDR, dsb.) — tidak ada benderanya.
  if (code.startsWith('X')) return null;
  const countryCode = code.slice(0, 2).toUpperCase();
  const codePoints = [...countryCode].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

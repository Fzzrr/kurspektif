// Bagian bersama gambar Open Graph (app/opengraph-image.tsx, kurs/[pair]/opengraph-image.tsx).
// Warna sama dengan token di globals.css (gambar ini tidak bisa membaca CSS).
export const INK = '#f5f5f5';
export const MUTED = '#8a8a8a';
export const LINE = '#2a2a2a';
export const UP = '#22c55e';
export const DOWN = '#ef4444';

export const frame = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '64px 72px',
  background: '#0a0a0a',
  color: INK,
} as const;

export function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 40, letterSpacing: -1.5 }}>
      Kurspektif
      <div style={{ width: 9, height: 9, borderRadius: 9, background: '#ffffff', marginTop: 18 }} />
    </div>
  );
}

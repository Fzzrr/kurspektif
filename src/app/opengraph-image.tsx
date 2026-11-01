// Gambar pratinjau saat tautan Kurspektif dibagikan (WhatsApp, X, Slack, ...).
// Berlaku untuk semua halaman kecuali yang punya opengraph-image sendiri
// (halaman kurs per pasangan). Dibuat sekali saat build.
import { ImageResponse } from 'next/og';
import { Brand, INK, MUTED, frame } from '@/components/og';

export const alt = 'Kurspektif — pemantau kurs yang mengabarimu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ ...frame, justifyContent: 'space-between' }}>
        <Brand />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 84, lineHeight: 1.02, letterSpacing: -3, color: INK, maxWidth: 940 }}>
            Pemantau kurs yang mengabarimu
          </div>
          <div style={{ fontSize: 32, color: MUTED, maxWidth: 900 }}>
            Kurs harian 165 mata uang, siapa yang menggerakkannya, berita bertanda sentimen, dan alert lewat email.
          </div>
        </div>
      </div>
    ),
    size,
  );
}

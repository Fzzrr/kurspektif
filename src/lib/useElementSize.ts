'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Ukuran piksel sebuah elemen, diperbarui saat elemennya berubah ukuran. Untuk
 * grafik Recharts yang diberi width/height konkret (bukan ResponsiveContainer,
 * yang memberi warning width/height(-1) saat render pertama).
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width: size.width, height: size.height };
}

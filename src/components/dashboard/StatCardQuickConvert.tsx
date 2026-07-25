'use client';

// Kartu konversi cepat. `amount` adalah controlled input — nilainya selalu
// berasal dari state React, bukan dari DOM, jadi hasil konversi di bawahnya
// otomatis ikut berubah setiap ketikan tanpa kode tambahan.
import { useState } from 'react';
import DashboardCard from './DashboardCard';
import { inputClass } from '@/components/ui/styles';

type Props = {
  rate?: number;
  fromCode?: string;
  toCode?: string;
};

const formatIDR = (value: number) => new Intl.NumberFormat('id-ID').format(Math.round(value));

// Buang semua karakter selain digit ("1.000.000" -> 1000000) supaya titik
// pemisah ribuan ala id-ID tidak ikut dianggap bagian dari angka.
const parseAmount = (raw: string) => Number(raw.replace(/\D/g, '')) || 0;

export default function StatCardQuickConvert({ rate = 16234, fromCode = 'USD', toCode = 'IDR' }: Props) {
  const [amount, setAmount] = useState('1.000.000');

  // Dihitung ulang tiap render dari `amount` — bukan disimpan sebagai state
  // terpisah, supaya tidak ada dua sumber kebenaran yang bisa tidak sinkron.
  const result = parseAmount(amount) * rate;

  return (
    <DashboardCard>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Konversi cepat</p>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={`${inputClass} mt-0 flex-1`}
        />
        <span className="font-mono text-xs text-muted">{fromCode}</span>
      </div>
      <p className="mt-2 font-mono text-sm text-muted">
        ≈ {formatIDR(result)} {toCode}
      </p>
    </DashboardCard>
  );
}

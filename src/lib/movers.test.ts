import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWeek } from './movers';
import { explain } from './moversText';

const OTHERS = { EUR: 0.9, JPY: 150, GBP: 0.8, CNY: 7.2, SGD: 1.35, AUD: 1.5, CHF: 0.88 };

// Seminggu data per-USD: semua mata uang diam, hanya rupiah yang melemah 1%.
function week(idrStart: number, idrEnd: number) {
  const byDate = new Map<string, Record<string, number>>();
  for (let day = 1; day <= 9; day++) {
    const idr = day === 9 ? idrEnd : idrStart;
    byDate.set(`2026-10-${String(day).padStart(2, '0')}`, { ...OTHERS, IDR: idr });
  }
  return byDate;
}

test('rupiah melemah: USD/IDR naik dan penyebabnya sisi IDR', () => {
  const result = analyzeWeek(week(18000, 18180), 'USD', 'IDR');
  assert.ok(result);
  assert.ok(Math.abs(result.pairChangePct - 1) < 1e-9, `perubahan pasangan ${result.pairChangePct}`);
  const [usd, idr] = result.sides;
  assert.equal(usd.code, 'USD');
  assert.ok(Math.abs(usd.strengthPct) < 1e-9, 'dolar tidak bergerak terhadap keranjang');
  assert.ok(idr.strengthPct < -0.9, 'rupiah melemah terhadap keranjang');
  assert.equal(result.ranking.at(-1)?.code, 'IDR');
  assert.equal(explain(result), 'Pergerakan minggu ini terutama datang dari sisi IDR.');
});

test('pasangan yang diam disebut nyaris tidak berubah', () => {
  const result = analyzeWeek(week(18000, 18000), 'USD', 'IDR');
  assert.ok(result);
  assert.equal(explain(result), 'Pasangan ini nyaris tidak berubah minggu ini.');
});

test('data kurang dari seminggu tidak dianalisis', () => {
  const byDate = new Map([['2026-10-08', { ...OTHERS, IDR: 18000 }], ['2026-10-09', { ...OTHERS, IDR: 18100 }]]);
  assert.equal(analyzeWeek(byDate, 'USD', 'IDR'), null);
});

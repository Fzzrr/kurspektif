import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyChange, historicalPosition } from './rateStats';

const series = (...rates: number[]) => rates.map((rate, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, rate }));

test('dailyChange: naik, turun, dan 0% netral', () => {
  const up = series(18000, 18180);
  assert.equal(dailyChange(up, up[1]).changeDir, 'up');
  assert.equal(dailyChange(up, up[1]).changePercent, '1%');
  const down = series(18000, 17820);
  assert.equal(dailyChange(down, down[1]).changeDir, 'down');
  // perubahan sangat kecil yang tampil "0%" tidak diberi warna naik/turun
  const flat = series(18000, 18000.01);
  assert.equal(dailyChange(flat, flat[1]).changeDir, 'flat');
});

test('dailyChange tanpa data cukup', () => {
  assert.equal(dailyChange([], null).changeDir, undefined);
});

test('historicalPosition memakai 90 hari terakhir', () => {
  const rates = series(...Array.from({ length: 100 }, (_, i) => i + 1));
  const result = historicalPosition(rates, rates.at(-1)!);
  assert.equal(result.percentile, 99); // 89 dari 90 hari lebih rendah
  assert.equal(result.min, '11');
  assert.equal(result.max, '100');
});

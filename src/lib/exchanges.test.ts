import { test } from 'node:test';
import assert from 'node:assert/strict';
import { costByMonth, costText, exchangeCost, summarize, type ExchangeDTO } from './exchanges';
import { parseRateDate } from './timeAgo';

const record = (over: Partial<ExchangeDTO>): ExchangeDTO => ({
  id: 'x', side: 'beli', base: 'USD', quote: 'IDR', amount: 1000, rate: 18350, date: '2026-10-20',
  midRate: 18150, midDate: '2026-10-20', place: null, ...over,
});

test('membeli di atas kurs tengah = biaya positif', () => {
  const cost = exchangeCost(record({}));
  assert.equal(cost.total, 200_000);
  assert.ok(Math.abs(cost.pct - (200 / 18150) * 100) < 1e-9);
});

test('menjual di bawah kurs tengah juga biaya positif', () => {
  assert.equal(exchangeCost(record({ side: 'jual', rate: 18000 })).total, 150_000);
});

test('ringkasan menjumlah selisih per mata uang dan merata-rata kurs per pasangan', () => {
  const { byQuote, byPair } = summarize([
    record({}),
    record({ id: 'y', amount: 3000, rate: 18250 }),
    record({ id: 'z', side: 'jual', amount: 500, rate: 18000 }),
  ]);
  assert.equal(byQuote.length, 1);
  assert.equal(byQuote[0].count, 3);
  assert.equal(byQuote[0].cost, 200_000 + 300_000 + 75_000);
  assert.equal(byPair[0].bought, 4000);
  assert.equal(byPair[0].avgBuy, (1000 * 18350 + 3000 * 18250) / 4000);
  assert.equal(byPair[0].avgSell, 18000);
});

test('biaya per tempat: ejaan beda dihitung satu tempat, termurah lebih dulu', () => {
  const { byPlace } = summarize([
    record({ id: 'a', place: 'BCA', rate: 18350 }),
    record({ id: 'b', place: 'Bca', rate: 18250 }),
    record({ id: 'c', place: 'Wise', rate: 18160 }),
    record({ id: 'd', place: null }),
  ]);
  assert.deepEqual(byPlace.map((p) => [p.place, p.count]), [['Wise', 1], ['BCA', 2]]);
  assert.ok(Math.abs(byPlace[1].pct - (300 / 36300) * 100) < 1e-9);
});

test('hemat: selisih biaya total dengan biaya di tempat termurah', () => {
  const { saving } = summarize([
    record({ id: 'a', place: 'BCA', rate: 18350 }), // biaya 200.000 dari volume 18.150.000
    record({ id: 'b', place: 'Wise', rate: 18160 }), // biaya 10.000
  ]);
  assert.ok(saving);
  assert.equal(saving.place, 'Wise');
  const expected = 210_000 - (2 * 18_150_000 * (10 / 18150)) ;
  assert.ok(Math.abs(saving.amount - expected) < 1e-6);
  assert.equal(summarize([record({ place: 'BCA' })]).saving, null, 'satu tempat: tidak ada pembanding');
});

test('biaya per bulan mengisi bulan kosong dan melewati pergantian tahun', () => {
  const months = costByMonth(
    [record({ id: 'a', date: '2025-11-03' }), record({ id: 'b', date: '2026-01-15', rate: 18250 })],
    'IDR',
    '2026-02',
  );
  assert.deepEqual(months.map((m) => [m.month, m.count]), [['2025-11', 1], ['2025-12', 0], ['2026-01', 1], ['2026-02', 0]]);
  assert.equal(months[0].cost, 200_000);
  assert.equal(costByMonth([record({})], 'USD', '2026-10').length, 0);
  assert.equal(costByMonth([record({ date: '2024-01-01' })], 'IDR', '2026-10', 12).length, 12);
});

test('tanggal kurs harus nyata dan dalam rentang data', () => {
  assert.equal(parseRateDate('2025-01-01'), '2025-01-01');
  assert.equal(parseRateDate('2025-02-30'), null);
  assert.equal(parseRateDate('1998-12-31'), null);
  assert.equal(parseRateDate('2999-01-01'), null);
  assert.equal(parseRateDate('1-1-2025'), null);
});

test('costText tidak membuang tanda selisih', () => {
  assert.equal(costText(1.05), 'biaya 1,05%');
  assert.equal(costText(-0.88), 'untung 0,88%');
  assert.equal(costText(-0.88, true), '0,88% lebih baik dari kurs tengah');
  assert.equal(costText(0), 'setara kurs tengah');
});

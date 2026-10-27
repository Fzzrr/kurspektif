import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventsFor } from './calendar';

test('eventsFor menyaring mata uang dan jendela tanggal (inklusif)', () => {
  const idr = eventsFor(['IDR'], '2026-10-21', 0);
  assert.equal(idr.length, 1);
  assert.equal(idr[0].title, 'Keputusan suku bunga Bank Indonesia (RDG)');

  // FOMC 28 Okt ET = 29 Okt 01.00 WIB
  const usd = eventsFor(['USD'], '2026-10-29', 0);
  assert.deepEqual(usd.map((e) => e.time), ['01.00']);

  assert.equal(eventsFor(['CHF'], '2026-10-01', 60).length, 0);
  // BoJ tanpa jam pasti: tanggal saja
  assert.deepEqual(eventsFor(['JPY'], '2026-10-30', 0).map((e) => e.time), [null]);
});

test('jendela negatif melihat ke belakang', () => {
  const past = eventsFor(['IDR'], '2026-10-25', -7);
  assert.deepEqual(past.map((e) => e.date), ['2026-10-21']);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyMove, newSharpMove } from './moves';

const series = (prev: number, last: number) => [
  { date: '2026-10-27', rate: prev },
  { date: '2026-10-28', rate: last },
];

test('gerak harian dihitung dari dua hari kerja terakhir', () => {
  const move = dailyMove(series(18000, 18180));
  assert.ok(move);
  assert.equal(move.date, '2026-10-28');
  assert.ok(Math.abs(move.pct - 1) < 1e-9);
  assert.equal(dailyMove([{ date: '2026-10-28', rate: 1 }]), null);
});

test('hanya gerak >= 1% yang belum pernah dikabarkan', () => {
  assert.equal(newSharpMove(series(18000, 18100), null), null, '0,56% belum tajam');
  assert.ok(newSharpMove(series(18000, 17800), null), 'turun 1,1% tajam');
  assert.equal(newSharpMove(series(18000, 18180), '2026-10-28'), null, 'tanggal kurs yang sama sudah dikabarkan');
  assert.ok(newSharpMove(series(18000, 18180), '2026-10-27'), 'kurs baru setelah kabar sebelumnya');
});

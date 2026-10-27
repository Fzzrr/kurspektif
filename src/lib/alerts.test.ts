import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHit, parseThreshold, percentileOf } from './alerts';

test('parseThreshold membaca format angka Indonesia', () => {
  assert.equal(parseThreshold('16.500'), 16500);
  assert.equal(parseThreshold('0,000056'), 0.000056);
  assert.equal(parseThreshold(' 18.059,5 '), 18059.5);
  assert.equal(parseThreshold('0'), null);
  assert.equal(parseThreshold('abc'), null);
});

test('isHit untuk alert angka kurs', () => {
  assert.equal(isHit('atas', 18100, 18000, null), true);
  assert.equal(isHit('atas', 18000, 18000, null), true);
  assert.equal(isHit('atas', 17999, 18000, null), false);
  assert.equal(isHit('bawah', 17900, 18000, null), true);
  assert.equal(isHit('bawah', 18001, 18000, null), false);
});

test('isHit untuk alert posisi setahun', () => {
  // masuk 20% termurah: persentil 20 atau kurang
  assert.equal(isHit('murah', 0, 20, 20), true);
  assert.equal(isHit('murah', 0, 20, 21), false);
  // masuk 20% termahal: persentil 80 atau lebih
  assert.equal(isHit('mahal', 0, 20, 80), true);
  assert.equal(isHit('mahal', 0, 20, 79), false);
  // tanpa riwayat tidak pernah terpicu
  assert.equal(isHit('murah', 0, 20, null), false);
});

test('percentileOf menghitung persen hari yang lebih rendah', () => {
  const history = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(percentileOf(10, history), 90);
  assert.equal(percentileOf(1, history), 0);
  assert.equal(percentileOf(11, history), 100);
  assert.equal(percentileOf(5, []), 50);
});

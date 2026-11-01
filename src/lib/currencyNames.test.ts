import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePairQuery } from './currencyNames';

test('nama Indonesia dibaca sesuai urutan ketik', () => {
  assert.deepEqual(parsePairQuery('yen ke rupiah'), ['JPY', 'IDR']);
  assert.deepEqual(parsePairQuery('Rupiah ke euro'), ['IDR', 'EUR']);
});

test('nama panjang menang atas nama pendek', () => {
  assert.deepEqual(parsePairQuery('dolar singapura ke rupiah'), ['SGD', 'IDR']);
  assert.deepEqual(parsePairQuery('dolar ke ringgit'), ['USD', 'MYR']);
});

test('kode, dengan atau tanpa pemisah', () => {
  assert.deepEqual(parsePairQuery('USD/IDR'), ['USD', 'IDR']);
  assert.deepEqual(parsePairQuery('eur usd'), ['EUR', 'USD']);
  assert.deepEqual(parsePairQuery('gbpjpy'), ['GBP', 'JPY']);
  assert.deepEqual(parsePairQuery('won ke thb'), ['KRW', 'THB']);
});

test('kurang dari dua mata uang = null', () => {
  assert.equal(parsePairQuery('rupiah'), null);
  assert.equal(parsePairQuery('rupiah ke rupiah'), null);
  assert.equal(parsePairQuery(''), null);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unsubscribeToken, verifyUnsubscribeToken } from './unsubscribe';

const SECRET = 'rahasia-uji';

test('token yang dibuat server lolos verifikasi', () => {
  const token = unsubscribeToken('user-1', SECRET);
  assert.equal(verifyUnsubscribeToken('user-1', token, SECRET), true);
});

test('token tidak bisa dipakai untuk pengguna lain atau dengan secret lain', () => {
  const token = unsubscribeToken('user-1', SECRET);
  assert.equal(verifyUnsubscribeToken('user-2', token, SECRET), false);
  assert.equal(verifyUnsubscribeToken('user-1', token, 'secret-lain'), false);
  assert.equal(verifyUnsubscribeToken('user-1', 'asal', SECRET), false);
});

test('token satu jenis email tidak berlaku untuk jenis lain', () => {
  const digest = unsubscribeToken('user-1', SECRET);
  const moves = unsubscribeToken('user-1', SECRET, 'gerak');
  assert.notEqual(digest, moves);
  assert.equal(verifyUnsubscribeToken('user-1', moves, SECRET, 'gerak'), true);
  assert.equal(verifyUnsubscribeToken('user-1', moves, SECRET), false);
  assert.equal(verifyUnsubscribeToken('user-1', digest, SECRET, 'gerak'), false);
});

test('tanpa secret semua token ditolak', () => {
  assert.equal(verifyUnsubscribeToken('user-1', unsubscribeToken('user-1', ''), ''), false);
});

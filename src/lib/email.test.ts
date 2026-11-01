import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CreateBatchOptions, Resend } from 'resend';
import { sendAll } from './email';

const emails = (n: number): CreateBatchOptions =>
  Array.from({ length: n }, (_, i) => ({ from: 'a@contoh.id', to: `u${i}@contoh.id`, subject: 's', text: 't' }));

// Resend palsu: batch kedua gagal total, batch lain menolak alamat u1.
function fakeResend() {
  const calls: { size: number; key?: string }[] = [];
  const resend = {
    batch: {
      async send(chunk: CreateBatchOptions, options: { idempotencyKey?: string }) {
        calls.push({ size: chunk.length, key: options.idempotencyKey });
        if (calls.length === 2) return { data: null, error: { message: 'rate_limit', statusCode: 429, name: 'rate_limit_exceeded' } };
        const errors = chunk.flatMap((email, index) => (email.to === 'u1@contoh.id' ? [{ index, message: 'alamat ditolak' }] : []));
        return { data: { data: [], errors }, error: null };
      },
    },
  };
  return { resend: resend as unknown as Resend, calls };
}

test('sendAll memetakan kegagalan ke indeks email asal', async () => {
  const { resend, calls } = fakeResend();
  const failed = await sendAll(resend, emails(250), 'ringkasan/2026-11-02');

  assert.deepEqual(calls, [
    { size: 100, key: 'ringkasan/2026-11-02/0' },
    { size: 100, key: 'ringkasan/2026-11-02/100' },
    { size: 50, key: 'ringkasan/2026-11-02/200' },
  ]);
  assert.equal(failed.get(1), 'alamat ditolak');
  assert.equal(failed.size, 101); // u1 + seluruh batch kedua
  assert.ok(failed.has(100) && failed.has(199) && !failed.has(200));
});

test('sendAll tanpa email tidak memanggil Resend', async () => {
  const { resend, calls } = fakeResend();
  assert.equal((await sendAll(resend, [])).size, 0);
  assert.equal(calls.length, 0);
});

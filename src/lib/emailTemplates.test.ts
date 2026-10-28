import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alertEmail, digestEmail, emailChangeEmail } from './emailTemplates';

test('email alert memuat kondisi, kurs, dan posisi', () => {
  const email = alertEmail({
    pair: 'USD/IDR',
    condition: 'naik di atas 18.000 IDR',
    rate: 18147,
    date: '2026-10-28',
    dayPct: 0.14,
    yearPercentile: 92,
    yearHigh: false,
    yearLow: false,
    reason: 'Pergerakan minggu ini terutama datang dari sisi IDR.',
    pairUrl: 'https://contoh.id/dashboard?pair=USD-IDR',
    manageUrl: 'https://contoh.id/dashboard#alert',
  });
  assert.equal(email.subject, 'USD/IDR naik di atas 18.000 IDR — Kurspektif');
  assert.match(email.html, /18\.147/);
  assert.match(email.html, /Lebih tinggi dari 92% hari dalam setahun/);
  assert.match(email.text, /Perubahan sehari: \+0,14%/);
});

test('ringkasan meng-escape nama dan memilih pasangan paling bergerak untuk pratinjau', () => {
  const sides = [
    { code: 'USD', strengthPct: 0 },
    { code: 'IDR', strengthPct: -1 },
  ];
  const row = (pair: string, pct: number) => ({
    pair,
    rate: 100,
    date: '2026-10-24',
    movers: { pairChangePct: pct, sides, ranking: sides, volatileDay: null },
    reason: 'Alasan.',
    url: '#',
  });
  const email = digestEmail({
    name: '<b>Budi</b>',
    rows: [row('USD/IDR', 0.5), row('JPY/IDR', -1.2)],
    activeAlerts: 0,
    pantauanUrl: '#',
    unsubscribeUrl: '#',
  });
  assert.ok(!email.html.includes('<b>Budi</b>'));
  assert.match(email.html, /&lt;b&gt;Budi&lt;\/b&gt;/);
  assert.match(email.html, /JPY\/IDR bergerak paling jauh: -1,2%/);
  assert.match(email.html, /IDR melemah 1%/);
});

test('konfirmasi email menyebut email lama dan baru', () => {
  const email = emailChangeEmail({ link: 'https://contoh.id/x', oldEmail: 'lama@contoh.id', newEmail: 'baru@contoh.id' });
  assert.match(email.html, /lama@contoh\.id/);
  assert.match(email.html, /baru@contoh\.id/);
});

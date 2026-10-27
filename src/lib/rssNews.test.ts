import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFeed } from './rssNews';

const feed = (title: string, description = '') =>
  `<rss><item><title><![CDATA[${title}]]></title><link>https://www.contoh.co.id/a/${encodeURIComponent(title)}</link>` +
  `<pubDate>Sun, 25 Oct 2026 21:30:00 +0700</pubDate>` +
  `<description><![CDATA[<img src="https://img.x/a.jpg?w=1&amp;q=9"/> ${description}]]></description></item></rss>`;
const one = (title: string) => parseFeed(feed(title))[0];

test('artikel yang tidak menyebut rupiah dibuang', () => {
  assert.equal(parseFeed(feed('Harga emas naik hari ini')).length, 0);
});

test('sentimen dari kata kerja di dekat "rupiah"', () => {
  assert.equal(one('Rupiah menguat ke Rp16.100 per dolar AS').sentiment, 'positif');
  assert.equal(one('Rupiah ditutup melemah tajam').sentiment, 'negatif');
  assert.equal(one('Dolar menguat, rupiah melemah').sentiment, 'negatif');
  assert.equal(one('BI jaga stabilitas rupiah').sentiment, 'netral');
});

test('pasangan dari mata uang lawan yang disebut, atau IDR saja', () => {
  assert.equal(one('Rupiah menguat ke Rp16.100 per dolar AS').pair, 'USD/IDR');
  assert.equal(one('Rupiah melemah terhadap dolar Singapura').pair, 'SGD/IDR');
  assert.equal(one('Rupiah melemah terhadap yen').pair, 'JPY/IDR');
  assert.equal(one('BI jaga stabilitas rupiah').pair, 'IDR');
});

test('judul, gambar, sumber, dan tanggal diurai', () => {
  const item = one('Rupiah &amp; saham');
  assert.equal(item.headline, 'Rupiah & saham');
  assert.equal(item.image, 'https://img.x/a.jpg?w=1&q=9');
  assert.equal(item.source, 'contoh.co.id');
  assert.equal(item.publishedAt, '2026-10-25T14:30:00.000Z');
  assert.match(item.id, /^rss-[0-9a-f]{24}$/);
});

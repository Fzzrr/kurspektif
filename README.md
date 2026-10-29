# Kurspektif

Kurs dunia dan alasannya. Kurspektif menampilkan kurs harian 165 mata uang, lalu menjelaskan sisi mana yang
sebenarnya menggerakkan sebuah pasangan minggu ini, lengkap dengan berita yang ditandai sentimennya. Pengguna bisa
memantau pasangan, dikabari lewat email, dan mencatat penukaran uangnya sendiri untuk melihat berapa yang diambil
bank atau money changer.

Alat informasi dan edukasi, bukan nasihat keuangan. Kurs yang dipakai adalah kurs tengah referensi bank sentral,
bukan kurs jual/beli bank atau money changer.

## Fitur

### Kurs dan berita
- **Kurs pasangan apa pun.** 165 mata uang, grafik sampai setahun, konversi cepat, dan posisi kurs hari ini
  dibanding 90 hari kerja terakhir. Pemilih mata uang menampilkan bendera, kode, dan nama Indonesia; pencarian
  juga mencocokkan nama Inggris.
- **Penggerak mingguan.** Kekuatan tiap mata uang terhadap sekeranjang mata uang utama (USD, EUR, JPY, GBP, CNY,
  SGD), sehingga terlihat apakah USD/IDR naik karena dolar menguat atau rupiah melemah.
- **Kurs pada tanggal tertentu.** Halaman publik seperti `/kurs/usd-idr/2025-01-01` untuk tanggal mana pun sejak
  1999, dibanding kurs terbaru dan dengan tabel konversi. Pemilih tanggalnya ada di setiap halaman pasangan.
- **Berita bertanda sentimen.** Berita global dari Marketaux dan berita rupiah dari RSS CNBC Indonesia, Antara,
  dan CNN Indonesia, diarsipkan di database. Halaman Berita menyusunnya per hari, dengan ringkasan arah sentimen
  dan peringkat mata uang yang paling banyak dibahas, keduanya sekaligus menjadi filter.

### Pantauan dan email
- **Pantauan.** Simpan sampai 8 pasangan. Tiap pasangan menampilkan kurs, perubahan hari ini dan 7 hari, grafik
  mini 90 hari kerja yang bisa digeser untuk membaca kurs per hari, posisi kurs, penggerak minggu ini, dan
  alertnya. Urutkan menurut waktu disimpan, gerak terbesar, atau yang paling dekat titik terendah. Pasangan bisa
  ditambah langsung dengan pratinjau kursnya, dan pintasannya muncul di dashboard (tiga sekaligus, bisa digeser).
- **Alert ke email.** Saat kurs melewati batas tertentu, atau masuk 10/20/30% hari termurah atau termahal setahun.
  Dipasang dari kartu Alert di dashboard atau langsung dari tiap pasangan di Pantauan.
- **Kabar pergerakan tajam.** Email saat pasangan di Pantauan bergerak 1% atau lebih dari hari kerja sebelumnya,
  tanpa perlu memasang alert.
- **Ringkasan mingguan.** Email tiap Senin pagi berisi pergerakan 7 hari setiap pasangan di Pantauan, penjelasan
  penggeraknya, dan jumlah alert yang masih aktif.
- Setiap email punya versi HTML dan teks biasa. Ringkasan dan kabar pergerakan masing-masing bisa dimatikan di
  Profil atau lewat tautan berhenti berlangganan sekali klik.

### Catatan tukar
- Catat penukaran yang sudah dilakukan (beli/jual, jumlah, kurs yang didapat, tanggal, tempat). Kurs tengah di
  hari itu diambil otomatis, lalu selisihnya dihitung sebagai biaya yang diambil penukar uang.
- Ringkasan biaya total dan rata-rata, perbandingan biaya per tempat, dan perkiraan hemat kalau semua penukaran
  lewat tempat termurah.
- Grafik "kurs kamu vs kurs tengah" (titik per penukaran, garis selisih), grafik biaya per bulan, dan simulasi
  "kalau menukar lagi hari ini" untuk tiap tempat. Grafik, filter (periode, beli/jual, bulan, tempat), dan riwayat
  saling terhubung.
- Pratinjau perkiraan biaya sebelum menyimpan, hapus yang bisa dibatalkan, dan "Catat lagi" untuk mengulang
  penukaran yang sama.

### Akun
- Daftar dengan email + kata sandi (wajib verifikasi email) atau Google, lupa kata sandi, ganti email dengan
  verifikasi, foto profil, dan hapus akun.
- Menu akun menampilkan ringkasan jumlah pasangan di Pantauan dan alert aktif.

### Halaman publik
`/`, `/kurs`, `/kurs/usd-idr`, `/kurs/usd-idr/2025-01-01`, `/metodologi`, `/syarat`, dan `/privasi` bisa dibuka
tanpa login. Cara tiap angka dihitung dijelaskan di halaman `/metodologi`.

## Teknologi

| Bagian | Yang dipakai |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 dengan React Compiler, TypeScript |
| Tampilan | Tailwind CSS v4, Recharts, animasi CSS |
| Database | PostgreSQL (Supabase) lewat Prisma 7 dan `@prisma/adapter-pg` |
| Autentikasi | Auth.js (NextAuth v5): email + kata sandi (bcrypt) dan Google |
| Email | Resend |
| Data kurs | [Frankfurter](https://frankfurter.dev) (gratis, tanpa API key) |
| Berita | [Marketaux](https://www.marketaux.com) dan RSS media Indonesia |
| Jadwal | Vercel Cron |
| Test | `node:test` lewat `tsx` |

## Menjalankan secara lokal

Butuh Node.js 20.19 atau lebih baru dan database PostgreSQL (misalnya proyek Supabase gratis).

```bash
npm install                  # juga menjalankan `prisma generate`
cp .env.example .env         # lalu isi nilainya, lihat tabel di bawah
npx prisma migrate deploy    # membuat tabel di database
npm run dev                  # http://localhost:3000
```

Pakai database terpisah untuk pengembangan. Kalau `.env` menunjuk ke database produksi, menjalankan cron secara
manual akan mengirim email ke pengguna sungguhan.

### Variabel lingkungan

Penjelasan lengkap ada di [`.env.example`](.env.example).

| Variabel | Untuk | Wajib |
| --- | --- | --- |
| `DATABASE_URL` | Koneksi pooled untuk aplikasi (Supabase: port 6543) | Ya |
| `DIRECT_URL` | Koneksi langsung untuk migrasi Prisma (Supabase: port 5432) | Ya |
| `AUTH_SECRET` | Kunci sesi Auth.js dan tanda tangan tautan berhenti berlangganan, buat dengan `npx auth secret` | Ya |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Login dengan Google | Untuk login Google |
| `RESEND_API_KEY` | Mengirim email alert, kabar pergerakan, ringkasan, dan verifikasi | Untuk email |
| `RESEND_FROM_EMAIL` | Alamat pengirim dari domain terverifikasi di Resend | Untuk email ke siapa pun |
| `APP_URL` | Alamat aplikasi, dipakai di tautan email dan sitemap | Ya |
| `MARKETAUX_API_KEY` | Berita global dari Marketaux | Untuk berita global |
| `CRON_SECRET` | Melindungi endpoint cron | Untuk cron |

Tanpa `RESEND_FROM_EMAIL`, email dikirim dari `onboarding@resend.dev`, yang oleh Resend hanya diteruskan ke email
pemilik akun Resend dan sering masuk folder Spam. Untuk mengirim ke pengguna lain, verifikasi sebuah domain di
Resend lalu isi `RESEND_FROM_EMAIL` dengan alamat dari domain itu.

Untuk login Google lokal, daftarkan `http://localhost:3000/api/auth/callback/google` sebagai redirect URI di
Google Cloud Console.

### Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Pemeriksaan tipe |
| `npm test` | Test unit: alert, penggerak mingguan, gerak tajam, catatan tukar, parser RSS, template email, tautan berhenti berlangganan, dan statistik kurs |
| `node --import tsx --test src/lib/exchanges.test.ts` | Menjalankan satu berkas test |
| `npx prisma migrate deploy` | Menerapkan migrasi ke database |

## Tugas terjadwal

Didefinisikan di [`vercel.json`](vercel.json) dan dijalankan Vercel Cron dengan header
`Authorization: Bearer <CRON_SECRET>`. Paket Hobby Vercel hanya memberi dua cron, jadi tugas harian digabung.

| Endpoint | Jadwal | Fungsi |
| --- | --- | --- |
| `/api/cron/check-alerts` | Tiap hari 01.00 UTC (08.00 WIB) | Memperbarui arsip berita, mengecek alert dan mengirim email saat tercapai, dan mengabarkan pasangan Pantauan yang bergerak tajam |
| `/api/cron/weekly-digest` | Tiap Senin 00.00 UTC (07.00 WIB) | Mengirim ringkasan mingguan untuk pasangan di Pantauan |

Menjalankannya secara manual saat pengembangan:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/check-alerts
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/weekly-digest
```

Respons `check-alerts` berisi jumlah alert yang dicek, tercapai, dan gagal, plus bagian `moves` untuk kabar
pergerakan tajam. Alert atau kabar yang gagal terkirim tidak ditandai, jadi dicoba lagi keesokan harinya.

## Struktur folder

```
prisma/                    skema dan migrasi database
public/arsip/              foto arsip yang dipakai halaman publik
src/app/                   halaman dan route API (App Router)
  (auth)/                  masuk, daftar, verifikasi email, lupa dan atur ulang kata sandi
  dashboard/               beranda (kurs + alert), berita, pantauan, catatan, metodologi, dan server action-nya
  kurs/                    halaman kurs publik: daftar, per pasangan, dan per tanggal
  metodologi/, syarat/, privasi/, berhenti-langganan/
  api/                     kurs, penggerak mingguan, cron, berhenti langganan, verifikasi ganti email
src/components/            komponen UI per area: landing, dashboard (exchanges, watchlist, news, rate, ...), auth, ui
src/lib/                   logika tanpa UI: sumber data, perhitungan, email, autentikasi
src/generated/prisma/      Prisma Client hasil generate (tidak di-commit)
```

File yang paling sering disentuh:

- [`src/lib/frankfurter.ts`](src/lib/frankfurter.ts): mengambil kurs, termasuk banyak pasangan dalam satu request.
- [`src/lib/watchlist.ts`](src/lib/watchlist.ts): ringkasan kurs Pantauan, dipakai halaman dan email.
- [`src/lib/movers.ts`](src/lib/movers.ts) dan [`src/lib/moversText.ts`](src/lib/moversText.ts): penggerak
  mingguan dan kalimat penjelasnya.
- [`src/lib/moves.ts`](src/lib/moves.ts): deteksi pergerakan tajam.
- [`src/lib/exchanges.ts`](src/lib/exchanges.ts): perhitungan catatan tukar.
- [`src/lib/alerts.ts`](src/lib/alerts.ts): kondisi alert.
- [`src/lib/marketaux.ts`](src/lib/marketaux.ts) dan [`src/lib/rssNews.ts`](src/lib/rssNews.ts): berita dan
  arsipnya.
- [`src/lib/emailTemplates.ts`](src/lib/emailTemplates.ts) dan [`src/lib/unsubscribe.ts`](src/lib/unsubscribe.ts):
  isi semua email dan tautan berhenti berlangganan.
- [`src/app/api/cron/check-alerts/route.ts`](src/app/api/cron/check-alerts/route.ts): tugas harian.

## Batasan yang perlu diketahui

- Kurs referensi terbit sekali per hari kerja, jadi alert dan kabar pergerakan dicek sekali sehari dan pergerakan
  di tengah hari tidak terdeteksi.
- Ambang kabar pergerakan tajam tetap 1% per hari untuk semua pasangan (lihat [`src/lib/moves.ts`](src/lib/moves.ts)),
  jadi pasangan yang memang bergejolak bisa lebih sering memicunya.
- Biaya di Catatan tukar dihitung terhadap kurs tengah referensi, bukan kurs yang bisa ditransaksikan, jadi
  angkanya perkiraan: selisih yang diambil penukar uang ditambah pergerakan kurs di hari itu. Grafik penukaran
  menampilkan sampai 400 hari terakhir.
- Paket gratis Marketaux membatasi 3 artikel per request dan 100 request per hari. Arsip berita diperbarui oleh cron
  harian dan di latar belakang saat dashboard atau halaman berita dibuka.
- Sentimen berita RSS ditentukan dari kata kerja di dekat kata "rupiah" pada judul, sehingga bisa keliru.
- Pembatas percobaan login dan aksi masih disimpan di memori; untuk produksi di Vercel, ganti dengan Upstash Redis
  (lihat [`src/lib/rateLimit.ts`](src/lib/rateLimit.ts)).

## Kredit

- Kurs: [Frankfurter](https://frankfurter.dev).
- Berita: [Marketaux](https://www.marketaux.com), CNBC Indonesia, Antara, dan CNN Indonesia.
- Gambar arsip (semuanya domain publik):
  - [Gezicht op het Oude Stadhuis, de Wisselbank, ... op de Dam te Amsterdam](https://commons.wikimedia.org/w/index.php?curid=85275523),
    Rijksmuseum, CC0.
  - [A New Map of the Terraqueous Globe](https://commons.wikimedia.org/wiki/File:Antique_World_Map_of_Continents_and_Oceans_1700.png),
    Edward Wells dan Michael Burghers, 1700, domain publik.
  - [Money changer's box](https://www.metmuseum.org/art/collection/search/199839), The Metropolitan Museum of Art,
    CC0.
  - [Geldkist van de Amsterdamse Wisselbank](https://commons.wikimedia.org/w/index.php?curid=86835963), Amsterdam
    Museum, CC0.

  Semua gambar ditampilkan hitam-putih.

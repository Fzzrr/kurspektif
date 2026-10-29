# Kurspektif

Kurs dunia dan alasannya. Kurspektif menampilkan kurs harian 165 mata uang, lalu menjelaskan sisi mana yang
sebenarnya menggerakkan sebuah pasangan minggu ini, lengkap dengan berita yang ditandai sentimennya.

Alat informasi dan edukasi, bukan nasihat keuangan. Kurs yang dipakai adalah kurs tengah referensi bank sentral,
bukan kurs jual/beli bank atau money changer.

## Fitur

- **Kurs pasangan apa pun.** 165 mata uang, grafik sampai setahun, konversi cepat, dan posisi kurs hari ini
  dibanding 90 hari kerja terakhir.
- **Penggerak mingguan.** Kekuatan tiap mata uang terhadap sekeranjang mata uang utama (USD, EUR, JPY, GBP, CNY,
  SGD), sehingga terlihat apakah USD/IDR naik karena dolar menguat atau rupiah melemah.
- **Berita bertanda sentimen.** Berita global dari Marketaux dan berita rupiah dari RSS CNBC Indonesia, Antara,
  dan CNN Indonesia, diarsipkan di database.
- **Alert ke email.** Saat kurs melewati batas tertentu, atau masuk 10/20/30% hari termurah atau termahal setahun.
- **Pantauan dan ringkasan mingguan.** Simpan pasangan favorit, lihat semuanya di halaman Pantauan lengkap dengan
  posisi 90 hari dan alert per pasangan, dan terima email ringkasannya tiap Senin pagi. Email ringkasan punya tautan berhenti berlangganan sekali klik.
- **Kabar pergerakan tajam.** Email saat pasangan di Pantauan bergerak 1% atau lebih dari hari kerja sebelumnya,
  tanpa perlu memasang alert. Bisa dimatikan di Profil atau lewat tautan sekali klik di emailnya.
- **Catatan tukar.** Catat penukaran yang sudah dilakukan di bank atau money changer; Kurspektif membandingkannya
  dengan kurs tengah di hari yang sama dan menjumlahkan selisih (biaya) yang dibayar.
- **Akun.** Daftar dengan email atau Google, lupa kata sandi, ganti email dengan verifikasi, dan hapus akun.
- **Halaman publik.** `/kurs`, `/kurs/usd-idr`, `/kurs/usd-idr/2025-01-01` (kurs pada tanggal tertentu sejak
  1999), `/metodologi`, `/syarat`, dan `/privasi` bisa dibuka tanpa login.

Cara tiap angka dihitung dijelaskan di halaman `/metodologi`.

## Teknologi

| Bagian | Yang dipakai |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 dengan React Compiler, TypeScript |
| Tampilan | Tailwind CSS v4, Recharts, Framer Motion |
| Database | PostgreSQL (Supabase) lewat Prisma 7 dan `@prisma/adapter-pg` |
| Autentikasi | Auth.js (NextAuth v5): email + kata sandi (bcrypt) dan Google |
| Email | Resend |
| Data kurs | [Frankfurter](https://frankfurter.dev) (gratis, tanpa API key) |
| Berita | [Marketaux](https://www.marketaux.com) dan RSS media Indonesia |
| Jadwal | Vercel Cron |

## Menjalankan secara lokal

Butuh Node.js 20.19 atau lebih baru dan database PostgreSQL (misalnya proyek Supabase gratis).

```bash
npm install                  # juga menjalankan `prisma generate`
cp .env.example .env         # lalu isi nilainya, lihat tabel di bawah
npx prisma migrate deploy    # membuat tabel di database
npm run dev                  # http://localhost:3000
```

### Variabel lingkungan

Penjelasan lengkap ada di [`.env.example`](.env.example).

| Variabel | Untuk | Wajib |
| --- | --- | --- |
| `DATABASE_URL` | Koneksi pooled untuk aplikasi (Supabase: port 6543) | Ya |
| `DIRECT_URL` | Koneksi langsung untuk migrasi Prisma (Supabase: port 5432) | Ya |
| `AUTH_SECRET` | Kunci sesi Auth.js dan tanda tangan tautan berhenti berlangganan, buat dengan `npx auth secret` | Ya |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Login dengan Google | Untuk login Google |
| `RESEND_API_KEY` | Mengirim email alert, ringkasan, dan verifikasi | Untuk email |
| `RESEND_FROM_EMAIL` | Alamat pengirim dari domain terverifikasi di Resend | Untuk email ke siapa pun |
| `APP_URL` | Alamat aplikasi, dipakai di tautan email dan sitemap | Ya |
| `MARKETAUX_API_KEY` | Berita global dari Marketaux | Untuk berita global |
| `CRON_SECRET` | Melindungi endpoint cron | Untuk cron |

Tanpa `RESEND_FROM_EMAIL`, email dikirim dari `onboarding@resend.dev`, yang oleh Resend hanya diteruskan ke email
pemilik akun Resend. Untuk mengirim ke pengguna lain, verifikasi sebuah domain di Resend.

Untuk login Google lokal, daftarkan `http://localhost:3000/api/auth/callback/google` sebagai redirect URI di
Google Cloud Console.

### Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm test` | Test unit untuk alert, penggerak mingguan, gerak tajam, catatan tukar, parser RSS, template email, dan statistik kurs |
| `npx prisma migrate deploy` | Menerapkan migrasi ke database |

## Tugas terjadwal

Didefinisikan di [`vercel.json`](vercel.json) dan dijalankan Vercel Cron dengan header
`Authorization: Bearer <CRON_SECRET>`.

| Endpoint | Jadwal | Fungsi |
| --- | --- | --- |
| `/api/cron/check-alerts` | Tiap hari 01.00 UTC (08.00 WIB) | Mengecek alert dan mengirim email saat tercapai, mengabarkan pasangan Pantauan yang bergerak tajam, dan memperbarui arsip berita |
| `/api/cron/weekly-digest` | Tiap Senin 00.00 UTC (07.00 WIB) | Mengirim ringkasan mingguan untuk pasangan tersimpan |

Menjalankannya secara manual saat pengembangan:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/check-alerts
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/weekly-digest
```

## Struktur folder

```
prisma/                  skema dan migrasi database
public/arsip/            foto arsip yang dipakai halaman publik
src/app/                 halaman dan route API (App Router)
  (auth)/                masuk dan daftar
  dashboard/             dashboard setelah login, beserta server action-nya
  kurs/, metodologi/     halaman publik, juga syarat/, privasi/, berhenti-langganan/
  api/                   kurs, penggerak mingguan, cron, verifikasi email
src/components/          komponen UI per area: landing, dashboard, auth, ui
src/lib/                 logika tanpa UI: sumber data, perhitungan, autentikasi
```

File yang paling sering disentuh:

- [`src/lib/frankfurter.ts`](src/lib/frankfurter.ts): mengambil kurs.
- [`src/lib/movers.ts`](src/lib/movers.ts): menghitung penggerak mingguan.
- [`src/lib/marketaux.ts`](src/lib/marketaux.ts) dan [`src/lib/rssNews.ts`](src/lib/rssNews.ts): berita dan
  arsipnya.
- [`src/lib/alerts.ts`](src/lib/alerts.ts): kondisi alert.

## Batasan yang perlu diketahui

- Kurs referensi terbit sekali per hari kerja, jadi alert dicek sekali sehari dan pergerakan di tengah hari tidak
  terdeteksi.
- Ambang kabar pergerakan tajam tetap 1% per hari untuk semua pasangan (lihat [`src/lib/moves.ts`](src/lib/moves.ts)),
  jadi pasangan yang memang bergejolak bisa lebih sering memicunya.
- Paket gratis Marketaux membatasi 3 artikel per request dan 100 request per hari. Arsip berita diperbarui oleh cron
  harian dan di latar belakang saat dashboard atau halaman berita dibuka.
- Sentimen berita RSS ditentukan dari kata kerja di dekat kata "rupiah" pada judul, sehingga bisa keliru.
- Pembatas percobaan login masih disimpan di memori; untuk produksi di Vercel, ganti dengan Upstash Redis
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

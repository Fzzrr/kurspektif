# Kurspektif

Kurs rupiah dan alasannya. Kurspektif menampilkan kurs harian 165 mata uang, lalu menjelaskan sisi mana yang
sebenarnya menggerakkan sebuah pasangan minggu ini, lengkap dengan agenda bank sentral dan berita yang ditandai
sentimennya.

Alat informasi dan edukasi, bukan nasihat keuangan. Kurs yang dipakai adalah kurs tengah referensi bank sentral,
bukan kurs jual/beli bank atau money changer.

## Fitur

- **Kurs pasangan apa pun.** 165 mata uang, grafik sampai setahun, konversi cepat, dan posisi kurs hari ini
  dibanding 90 hari kerja terakhir.
- **Penggerak mingguan.** Kekuatan tiap mata uang terhadap sekeranjang mata uang utama (USD, EUR, JPY, GBP, CNY,
  SGD), sehingga terlihat apakah USD/IDR naik karena dolar menguat atau rupiah melemah.
- **Agenda ekonomi.** Jadwal keputusan BI, The Fed, dan ECB, serta rilis inflasi AS, dalam WIB.
- **Berita bertanda sentimen.** Berita global dari Marketaux dan berita rupiah dari RSS CNBC Indonesia, Antara,
  dan CNN Indonesia, diarsipkan di database.
- **Alert ke email.** Saat kurs melewati batas tertentu, atau masuk 10/20/30% hari termurah atau termahal setahun.
- **Watchlist dan ringkasan mingguan.** Simpan pasangan favorit dan terima email ringkasannya tiap Senin pagi.
- **Halaman publik.** `/kurs`, `/kurs/usd-idr`, dan `/metodologi` bisa dibuka tanpa login.

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
| `AUTH_SECRET` | Kunci sesi Auth.js, buat dengan `npx auth secret` | Ya |
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
| `npx prisma migrate deploy` | Menerapkan migrasi ke database |

## Tugas terjadwal

Didefinisikan di [`vercel.json`](vercel.json) dan dijalankan Vercel Cron dengan header
`Authorization: Bearer <CRON_SECRET>`.

| Endpoint | Jadwal | Fungsi |
| --- | --- | --- |
| `/api/cron/check-alerts` | Tiap hari 01.00 UTC (08.00 WIB) | Mengecek alert dan mengirim email saat tercapai |
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
  kurs/, metodologi/     halaman publik
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
- [`src/lib/calendar.ts`](src/lib/calendar.ts): agenda ekonomi. Jadwalnya diisi manual dari situs resmi tiap
  lembaga dan perlu diperbarui tiap akhir tahun.

## Batasan yang perlu diketahui

- Kurs referensi terbit sekali per hari kerja, jadi alert dicek sekali sehari dan pergerakan di tengah hari tidak
  terdeteksi.
- Paket gratis Marketaux membatasi 3 artikel per request dan 100 request per hari. Arsip berita diperbarui di latar
  belakang saat dashboard atau halaman berita dibuka.
- Sentimen berita RSS ditentukan dari kata kerja di dekat kata "rupiah" pada judul, sehingga bisa keliru.
- Pembatas percobaan login masih disimpan di memori; untuk produksi di Vercel, ganti dengan Upstash Redis
  (lihat [`src/lib/rateLimit.ts`](src/lib/rateLimit.ts)).

## Kredit

- Kurs: [Frankfurter](https://frankfurter.dev).
- Berita: [Marketaux](https://www.marketaux.com), CNBC Indonesia, Antara, dan CNN Indonesia.
- Jadwal agenda: [Federal Reserve](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm),
  [Bank Indonesia](https://www.bi.go.id), [ECB](https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html),
  dan [BLS](https://www.bls.gov/schedule/news_release/cpi.htm).
- Foto arsip dari Wikimedia Commons:
  - [Het gebouw van de Javasche Bank te Batavia](https://commons.wikimedia.org/w/index.php?curid=104603063), KITLV,
    CC BY 4.0.
  - [Kali Besar te Batavia, ter hoogte van de Javasche Bank](https://commons.wikimedia.org/w/index.php?curid=105711056),
    KITLV, CC BY 4.0.
  - [Biljetten uit de collectie van het Museum van het Bataviaasch Genootschap](https://commons.wikimedia.org/wiki/File:KITLV_A679_-_Biljetten_uit_de_collectie_van_het_Museum_van_het_Bataviaasch_Genootschap_voor_Kunsten_en_Wetenschappen_te_Batavia,_KITLV_89072.tiff),
    KITLV, CC BY 4.0.
  - [MDDS 06.0005 Oeang 10 Rupiah 01](https://commons.wikimedia.org/w/index.php?curid=104099493),
    Museumdaerah.deliserdang, CC BY-SA 4.0.

  Semua foto ditampilkan hitam-putih.

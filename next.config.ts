import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy. Semua skrip, gaya, font, dan fetch berasal dari
// situs sendiri; gambar berita datang dari domain media mana pun (https:),
// foto profil berupa data: URI. 'unsafe-inline' pada script dibutuhkan skrip
// hidrasi Next.js tanpa nonce; dev menambah 'unsafe-eval' dan WebSocket HMR.
// form-action memuat Google karena Chrome menerapkannya juga pada redirect
// setelah form "Masuk dengan Google" dikirim.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  // Tanpa upgrade-insecure-requests: di `next start` lokal (http) direktif itu
  // membelokkan aset ke https://localhost dan gagal. HTTPS di produksi sudah
  // dipaksa oleh HSTS di bawah dan redirect bawaan Vercel.
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Hanya berarti di HTTPS dengan domain sungguhan; browser mengabaikannya di http://localhost.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Halaman "Pasangan saya" berganti nama jadi "Pantauan".
  async redirects() {
    return [{ source: '/dashboard/pasangan-saya', destination: '/dashboard/pantauan', permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;

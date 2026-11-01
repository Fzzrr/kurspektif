import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  // Halaman cukup menulis namanya ("Pantauan"); template menambahkan merek.
  title: { default: "Kurspektif — Pahami kenapa kurs bergerak", template: "%s — Kurspektif" },
  description:
    "Pantau nilai tukar untuk pasangan mata uang apa pun, lalu baca berita yang sudah ditandai sentimennya agar kamu paham kenapa kurs bergerak.",
  // Gambarnya dari opengraph-image.tsx; judul & deskripsi ikut metadata tiap halaman.
  openGraph: { siteName: "Kurspektif", locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
      >
        {/* Tanpa JS, paksa konten reveal tetap terlihat (progressive enhancement). */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: ".reveal{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}

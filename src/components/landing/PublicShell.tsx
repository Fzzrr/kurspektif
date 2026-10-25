import type { ReactNode } from 'react';
import Navbar from './sections/Navbar';
import Footer from './sections/Footer';
import CtaBand from './sections/CtaBand';

// Kerangka halaman publik selain landing (kurs, metodologi): navbar, isi
// dengan margin yang sama seperti landing, band daftar, lalu footer.
export default function PublicShell({ children, cta = true }: { children: ReactNode; cta?: boolean }) {
  return (
    <>
      <Navbar />
      <main className="px-5 pb-28 pt-12 sm:px-10 sm:pb-40 sm:pt-20">{children}</main>
      {cta && <CtaBand />}
      <Footer />
    </>
  );
}

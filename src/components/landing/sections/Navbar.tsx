import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import ChapterHeader from "./ChapterHeader";
import FeatureMenu from "./FeatureMenu";
import FeatureTabs from "./FeatureTabs";
import NavSearch from "./NavSearch";

// Navbar halaman publik: wordmark + pencarian kurs (NavSearch, ⌘K),
// fitur sebagai tab yang menyala mengikuti bab yang dibaca (layar lebar) atau
// menu Fitur (layar sempit), tautan Kurs hari ini, dan satu tombol Masuk.
// Menempel di atas dan berganti warna mengikuti bab di bawahnya (ChapterHeader).
// Tanpa kaca/blur atau hamburger. Metodologi ada di menu Fitur dan footer.
export default function Navbar() {
  return (
    <ChapterHeader>
      <nav className="flex h-16 items-center justify-between gap-4 px-5 sm:px-10">
        <div className="flex items-center gap-5">
          <Link href="/" aria-label="Kurspektif — beranda" className="shrink-0">
            <Wordmark className="h-6 w-auto" />
          </Link>
          <NavSearch />
        </div>

        <FeatureTabs />

        <div className="flex items-center gap-5 text-[14px] sm:gap-8">
          <FeatureMenu />
          <Link href="/kurs" className="link-line hidden opacity-80 hover:opacity-100 sm:inline">
            Kurs hari ini
          </Link>
          <Link href="/login" className="press bg-(--nav-ink) px-4 py-2.5 font-medium text-(--nav-bg) hover:opacity-80">
            Masuk
          </Link>
        </div>
      </nav>
    </ChapterHeader>
  );
}

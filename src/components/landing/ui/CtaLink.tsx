// Tombol ajakan utama ("Coba sekarang") dengan panah yang maju saat hover.
// Satu sumber gaya untuk CTA di hero & pita penutup — dua varian warna:
// `ink` di atas latar terang, `accent` di atas latar gelap.

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";

const VARIANTS = {
  ink: "bg-ink text-paper hover:opacity-90 hover:shadow-[0_14px_30px_-12px_rgba(14,31,26,0.6)]",
  accent: "bg-accent text-ink hover:shadow-[0_14px_30px_-10px_rgba(184,144,42,0.7)]",
} as const;

type Props = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
};

export default function CtaLink({
  href,
  children,
  variant = "ink",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all ${VARIANTS[variant]} ${className}`}
    >
      {children}
      <ArrowRight className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

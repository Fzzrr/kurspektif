import type { ReactNode } from 'react';
import { authHeadingTextStyle } from '../ui/styles';

type AuthHeroHeadingProps = {
  /** Teks lengkap heading untuk pembaca layar (SVG di dalamnya hanya visual). */
  ariaLabel: string;
  /** Rangkaian <tspan> yang membentuk heading. */
  children: ReactNode;
  viewBox?: string;
};

// Heading hero halaman auth, dirender sebagai <svg><text> agar teks bisa
// diregangkan tepat selebar kolom (textLength). Dipakai LoginForm & RegisterForm.
export default function AuthHeroHeading({
  ariaLabel,
  children,
  viewBox = '0 15 1000 113',
}: AuthHeroHeadingProps) {
  return (
    <h2 className="leading-none" aria-label={ariaLabel}>
      <svg viewBox={viewBox} className="block h-auto w-full" role="img" aria-hidden="true">
        <text
          x="0"
          y="100"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          xmlSpace="preserve"
          style={authHeadingTextStyle}
        >
          {children}
        </text>
      </svg>
    </h2>
  );
}

// Kepala section landing page: eyebrow mono + judul display (+ paragraf lead).
// Disatukan agar tipografi antar-section tidak "drift" saat salah satu diubah.

import type { ReactNode } from "react";

type Props = {
  /** Label kecil di atas judul, mis. "Fitur". */
  eyebrow: string;
  title: string;
  /** Paragraf pengantar opsional di bawah judul. */
  lead?: ReactNode;
  align?: "left" | "center";
  /** `lg` membesarkan judul di desktop — untuk section bertekanan visual. */
  size?: "md" | "lg";
};

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  size = "md",
}: Props) {
  const centered = align === "center";

  return (
    <div className={centered ? "text-center" : undefined}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2
        className={`mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight ${
          size === "lg" ? "md:text-4xl" : ""
        } ${centered ? "mx-auto" : ""}`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 max-w-md text-muted ${centered ? "mx-auto" : ""}`}>
          {lead}
        </p>
      )}
    </div>
  );
}

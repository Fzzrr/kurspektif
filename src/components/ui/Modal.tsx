'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Nama dialog untuk pembaca layar; judul yang terlihat dirender oleh anak. */
  title: string;
  children: ReactNode;
};

// <dialog> + showModal() sudah mengurus Escape, focus trap, latar inert, top
// layer, dan mengembalikan fokus ke pemicu saat ditutup. Kunci scroll halaman
// ada di globals.css (html:has(dialog[open])).
export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      // Klik di latar (::backdrop) sampai ke <dialog> itu sendiri.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl bg-surface p-0 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] outline-none backdrop:bg-paper/60 backdrop:backdrop-blur-sm"
    >
      {/* Isi baru dipasang saat dibuka, supaya state form selalu mulai bersih. */}
      {open && children}
    </dialog>
  );
}

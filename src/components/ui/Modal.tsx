'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  /** Matikan untuk modal yang mengatur padding/layout-nya sendiri (mis. panel dua kolom). */
  padded?: boolean;
  children: ReactNode;
};

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const sizeClass: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, size = 'md', padded = true, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        // Saat `padded` mati, judul dirender oleh anak — pakai aria-label agar dialog tetap bernama.
        aria-labelledby={title && padded ? 'modal-title' : undefined}
        aria-label={title && !padded ? title : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full ${sizeClass[size]} ${
          padded ? 'overflow-y-auto p-6 sm:p-8' : 'overflow-hidden'
        } rounded-2xl bg-surface shadow-[0_24px_60px_-24px_rgba(14,31,26,0.45)] outline-none`}
      >
        {title && padded && (
          <h2 id="modal-title" className="mb-4 font-display text-lg font-semibold text-ink">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
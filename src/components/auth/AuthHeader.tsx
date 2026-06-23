import Wordmark from '../ui/Wordmark';

type AuthHeaderProps = {
  /** Teks ajakan, mis. "Belum punya akun?". */
  prompt: string;
  /** Label link, mis. "Daftar". */
  linkLabel: string;
  linkHref: string;
};

// Header form auth: logo di kiri, link berpindah halaman (login <-> register) di kanan.
export default function AuthHeader({ prompt, linkLabel, linkHref }: AuthHeaderProps) {
  return (
    <div className="flex items-baseline justify-between">
      <h1 className="leading-none text-ink" aria-label="Kurspektif">
        <Wordmark className="block h-5 w-auto sm:h-7" />
      </h1>
      <p className="text-sm text-muted">
        {prompt}{' '}
        <a href={linkHref} className="font-semibold text-accent hover:opacity-80">
          {linkLabel}
        </a>
      </p>
    </div>
  );
}

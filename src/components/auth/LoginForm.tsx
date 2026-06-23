'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AuthHeader from './AuthHeader';
import FormField from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import AuthDivider from '../ui/AuthDivider';
import SocialAuthButtons from './SocialAuthButtons';
import { primaryButtonClass } from '../ui/styles';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const data = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.get('email'),
      password: data.get('password'),
    });
    setPending(false);
    if (res?.error) {
      setError('Email atau password salah.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="font-mono space-y-6">
      <AuthHeader prompt="Belum punya akun?" linkLabel="Daftar" linkHref="/register" />

      {/* Konten utama (hero + form) — kolom lebih sempit & ter-center */}
      <div className="mx-auto w-full max-w-md space-y-5">
        {/* Hero text */}
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Selamat Datang Kembali
          </p>
          <h2 className="leading-none" aria-label="Masuk ke Kurspektif.">
            <svg
              viewBox="0 15 1000 113"
              className="block h-auto w-full"
              role="img"
              aria-hidden="true"
            >
              <text
                x="0"
                y="100"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
                xmlSpace="preserve"
                style={{
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontSize: '100px',
                  fontWeight: 800,
                  letterSpacing: '-2.5px',
                }}
              >
                <tspan fill="var(--color-ink)">Masuk ke </tspan>
                <tspan fill="var(--color-accent)">
                  Kurspektif<tspan fill="var(--color-ink)">.</tspan>
                </tspan>
              </text>
            </svg>
          </h2>
          <p className="text-[#888780] text-sm">
            Lanjutkan memantau kurs favoritmu dan baca rangkuman terbaru yang
            sudah menunggu.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="kamu@email.com"
            required
          />

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            labelAction={
              <a href="#" className="text-xs text-accent hover:underline">
                Lupa password?
              </a>
            }
          />

          {error && <p className="text-sm text-down">{error}</p>}

          <button type="submit" disabled={pending} className={`${primaryButtonClass} disabled:opacity-60`}>
            {pending ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />
      </div>
    </div>
  );
}

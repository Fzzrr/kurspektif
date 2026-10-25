'use client';

import { useState } from 'react';
import Link from 'next/link';
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
      setError('Email atau kata sandi salah.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="font-sans space-y-6">
      <AuthHeader />

      {/* Konten utama (hero + form) — kolom lebih sempit & ter-center */}
      <div className="mx-auto w-full max-w-md space-y-5">
        {/* Hero text */}
        <div className="space-y-2">
          <h1 className="text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]">
            Masuk ke Kurspektif
          </h1>
          <p className="pt-2 text-[17px] leading-relaxed">
            Lanjutkan memantau kurs rupiah dan alasan pergerakannya, serta alert yang sudah kamu pasang.
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
            label="Kata sandi"
          />

          {error && <p className="text-sm text-down">{error}</p>}

          <button type="submit" disabled={pending} className={`${primaryButtonClass} disabled:opacity-60`}>
            {pending ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />

        <p className="text-center text-[15px] text-muted">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-ink underline-offset-4 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

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
import { strengthOf, strengthBarColor } from '@/lib/passwordStrength';
import { registerUser } from '@/app/(auth)/register/actions';

export default function RegisterForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const score = strengthOf(password);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const formData = new FormData(e.currentTarget);

    // 1) Buat user di database lewat server action.
    const res = await registerUser(undefined, formData);
    if (res?.error) {
      setError(res.error);
      setPending(false);
      return;
    }

    // 2) Langsung login otomatis dengan kredensial yang sama.
    const login = await signIn('credentials', {
      redirect: false,
      email: String(formData.get('email')),
      password,
    });
    setPending(false);
    if (login?.error) {
      setError('Akun dibuat, tapi gagal login otomatis. Silakan masuk manual.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="font-mono space-y-4">
      <AuthHeader prompt="Sudah punya akun?" linkLabel="Masuk" linkHref="/login" />

      {/* Konten utama (hero + form) — kolom lebih sempit, ter-center, & diperkecil */}
      <div className="auth-zoom mx-auto w-full max-w-md space-y-4">
        {/* Hero text */}
        <div className="space-y-2">
          <p className="font-mono font-normal text-xs uppercase tracking-[0.18em] text-accent">
            Bergabung Gratis
          </p>
          <h2 className="leading-none" aria-label="Mulai pahami kursmu.">
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
                <tspan fill="var(--color-ink)">Mulai pahami </tspan>
                <tspan fill="var(--color-accent)">
                  kursmu<tspan fill="var(--color-ink)">.</tspan>
                </tspan>
              </text>
            </svg>
          </h2>
          <p className="text-[#888780] font-text">
            Buat akun untuk menyimpan pasangan favorit, mengatur alert, dan
            menerima rangkuman mingguan.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="name"
            name="name"
            type="text"
            label="Nama Lengkap"
            placeholder="Ardi Rahmadan"
            required
          />

          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="username@email.com"
            required
          />

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              value={password}
              onChange={setPassword}
            />

            {/* Indikator kekuatan password */}
            <div className="mt-3 mb-3 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{ backgroundColor: strengthBarColor(i, score) }}
                />
              ))}
            </div>
            <p className="mt-2 mb-5 text-xs text-muted">
              Cukup kuat · gunakan 8+ karakter, kombinasi huruf &amp; angka.
            </p>
          </div>

          {/* Persetujuan */}
          <p className="text-center text-xs text-muted">
            Saya setuju dengan{' '}
            <a href="#" className="text-accent hover:underline">
              Syarat Layanan
            </a>{' '}
            dan{' '}
            <a href="#" className="text-accent hover:underline">
              Kebijakan Privasi
            </a>
            .
          </p>

          {error && <p className="text-center text-sm text-down">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className={`${primaryButtonClass} disabled:opacity-60`}
          >
            {pending ? 'Memproses…' : 'Buat akun'}
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />
      </div>
    </div>
  );
}

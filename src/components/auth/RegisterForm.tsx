'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthHeader from './AuthHeader';
import FormField from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import AuthDivider from '../ui/AuthDivider';
import SocialAuthButtons from './SocialAuthButtons';
import { primaryButtonClass } from '../ui/styles';
import {
  strengthOf,
  strengthBarColor,
  strengthColor,
  strengthLabel,
  strengthHint,
} from '@/lib/passwordStrength';
import { registerUser } from '@/app/(auth)/register/actions';

export default function RegisterForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [pending, setPending] = useState(false);
  const score = strengthOf(password);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const formData = new FormData(e.currentTarget);

    // Akun baru belum bisa dipakai masuk sampai emailnya diverifikasi.
    const res = await registerUser(undefined, formData);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSentTo(res?.sentTo ?? '');
  }

  if (sentTo) {
    return (
      <div className="font-sans space-y-4">
        <AuthHeader />
        <div className="auth-zoom mx-auto w-full max-w-md space-y-4">
          <h1 className="text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]">Cek email kamu</h1>
          <p className="pt-2 text-[17px] leading-relaxed">
            Kami mengirim tautan aktivasi ke <strong>{sentTo}</strong>. Klik tautannya untuk mengaktifkan akun, lalu
            masuk. Tidak ada di inbox? Cek folder spam.
          </p>
          <p className="text-[15px] leading-relaxed text-muted">
            Kalau email ini sudah punya akun, kamu tidak akan menerima apa-apa:{' '}
            <Link href="/login" className="text-ink underline underline-offset-4">
              masuk
            </Link>{' '}
            saja, atau pakai{' '}
            <Link href="/lupa-kata-sandi" className="text-ink underline underline-offset-4">
              Lupa kata sandi
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans space-y-4">
      <AuthHeader />

      {/* Konten utama (hero + form) — kolom lebih sempit, ter-center, & diperkecil */}
      <div className="auth-zoom mx-auto w-full max-w-md space-y-4">
        {/* Hero text */}
        <div className="space-y-2">
          <h1 className="text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]">
            Daftar gratis
          </h1>
          <p className="pt-2 text-[17px] leading-relaxed">
            Buat akun untuk menyimpan pasangan favorit, memasang alert, dan
            menerima ringkasan mingguan lewat email.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="name"
            name="name"
            type="text"
            label="Nama lengkap"
            placeholder="Nama kamu"
            required
          />

          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="kamu@email.com"
            required
          />

          <div>
            <PasswordInput
              id="password"
              name="password"
              label="Kata sandi"
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
            {password ? (
              <p className="mt-2 mb-5 text-xs">
                <span style={{ color: strengthColor(score) }}>
                  {strengthLabel(score)}
                </span>
                <span className="text-muted"> · {strengthHint(password)}</span>
              </p>
            ) : (
              <p className="mt-2 mb-5 text-xs text-muted">
                Minimal 8 karakter, campurkan huruf besar &amp; kecil, angka,
                dan simbol.
              </p>
            )}
          </div>

          <p className="text-center text-sm text-muted">
            Dengan mendaftar, kamu menyetujui{' '}
            <Link href="/syarat" className="text-ink underline underline-offset-4">
              Syarat &amp; Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privasi" className="text-ink underline underline-offset-4">
              Kebijakan Privasi
            </Link>
            .
          </p>

          {error && <p className="text-center text-sm text-down">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className= {`${primaryButtonClass} disabled:opacity-60`}
          >
            {pending ? 'Memproses…' : 'Buat akun'}
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />

        <p className="text-center text-[15px] text-muted">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

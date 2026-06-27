'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AuthHeader from './AuthHeader';
import FormField from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import AuthDivider from '../ui/AuthDivider';
import SocialAuthButtons from './SocialAuthButtons';
import { primaryButtonClass, authHeadingTextStyle } from '../ui/styles';
import {
  strengthOf,
  strengthBarColor,
  strengthColor,
  strengthLabel,
  strengthHint,
} from '@/lib/passwordStrength';
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
      setError('Account created, but automatic sign-in failed. Please sign in manually.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="font-sans space-y-4">
      <AuthHeader prompt="Already have an account?" linkLabel="Sign in" linkHref="/login" />

      {/* Konten utama (hero + form) — kolom lebih sempit, ter-center, & diperkecil */}
      <div className="auth-zoom mx-auto w-full max-w-md space-y-4">
        {/* Hero text */}
        <div className="space-y-2">
          <p className="font-mono font-normal text-xs uppercase tracking-[0.18em] text-accent">
            Join for Free
          </p>
          <h2 className="leading-none" aria-label="Understand your rates.">
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
                style={authHeadingTextStyle}
              >
                <tspan fill="var(--color-ink)">Understand </tspan>
                <tspan fill="var(--color-accent)">
                  your rates<tspan fill="var(--color-ink)">.</tspan>
                </tspan>
              </text>
            </svg>
          </h2>
          <p className="text-[#888780]">
            Create an account to save favorite pairs, set alerts, and receive
            weekly summaries.
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <FormField
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
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
            {password ? (
              <p className="mt-2 mb-5 text-xs">
                <span style={{ color: strengthColor(score) }}>
                  {strengthLabel(score)}
                </span>
                <span className="text-muted"> · {strengthHint(password)}</span>
              </p>
            ) : (
              <p className="mt-2 mb-5 text-xs text-muted">
                Use 8+ characters with a mix of uppercase &amp; lowercase
                letters, numbers, and symbols.
              </p>
            )}
          </div>

          {/* Persetujuan */}
          <p className="text-center text-xs text-muted">
            I agree to the{' '}
            <a href="#" className="text-accent hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-accent hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          {error && <p className="text-center text-sm text-down">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className= {`${primaryButtonClass} disabled:opacity-60`}
          >
            {pending ? 'Processing…' : 'Create account'}
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />
      </div>
    </div>
  );
}

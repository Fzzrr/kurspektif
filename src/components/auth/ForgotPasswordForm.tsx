'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import AuthHeader from './AuthHeader';
import FormField from '../ui/FormField';
import { primaryButtonClass } from '../ui/styles';
import { requestPasswordResetAction } from '@/app/(auth)/password-actions';

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);

  return (
    <div className="space-y-6">
      <AuthHeader />
      <div className="mx-auto w-full max-w-md space-y-5">
        <div className="space-y-2">
          <h1 className="text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]">
            Lupa kata sandi
          </h1>
          <p className="pt-2 text-[17px] leading-relaxed">
            Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.
          </p>
        </div>

        {state?.message ? (
          <p className="bg-surface px-4 py-3 text-[15px] leading-relaxed">{state.message}</p>
        ) : (
          <form action={action} className="space-y-3">
            <FormField id="email" name="email" type="email" label="Email" placeholder="kamu@email.com" required />
            {state?.error && <p className="text-sm text-down">{state.error}</p>}
            <button type="submit" disabled={pending} className={`${primaryButtonClass} disabled:opacity-60`}>
              {pending ? 'Mengirim…' : 'Kirim tautan'}
            </button>
          </form>
        )}

        <p className="text-center text-[15px] text-muted">
          Ingat kata sandimu?{' '}
          <Link href="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

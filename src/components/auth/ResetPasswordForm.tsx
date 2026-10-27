'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import AuthHeader from './AuthHeader';
import PasswordInput from '../ui/PasswordInput';
import { primaryButtonClass } from '../ui/styles';
import { resetPasswordAction } from '@/app/(auth)/password-actions';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <div className="space-y-6">
      <AuthHeader />
      <div className="mx-auto w-full max-w-md space-y-5">
        <h1 className="text-[clamp(40px,5vw,64px)] font-black leading-[0.92] tracking-[-0.035em]">
          {state?.done ? 'Kata sandi diperbarui' : 'Buat kata sandi baru'}
        </h1>

        {state?.done ? (
          <Link href="/login" className={primaryButtonClass}>
            Masuk dengan kata sandi baru
          </Link>
        ) : !token ? (
          <p className="text-[17px] leading-relaxed">
            Tautan ini tidak lengkap.{' '}
            <Link href="/lupa-kata-sandi" className="underline underline-offset-4">
              Minta tautan baru
            </Link>
            .
          </p>
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="token" value={token} />
            <PasswordInput id="password" name="password" label="Kata sandi baru" />
            <PasswordInput id="confirm" name="confirm" label="Ulangi kata sandi baru" />
            {state?.error && (
              <p className="text-sm text-down">
                {state.error}{' '}
                <Link href="/lupa-kata-sandi" className="underline underline-offset-4">
                  Minta tautan baru
                </Link>
              </p>
            )}
            <button type="submit" disabled={pending} className={`${primaryButtonClass} disabled:opacity-60`}>
              {pending ? 'Menyimpan…' : 'Simpan kata sandi'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

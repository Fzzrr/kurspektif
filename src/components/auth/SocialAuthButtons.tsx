'use client';

import { signIn } from 'next-auth/react';
import { socialButtonClass } from '../ui/styles';
import { GoogleIcon } from '../ui/icons';

// Tombol login sosial (Google OAuth).
export default function SocialAuthButtons() {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { redirectTo: '/dashboard' })}
      className={`${socialButtonClass} w-full`}
    >
      <GoogleIcon className="h-5 w-5" />
      Lanjutkan dengan Google
    </button>
  );
}

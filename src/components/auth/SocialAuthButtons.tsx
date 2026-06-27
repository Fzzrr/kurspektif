'use client';

import { signIn } from 'next-auth/react';
import { socialButtonClass } from '../ui/styles';
import { GoogleIcon, AppleIcon } from '../ui/icons';

// Tombol login sosial. Google aktif (OAuth); Apple dibiarkan disabled.
export default function SocialAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => signIn('google', { redirectTo: '/dashboard' })}
        className={socialButtonClass}
      >
        <GoogleIcon className="h-5 w-5" />
        Google
      </button>
      <button
        type="button"
        disabled
        title="Coming soon"
        className={`${socialButtonClass} cursor-not-allowed opacity-50`}
      >
        <AppleIcon className="h-5 w-5" />
        Apple
      </button>
    </div>
  );
}

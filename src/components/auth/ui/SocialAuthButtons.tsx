import { socialButtonClass } from './styles';
import { GoogleIcon, AppleIcon } from './icons';

// Tombol login sosial (Google & Apple).
export default function SocialAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" className={socialButtonClass}>
        <GoogleIcon className="h-5 w-5" />
        Google
      </button>
      <button type="button" className={socialButtonClass}>
        <AppleIcon className="h-5 w-5" />
        Apple
      </button>
    </div>
  );
}

import AuthHeader from '../AuthHeader';
import FormField from '../ui/FormField';
import PasswordInput from '../ui/PasswordInput';
import AuthDivider from '../ui/AuthDivider';
import SocialAuthButtons from '../ui/SocialAuthButtons';
import { primaryButtonClass } from '../ui/styles';

export default function LoginForm() {
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
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl">
            Masuk ke <span className="text-accent">akunmu.</span>
          </h2>
          <p className="text-muted">
            Lanjutkan memantau kurs favoritmu dan baca rangkuman terbaru yang
            sudah menunggu.
          </p>
        </div>

        <form className="space-y-3" action="#" method="POST">
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

          <button type="submit" className={primaryButtonClass}>
            Masuk
          </button>
        </form>

        <AuthDivider />
        <SocialAuthButtons />
      </div>
    </div>
  );
}

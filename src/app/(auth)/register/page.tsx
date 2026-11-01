import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Daftar' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { email } = await searchParams;
  // Isian awal dari form di landing; validasi sesungguhnya tetap di action registerUser.
  const prefill = typeof email === 'string' && email.length <= 254 ? email : undefined;
  return (
    <AuthLayout>
      <RegisterForm email={prefill} />
    </AuthLayout>
  );
}
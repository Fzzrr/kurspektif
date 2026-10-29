import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = { title: 'Atur ulang kata sandi — Kurspektif', robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function AturUlangKataSandiPage({ searchParams }: Props) {
  const { token = '' } = await searchParams;
  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/register/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
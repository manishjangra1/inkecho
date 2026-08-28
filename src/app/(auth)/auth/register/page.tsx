import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/next-auth.config';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { ROUTES } from '@/shared/constants/routes';

export const metadata = {
  title: 'Sign Up',
  description: 'Create an InkEcho account to save your drawings and stats.',
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(ROUTES.HOME);
  }

  return (
    <AuthCard
      title="Create Account"
      description="Join InkEcho to save your drawings and stats"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-medium text-brand-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

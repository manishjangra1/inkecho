import Link from 'next/link';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { ROUTES } from '@/shared/constants/routes';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your InkEcho account password.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email to receive recovery instructions"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Remembered your password?{' '}
          <Link
            href={ROUTES.AUTH.LOGIN}
            className="font-medium text-brand-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

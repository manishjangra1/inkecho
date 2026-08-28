import * as React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/next-auth.config';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Skeleton } from '@/shared/ui/skeleton';
import { ROUTES } from '@/shared/constants/routes';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your InkEcho account to access custom drawings and game history.',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(ROUTES.HOME);
  }

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to your InkEcho account"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="font-medium text-brand-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      }
    >
      <React.Suspense
        fallback={
          <div className="space-y-4 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </AuthCard>
  );
}

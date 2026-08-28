'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { toast } from '@/shared/ui/toast';
import { loginSchema, type LoginInput } from '../schemas/login.schema';
import { signIn } from '../lib/auth-client';
import { OAuthButtons } from './OAuthButtons';
import { ROUTES } from '@/shared/constants/routes';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || ROUTES.HOME;
  const authError = searchParams.get('error');

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (authError) {
      if (authError === 'OAuthAccountNotLinked') {
        toast.error(
          'To confirm your identity, please sign in with the original provider or password.'
        );
      } else if (authError === 'CredentialsSignin') {
        toast.error('Invalid email or password.');
      } else {
        toast.error(`Authentication error: ${authError}`);
      }
    }
  }, [authError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: returnUrl,
      });

      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back!');
      router.push(returnUrl);
      router.refresh();
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <OAuthButtons callbackUrl={returnUrl} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
            error={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs text-brand-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox id="rememberMe" defaultChecked {...register('rememberMe')} />
          <Label
            htmlFor="rememberMe"
            className="cursor-pointer text-xs font-normal text-muted-foreground"
          >
            Remember me for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full shadow-glow"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}

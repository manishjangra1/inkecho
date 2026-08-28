'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toast } from '@/shared/ui/toast';

const schema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
});

type FormInput = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: FormInput) => {
    setIsLoading(true);
    // Simulate reset request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent.');
    }, 600);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-game-ready/10 text-game-ready border border-game-ready/20">
          ✓
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Check your email</h3>
          <p className="text-xs text-muted-foreground">
            We have sent password reset instructions to your email address if an account exists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full shadow-glow"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Send Reset Link
      </Button>
    </form>
  );
}

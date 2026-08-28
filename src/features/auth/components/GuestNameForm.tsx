'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { displayNameSchema } from '@/shared/lib/validation/schemas';
import { z } from 'zod';

const schema = z.object({
  displayName: displayNameSchema,
});

type FormInput = z.infer<typeof schema>;

interface GuestNameFormProps {
  readonly initialName?: string;
  readonly onSubmitName: (name: string) => Promise<void>;
  readonly isLoading?: boolean;
  readonly buttonLabel?: string;
}

export function GuestNameForm({
  initialName = '',
  onSubmitName,
  isLoading = false,
  buttonLabel = 'Continue as Guest',
}: GuestNameFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: initialName,
    },
  });

  const onSubmit = async (data: FormInput) => {
    await onSubmitName(data.displayName);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guestName">Choose a Nickname</Label>
        <Input
          id="guestName"
          placeholder="e.g. PixelArtist"
          autoFocus
          {...register('displayName')}
          error={!!errors.displayName}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full shadow-glow"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {buttonLabel}
      </Button>
    </form>
  );
}

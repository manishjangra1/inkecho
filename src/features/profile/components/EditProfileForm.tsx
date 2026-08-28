'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas/update-profile.schema';
import { Loader2, User } from 'lucide-react';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export interface EditProfileFormProps {
  user: UserProfileDto;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (input: UpdateProfileInput) => Promise<unknown>;
  isUpdating: boolean;
}

export function EditProfileForm({
  user,
  isOpen,
  onClose,
  onUpdate,
  isUpdating,
}: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      image: user.image ?? '',
    },
  });

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      await onUpdate({
        name: values.name,
        image: values.image ? values.image : null,
      });
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>Update your public display name and avatar image.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="Your player name"
              {...register('name')}
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Avatar Image URL (optional)</Label>
            <Input
              id="image"
              placeholder="https://example.com/avatar.png"
              {...register('image')}
              className={errors.image ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EditProfileForm } from './EditProfileForm';
import { formatDate } from '@/shared/lib/utils/format-date';
import { ShieldCheck, Calendar, Pencil } from 'lucide-react';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';
import type { UpdateProfileInput } from '../types/profile.types';

export interface ProfileHeaderProps {
  user: UserProfileDto;
  onUpdateProfile: (input: UpdateProfileInput) => Promise<unknown>;
  isUpdating: boolean;
  className?: string;
}

export function ProfileHeader({
  user,
  onUpdateProfile,
  isUpdating,
  className,
}: ProfileHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'P';

  return (
    <div
      className={
        className ||
        'flex flex-col items-center justify-between gap-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:flex-row sm:items-start'
      }
    >
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{user.name}</h2>
            {user.role === 'ADMIN' && (
              <Badge
                variant="default"
                className="gap-1 bg-amber-500 text-[11px] text-white hover:bg-amber-600"
              >
                <ShieldCheck className="h-3 w-3" /> Admin
              </Badge>
            )}
          </div>

          <p className="text-sm font-medium text-muted-foreground">{user.email}</p>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground sm:justify-start">
            <Calendar className="h-3.5 w-3.5" />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditOpen(true)}
        className="gap-1.5 rounded-full border-border/70 text-xs font-semibold hover:bg-muted"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Edit Profile</span>
      </Button>

      <EditProfileForm
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={onUpdateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}

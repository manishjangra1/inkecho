'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { toast } from '@/shared/ui/toast';
import { joinRoomSchema, type JoinRoomInput } from '../schemas/join-room.schema';
import { joinRoomAction } from '../actions/join-room.action';
import { RoomCodeInput } from './RoomCodeInput';
import { useSession } from '@/features/auth/lib/auth-client';

interface JoinRoomFormProps {
  readonly initialCode?: string;
}

export function JoinRoomForm({ initialCode = '' }: JoinRoomFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JoinRoomInput>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: initialCode.toUpperCase(),
      displayName: session?.user?.name || '',
      asSpectator: false,
    },
  });

  const onSubmit = async (data: JoinRoomInput) => {
    try {
      setIsLoading(true);
      const res = await joinRoomAction(data);

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      toast.success(`Joined room ${data.roomCode}!`);
      const targetPath =
        res.data.redirectTo === 'game'
          ? `/room/${data.roomCode}/game`
          : res.data.redirectTo === 'reveal'
            ? `/room/${data.roomCode}/reveal`
            : `/room/${data.roomCode}/lobby`;

      router.push(targetPath);
    } catch {
      toast.error('Failed to join room. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 6-box segmented Room Code */}
      <div className="space-y-3 text-center">
        <Label className="text-sm font-medium">Enter 6-Character Room Code</Label>
        <Controller
          control={control}
          name="roomCode"
          render={({ field }) => (
            <RoomCodeInput
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
            />
          )}
        />
        {errors.roomCode && (
          <p className="text-xs text-destructive">{errors.roomCode.message}</p>
        )}
      </div>

      {/* Nickname for guest */}
      {!session?.user && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Display Name</Label>
          <Input
            id="displayName"
            placeholder="e.g. DoodleKnight"
            {...register('displayName')}
            error={!!errors.displayName}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive">{errors.displayName.message}</p>
          )}
        </div>
      )}

      {/* Spectator checkbox */}
      <div className="flex items-center space-x-2 pt-1">
        <Controller
          control={control}
          name="asSpectator"
          render={({ field }) => (
            <Checkbox
              id="asSpectator"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label
          htmlFor="asSpectator"
          className="text-xs font-normal text-muted-foreground cursor-pointer"
        >
          Join as spectator (watch only)
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full shadow-glow"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Join Room
      </Button>
    </form>
  );
}

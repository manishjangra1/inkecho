'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import { toast } from '@/shared/ui/toast';
import { createRoomSchema, type CreateRoomInput } from '../schemas/create-room.schema';
import { createRoomAction } from '../actions/create-room.action';
import { ROOM_CONFIG } from '@/shared/config/room.config';
import { useSession } from '@/features/auth/lib/auth-client';
import { Lock, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function CreateRoomForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      displayName: session?.user?.name || '',
      visibility: 'PRIVATE',
      settings: {
        maxPlayers: ROOM_CONFIG.DEFAULT_MAX_PLAYERS,
        minPlayers: ROOM_CONFIG.MIN_PLAYERS,
        roundCount: ROOM_CONFIG.DEFAULT_ROUNDS,
        drawTimerSec: 90,
        describeTimerSec: 60,
        allowSpectators: true,
        profanityFilter: false,
      },
    },
  });

  const visibility = watch('visibility');
  const maxPlayers = watch('settings.maxPlayers') ?? 8;
  const roundCount = watch('settings.roundCount') ?? 1;
  const drawTimerSec = watch('settings.drawTimerSec') ?? 90;
  const describeTimerSec = watch('settings.describeTimerSec') ?? 60;

  const onSubmit = async (data: CreateRoomInput) => {
    try {
      setIsLoading(true);
      const res = await createRoomAction(data);

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      toast.success('Room created!');
      router.push(`/room/${res.data.roomCode}/lobby`);
    } catch {
      toast.error('Failed to create room. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 select-none">
      {/* Display Name for guest */}
      {!session?.user && (
        <div className="space-y-1">
          <Label htmlFor="displayName" className="text-xs text-neutral-400">
            Your Display Name
          </Label>
          <Input
            id="displayName"
            placeholder="e.g. CaptainDoodle"
            autoFocus
            {...register('displayName')}
            error={!!errors.displayName}
            className="h-8 text-xs"
          />
          {errors.displayName && (
            <p className="text-[11px] text-[#D9534F]">{errors.displayName.message}</p>
          )}
        </div>
      )}

      {/* Visibility Toggle */}
      <div className="space-y-1">
        <Label className="text-xs text-neutral-400">Room Visibility</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue('visibility', 'PRIVATE')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-[4px] border p-2 text-xs font-medium transition-colors',
              visibility === 'PRIVATE'
                ? 'border-white bg-[#1C1C1C] text-white'
                : 'border-[#232323] bg-[#141414] text-neutral-400 hover:text-white'
            )}
          >
            <Lock className="h-3 w-3" />
            <span>Private (Invite Only)</span>
          </button>
          <button
            type="button"
            onClick={() => setValue('visibility', 'PUBLIC')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-[4px] border p-2 text-xs font-medium transition-colors',
              visibility === 'PUBLIC'
                ? 'border-white bg-[#1C1C1C] text-white'
                : 'border-[#232323] bg-[#141414] text-neutral-400 hover:text-white'
            )}
          >
            <Globe className="h-3 w-3" />
            <span>Public (Browse List)</span>
          </button>
        </div>
      </div>

      {/* Sliders in a 2x2 compact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-[4px] border border-border bg-[#0E0E0E] p-3">
        {/* Max Players */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Max Players</span>
            <span className="font-mono text-[11px] font-bold text-white">
              {maxPlayers} Players
            </span>
          </div>
          <Controller
            control={control}
            name="settings.maxPlayers"
            render={({ field }) => (
              <Slider
                min={3}
                max={12}
                step={1}
                value={[field.value ?? 8]}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            )}
          />
        </div>

        {/* Round Count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Rounds</span>
            <span className="font-mono text-[11px] font-bold text-white">
              {roundCount} Round{roundCount > 1 ? 's' : ''}
            </span>
          </div>
          <Controller
            control={control}
            name="settings.roundCount"
            render={({ field }) => (
              <Slider
                min={1}
                max={3}
                step={1}
                value={[field.value ?? 1]}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            )}
          />
        </div>

        {/* Draw Timer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Drawing Timer</span>
            <span className="font-mono text-[11px] font-bold text-white">
              {drawTimerSec}s
            </span>
          </div>
          <Controller
            control={control}
            name="settings.drawTimerSec"
            render={({ field }) => (
              <Slider
                min={60}
                max={180}
                step={15}
                value={[field.value ?? 90]}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            )}
          />
        </div>

        {/* Describe Timer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">Describe Timer</span>
            <span className="font-mono text-[11px] font-bold text-white">
              {describeTimerSec}s
            </span>
          </div>
          <Controller
            control={control}
            name="settings.describeTimerSec"
            render={({ field }) => (
              <Slider
                min={30}
                max={120}
                step={15}
                value={[field.value ?? 60]}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            )}
          />
        </div>
      </div>

      {/* Switches in 2 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#141414] px-2.5 py-1.5">
          <div className="space-y-0.5">
            <Label htmlFor="allowSpectators" className="cursor-pointer text-xs font-medium text-neutral-300">
              Allow Spectators
            </Label>
            <p className="text-[10px] text-neutral-500">Let late joiners watch</p>
          </div>
          <Controller
            control={control}
            name="settings.allowSpectators"
            render={({ field }) => (
              <Switch
                id="allowSpectators"
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#141414] px-2.5 py-1.5">
          <div className="space-y-0.5">
            <Label htmlFor="profanityFilter" className="cursor-pointer text-xs font-medium text-neutral-300">
              Profanity Filter
            </Label>
            <p className="text-[10px] text-neutral-500">Mask sensitive words</p>
          </div>
          <Controller
            control={control}
            name="settings.profanityFilter"
            render={({ field }) => (
              <Switch
                id="profanityFilter"
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-1">
        <Button
          type="submit"
          className="w-full h-8 text-xs font-semibold bg-white text-black hover:bg-neutral-200 border border-white"
          size="sm"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create Room & Enter Lobby
        </Button>
      </div>
    </form>
  );
}

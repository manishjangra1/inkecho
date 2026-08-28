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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Display Name for guest */}
      {!session?.user && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Your Display Name</Label>
          <Input
            id="displayName"
            placeholder="e.g. CaptainDoodle"
            autoFocus
            {...register('displayName')}
            error={!!errors.displayName}
          />
          {errors.displayName && (
            <p className="text-xs text-destructive">{errors.displayName.message}</p>
          )}
        </div>
      )}

      {/* Visibility Toggle */}
      <div className="space-y-2">
        <Label>Room Visibility</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('visibility', 'PRIVATE')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all',
              visibility === 'PRIVATE'
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary'
                : 'border-border bg-card/40 text-muted-foreground hover:bg-muted/40'
            )}
          >
            <Lock className="h-4 w-4" />
            Private (Invite Only)
          </button>
          <button
            type="button"
            onClick={() => setValue('visibility', 'PUBLIC')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all',
              visibility === 'PUBLIC'
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary'
                : 'border-border bg-card/40 text-muted-foreground hover:bg-muted/40'
            )}
          >
            <Globe className="h-4 w-4" />
            Public (Browse List)
          </button>
        </div>
      </div>

      {/* Sliders for Room Config */}
      <div className="space-y-5 rounded-2xl border border-border/60 bg-muted/20 p-4">
        {/* Max Players */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Max Players</span>
            <span className="rounded bg-brand-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-primary">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Rounds</span>
            <span className="rounded bg-brand-secondary/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-secondary">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Drawing Timer</span>
            <span className="rounded bg-brand-accent/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-accent">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Describe Timer</span>
            <span className="rounded bg-amber-400/10 px-2 py-0.5 font-mono text-xs font-semibold text-amber-400">
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

      {/* Switches */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowSpectators" className="cursor-pointer text-sm font-medium">
              Allow Spectators
            </Label>
            <p className="text-xs text-muted-foreground">Let late joiners watch the game live</p>
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

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profanityFilter" className="cursor-pointer text-sm font-medium">
              Profanity Filter
            </Label>
            <p className="text-xs text-muted-foreground">
              Mask potentially sensitive or NSFW words
            </p>
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

      <Button
        type="submit"
        className="w-full shadow-glow"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Create Room & Enter Lobby
      </Button>
    </form>
  );
}

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import { toast } from '@/shared/ui/toast';
import {
  updateRoomSettingsSchema,
  type UpdateRoomSettingsInput,
} from '../schemas/room-settings.schema';
import { updateRoomSettingsAction } from '../actions/update-room-settings.action';
import type { RoomSnapshotDto } from '../types/room.types';

interface RoomSettingsDrawerProps {
  readonly room: RoomSnapshotDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function RoomSettingsDrawer({ room, open, onOpenChange }: RoomSettingsDrawerProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const { control, handleSubmit, watch } = useForm<UpdateRoomSettingsInput>({
    resolver: zodResolver(updateRoomSettingsSchema),
    defaultValues: {
      roomCode: room.code,
      settings: {
        maxPlayers: room.settings.maxPlayers,
        roundCount: room.settings.roundCount,
        drawTimerSec: room.settings.drawTimerSec,
        describeTimerSec: room.settings.describeTimerSec,
        allowSpectators: room.settings.allowSpectators,
        profanityFilter: room.settings.profanityFilter,
      },
    },
  });

  const maxPlayers = watch('settings.maxPlayers') ?? room.settings.maxPlayers;
  const roundCount = watch('settings.roundCount') ?? room.settings.roundCount;
  const drawTimerSec = watch('settings.drawTimerSec') ?? room.settings.drawTimerSec;
  const describeTimerSec = watch('settings.describeTimerSec') ?? room.settings.describeTimerSec;

  const onSubmit = async (data: UpdateRoomSettingsInput) => {
    try {
      setIsLoading(true);
      const res = await updateRoomSettingsAction(data);

      if (!res.success) {
        toast.error(res.error.message);
        setIsLoading(false);
        return;
      }

      toast.success('Room settings updated!');
      setIsLoading(false);
      onOpenChange(false);
    } catch {
      toast.error('Failed to update settings.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription>
            Adjust rules and timers for room {room.code}. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
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

          {/* Switches */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="drawerAllowSpectators" className="cursor-pointer text-sm font-medium">
                Allow Spectators
              </Label>
              <Controller
                control={control}
                name="settings.allowSpectators"
                render={({ field }) => (
                  <Switch
                    id="drawerAllowSpectators"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="drawerProfanityFilter" className="cursor-pointer text-sm font-medium">
                Profanity Filter
              </Label>
              <Controller
                control={control}
                name="settings.profanityFilter"
                render={({ field }) => (
                  <Switch
                    id="drawerProfanityFilter"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Save Settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

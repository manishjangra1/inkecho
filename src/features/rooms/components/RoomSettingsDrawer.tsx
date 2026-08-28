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
  readonly onDeleteRoom?: () => void;
}

export function RoomSettingsDrawer({ room, open, onOpenChange, onDeleteRoom }: RoomSettingsDrawerProps) {
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
      <DialogContent className="sm:max-w-md bg-[#111111] border border-border p-4 rounded-[4px] select-none">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-bold text-white">Room Settings</DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            Adjust rules and timers for room <span className="font-mono text-white font-bold">{room.code}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
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
                <Label htmlFor="drawerAllowSpectators" className="cursor-pointer text-xs font-medium text-neutral-300">
                  Allow Spectators
                </Label>
                <p className="text-[10px] text-neutral-500">Let late joiners watch</p>
              </div>
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

            <div className="flex items-center justify-between rounded-[4px] border border-border bg-[#141414] px-2.5 py-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="drawerProfanityFilter" className="cursor-pointer text-xs font-medium text-neutral-300">
                  Profanity Filter
                </Label>
                <p className="text-[10px] text-neutral-500">Mask sensitive words</p>
              </div>
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

          <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
            {onDeleteRoom ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDeleteRoom}
                disabled={isLoading}
                className="h-8 text-xs text-[#D9534F] hover:bg-neutral-900 hover:text-[#D9534F] px-2"
              >
                Delete Room
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-8 text-xs font-medium border-[#262626] bg-[#161616] text-neutral-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                disabled={isLoading}
                className="h-8 text-xs font-semibold bg-white text-black hover:bg-neutral-200 border border-white"
              >
                Save Settings
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

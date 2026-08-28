'use client';

import React, { useState } from 'react';
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
import { Switch } from '@/shared/ui/switch';
import { banUserAction } from '../actions/ban-user.action';
import { toast } from 'sonner';
import { Ban, Loader2 } from 'lucide-react';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export interface BanUserDialogProps {
  user: UserProfileDto | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function BanUserDialog({ user, isOpen, onClose, onRefresh }: BanUserDialogProps) {
  const [permanent, setPermanent] = useState(false);
  const [durationHours, setDurationHours] = useState(72);
  const [reason, setReason] = useState('Terms of service violation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await banUserAction({
        userId: user.id,
        permanent,
        durationHours: permanent ? undefined : durationHours,
        reason: reason.trim() || 'Terms of service violation',
      });

      if (!res.success) {
        toast.error(res.error.message || 'Failed to ban user');
      } else {
        toast.success(`User ${user.name} has been banned.`);
        onRefresh();
        onClose();
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5" />
            Ban User: {user.name}
          </DialogTitle>
          <DialogDescription>
            Restrict access for {user.email}. Banned players cannot join rooms or participate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <Label htmlFor="permanent-switch" className="text-sm font-semibold">
                Permanent Ban
              </Label>
              <p className="text-xs text-muted-foreground">Block user account indefinitely</p>
            </div>
            <Switch id="permanent-switch" checked={permanent} onCheckedChange={setPermanent} />
          </div>

          {!permanent && (
            <div className="space-y-2">
              <Label htmlFor="duration">Ban Duration (Hours)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={8760}
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value, 10) || 24)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Ban Reason</Label>
            <textarea
              id="reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for this moderation action..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

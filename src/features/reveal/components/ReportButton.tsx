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
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { toast } from 'sonner';
import { createReportAction } from '@/features/admin/actions/create-report.action';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { RevealStepItem } from '../types/reveal.types';

export interface ReportButtonProps {
  gameId: string;
  step: RevealStepItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportButton({ gameId, step, isOpen, onClose }: ReportButtonProps) {
  const [reason, setReason] = useState<'NSFW' | 'HARASSMENT' | 'SPAM' | 'OTHER'>('NSFW');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!step) return;

    setIsSubmitting(true);
    try {
      const targetType = step.type === 'DRAWING' ? 'DRAWING' : 'DESCRIPTION';
      const res = await createReportAction({
        gameId,
        targetType,
        targetId: step.id,
        reason,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error.message || 'Failed to submit report.');
      } else {
        toast.success('Report submitted. Thank you for keeping InkEcho safe.');
        onClose();
        setNotes('');
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
            <AlertTriangle className="h-5 w-5" />
            Report Inappropriate Content
          </DialogTitle>
          <DialogDescription>
            Flag content that violates community guidelines. Our moderation team reviews all
            reports.
          </DialogDescription>
        </DialogHeader>

        {step && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Reporting: {step.type} by {step.authorDisplayName}
            </p>
            {step.textContent && (
              <p className="mt-1 line-clamp-2 italic">&ldquo;{step.textContent}&rdquo;</p>
            )}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report</Label>
            <Select
              value={reason}
              onValueChange={(val: 'NSFW' | 'HARASSMENT' | 'SPAM' | 'OTHER') => setReason(val)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NSFW">Explicit or Inappropriate Content (NSFW)</SelectItem>
                <SelectItem value="HARASSMENT">Harassment or Hate Speech</SelectItem>
                <SelectItem value="SPAM">Spam or Trolling</SelectItem>
                <SelectItem value="OTHER">Other Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional details (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide any additional context..."
              maxLength={500}
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
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Badge } from '@/shared/ui/badge';
import { formatDate } from '@/shared/lib/utils/format-date';
import { reviewReportAction } from '../actions/review-report.action';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Ban, Loader2 } from 'lucide-react';
import type { ReportItemDto } from '@/infrastructure/db/repositories/report.repository';

export interface ReportDetailPanelProps {
  report: ReportItemDto | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ReportDetailPanel({ report, isOpen, onClose, onRefresh }: ReportDetailPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  if (!report) return null;

  const handleAction = async (
    status: 'REVIEWED' | 'DISMISSED',
    action?: 'DISMISS' | 'BAN_USER'
  ) => {
    setIsSubmitting(true);
    try {
      const res = await reviewReportAction({
        reportId: report.id,
        status,
        action,
        banDurationHours: action === 'BAN_USER' ? 72 : undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error.message || 'Failed to update report status');
      } else {
        toast.success(`Report marked as ${status.toLowerCase()}`);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Report Review #{report.id.slice(-6)}
            </DialogTitle>
            <Badge
              variant={
                report.status === 'PENDING'
                  ? 'destructive'
                  : report.status === 'REVIEWED'
                    ? 'default'
                    : 'secondary'
              }
            >
              {report.status}
            </Badge>
          </div>
          <DialogDescription>
            Submitted on {formatDate(report.createdAt)} by player{' '}
            {report.reporterPlayerId.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div>
              <span className="block text-xs text-muted-foreground">Target Type</span>
              <span className="font-semibold">{report.targetType}</span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">Reason</span>
              <span className="font-semibold text-destructive">{report.reason}</span>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-xs text-muted-foreground">Target ID / Details</span>
            <code className="block break-all rounded bg-muted/60 p-2 font-mono text-xs text-foreground">
              {report.targetId}
            </code>
          </div>

          {report.notes && (
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Reporter Notes</span>
              <p className="rounded-lg border border-border/40 bg-card p-3 text-xs italic text-muted-foreground">
                &ldquo;{report.notes}&rdquo;
              </p>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-foreground">
              Moderator Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review notes..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('DISMISSED', 'DISMISS')}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Dismiss Report
          </Button>

          {report.targetType === 'USER' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction('REVIEWED', 'BAN_USER')}
              disabled={isSubmitting}
              className="w-full gap-1 sm:w-auto"
            >
              <Ban className="h-4 w-4" /> Ban User
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction('REVIEWED')}
            disabled={isSubmitting}
            className="w-full gap-1 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

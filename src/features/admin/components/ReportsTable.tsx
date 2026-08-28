'use client';

import React, { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ReportDetailPanel } from './ReportDetailPanel';
import { formatDate } from '@/shared/lib/utils/format-date';
import { Eye, AlertTriangle } from 'lucide-react';
import type { ReportItemDto } from '@/infrastructure/db/repositories/report.repository';

export interface ReportsTableProps {
  reports: readonly ReportItemDto[];
  onRefresh: () => void;
}

export function ReportsTable({ reports, onRefresh }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReportItemDto | null>(null);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <AlertTriangle className="h-6 w-6 opacity-70" />
        </div>
        <h3 className="text-base font-bold text-foreground">No reports found</h3>
        <p className="max-w-sm text-xs text-muted-foreground">
          All clean! There are no pending reports or moderation flags to review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reports.map((report) => (
                <tr key={report.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold text-foreground">
                    #{report.id.slice(-6)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {report.targetType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-destructive">{report.reason}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        report.status === 'PENDING'
                          ? 'destructive'
                          : report.status === 'REVIEWED'
                            ? 'default'
                            : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                      className="h-8 gap-1 rounded-full text-xs font-semibold hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Review</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReportDetailPanel
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onRefresh={onRefresh}
      />
    </>
  );
}

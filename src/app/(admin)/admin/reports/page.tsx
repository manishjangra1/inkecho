'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportsTable } from '@/features/admin/components/ReportsTable';
import { Button } from '@/shared/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import type { AdminReportsResponse } from '@/features/admin/types/admin.types';

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED'>(
    'PENDING'
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery<{
    success: boolean;
    data: AdminReportsResponse;
  }>({
    queryKey: ['admin-reports', statusFilter, page],
    queryFn: async () => {
      const url =
        statusFilter === 'ALL'
          ? `/api/admin/reports?page=${page}&limit=20`
          : `/api/admin/reports?status=${statusFilter}&page=${page}&limit=20`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load reports');
      }
      return res.json();
    },
  });

  const reports = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Content Moderation
          </h2>
          <p className="text-sm text-muted-foreground">
            Review reported drawings, prompt descriptions, and player harassment flags.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1 self-start rounded-full text-xs font-semibold sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        {(['PENDING', 'ALL', 'REVIEWED', 'DISMISSED'] as const).map((tab) => (
          <Button
            key={tab}
            variant={statusFilter === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setStatusFilter(tab);
              setPage(1);
            }}
            className="rounded-full text-xs font-bold"
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <ReportsTable reports={reports} onRefresh={() => refetch()} />
      )}
    </div>
  );
}

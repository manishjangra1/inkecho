'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsCards } from '@/features/admin/components/AnalyticsCards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Loader2, Activity, Server, Shield } from 'lucide-react';
import type { AdminAnalyticsResponse } from '@/features/admin/types/admin.types';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<{
    success: boolean;
    data: AdminAnalyticsResponse;
  }>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        throw new Error('Failed to load analytics');
      }
      return res.json();
    },
    staleTime: 30000,
  });

  const analytics = data?.data;

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Calculating platform analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Platform Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Realtime metrics and aggregate utilization indicators across the InkEcho ecosystem.
        </p>
      </div>

      <AnalyticsCards analytics={analytics} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Activity className="h-4 w-4 text-primary" />
              Game Activity Metrics
            </CardTitle>
            <CardDescription>Average platform engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Total Sessions Started</span>
              <span className="font-bold text-foreground">{analytics.totalGames}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Rooms Created</span>
              <span className="font-bold text-foreground">{analytics.totalRooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Games Per Room (Avg)</span>
              <span className="font-extrabold text-primary">
                {analytics.totalRooms > 0
                  ? (analytics.totalGames / analytics.totalRooms).toFixed(2)
                  : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Shield className="h-4 w-4 text-emerald-500" />
              Safety & Health
            </CardTitle>
            <CardDescription>Community compliance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Open Reports</span>
              <span className="font-bold text-destructive">{analytics.pendingReports}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground">Moderation Status</span>
              <span className="font-bold text-emerald-500">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Realtime Provider (Ably)</span>
              <span className="flex items-center gap-1 font-bold text-emerald-500">
                <Server className="h-3.5 w-3.5" /> Healthy
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

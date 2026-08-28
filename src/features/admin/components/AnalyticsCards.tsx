'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Users, DoorOpen, Gamepad2, AlertTriangle } from 'lucide-react';
import type { AdminAnalyticsResponse } from '../types/admin.types';

export interface AnalyticsCardsProps {
  analytics: AdminAnalyticsResponse;
}

export function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-border/60 bg-card/60">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Users
            </p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {analytics.totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card/60">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Rooms
            </p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {analytics.totalRooms.toLocaleString()}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            <DoorOpen className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card/60">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Games Played
            </p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {analytics.totalGames.toLocaleString()}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
            <Gamepad2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card/60">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Reports
            </p>
            <p className="mt-1 text-2xl font-extrabold text-destructive">
              {analytics.pendingReports}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

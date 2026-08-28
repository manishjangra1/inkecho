'use client';

import React from 'react';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { StatsGrid } from '@/features/profile/components/StatsGrid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Loader2, TrendingUp, Flame } from 'lucide-react';

export default function ProfileStatsPage() {
  const { stats, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading your stats...</p>
      </div>
    );
  }

  const gamesPlayed = stats?.gamesPlayed ?? 0;
  const gamesWon = stats?.gamesWon ?? 0;
  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Detailed Statistics
        </h2>
        <p className="text-sm text-muted-foreground">
          Track your drawing performance, vote win rates, and gameplay activity over time.
        </p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Win Rate Analysis
            </CardTitle>
            <CardDescription>
              Percentage of finished matches where your story won the room vote.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 text-sm">
              <span className="text-muted-foreground">Total Wins</span>
              <span className="font-bold text-foreground">{gamesWon} matches</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 text-sm">
              <span className="text-muted-foreground">Total Participated</span>
              <span className="font-bold text-foreground">{gamesPlayed} matches</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Win Percentage</span>
              <span className="font-extrabold text-emerald-500">{winRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Flame className="h-4 w-4 text-amber-500" />
              Story Contributions
            </CardTitle>
            <CardDescription>
              Total drawing turns and descriptive prompt contributions submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 text-sm">
              <span className="text-muted-foreground">Turns Submitted</span>
              <span className="font-bold text-foreground">{stats?.turnsSubmitted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 text-sm">
              <span className="text-muted-foreground">Completed Stories</span>
              <span className="font-bold text-foreground">{stats?.chainsCompleted ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg. Turns Per Story</span>
              <span className="font-extrabold text-purple-500">
                {stats?.chainsCompleted
                  ? (stats.turnsSubmitted / stats.chainsCompleted).toFixed(1)
                  : '0'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

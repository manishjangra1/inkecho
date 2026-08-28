'use client';

import React from 'react';
import { StatCard } from './StatCard';
import { Trophy, Gamepad2, CheckCircle2, Percent } from 'lucide-react';
import type { UserStatsDto } from '@/infrastructure/db/repositories/user-stats.repository';

export interface StatsGridProps {
  stats: UserStatsDto | null;
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  const gamesPlayed = stats?.gamesPlayed ?? 0;
  const gamesWon = stats?.gamesWon ?? 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const chainsCompleted = stats?.chainsCompleted ?? 0;
  const turnsSubmitted = stats?.turnsSubmitted ?? 0;

  return (
    <div className={className || 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
      <StatCard
        title="Games Played"
        value={gamesPlayed}
        icon={Gamepad2}
        iconClassName="bg-blue-500/10 text-blue-500 border-blue-500/20"
      />
      <StatCard
        title="Games Won"
        value={gamesWon}
        icon={Trophy}
        iconClassName="bg-amber-500/10 text-amber-500 border-amber-500/20"
      />
      <StatCard
        title="Win Rate"
        value={`${winRate}%`}
        subtitle={`${gamesWon}/${gamesPlayed}`}
        icon={Percent}
        iconClassName="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      />
      <StatCard
        title="Turns Submitted"
        value={turnsSubmitted}
        icon={CheckCircle2}
        subtitle={`${chainsCompleted} stories`}
        iconClassName="bg-purple-500/10 text-purple-500 border-purple-500/20"
      />
    </div>
  );
}

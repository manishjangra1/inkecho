'use client';

import React from 'react';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { AchievementBadge } from '@/features/profile/components/AchievementBadge';
import { Award, Loader2 } from 'lucide-react';

export default function ProfileAchievementsPage() {
  const { achievements, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Achievements</h2>
        <p className="text-sm text-muted-foreground">
          Unlock trophies and special badges by playing games, submitting creative prompts, and
          winning votes.
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Award className="h-6 w-6 opacity-70" />
          </div>
          <h3 className="text-base font-bold text-foreground">No badges unlocked yet</h3>
          <p className="max-w-sm text-xs text-muted-foreground">
            Play more games and complete stories to unlock exclusive InkEcho achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} isUnlocked={true} />
          ))}
        </div>
      )}
    </div>
  );
}

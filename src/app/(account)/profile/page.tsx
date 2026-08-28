'use client';

import React from 'react';
import { useProfile } from '@/features/profile/hooks/use-profile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { StatsGrid } from '@/features/profile/components/StatsGrid';
import { GameHistoryList } from '@/features/profile/components/GameHistoryList';
import { AchievementBadge } from '@/features/profile/components/AchievementBadge';
import { Button } from '@/shared/ui/button';
import { Loader2, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfileOverviewPage() {
  const { profile, stats, achievements, isLoading, isError, updateProfile, isUpdating } =
    useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-border/70 bg-card/40 p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">Sign In Required</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Please sign in to your registered InkEcho account to view your player statistics, match
          history, and achievements.
        </p>
        <Button asChild size="lg" className="gap-2 rounded-full">
          <Link href="/auth/login">
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <ProfileHeader user={profile} onUpdateProfile={updateProfile} isUpdating={isUpdating} />

      {/* Stats Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-foreground">Career Statistics</h3>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-primary">
            <Link href="/profile/stats">
              Detailed Stats <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <StatsGrid stats={stats} />
      </div>

      {/* Achievements Preview */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold tracking-tight text-foreground">
              Recent Achievements ({achievements.length})
            </h3>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs text-primary">
              <Link href="/profile/achievements">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {achievements.slice(0, 2).map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}

      {/* Match History */}
      <div className="space-y-3 pt-2">
        <GameHistoryList />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { formatDate } from '@/shared/lib/utils/format-date';
import { Award, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { UserAchievementDto } from '@/infrastructure/db/repositories/user-stats.repository';

export interface AchievementBadgeProps {
  achievement: UserAchievementDto;
  isUnlocked?: boolean;
}

export function AchievementBadge({ achievement, isUnlocked = true }: AchievementBadgeProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border transition-all duration-200',
        isUnlocked
          ? 'border-primary/40 bg-card/80 shadow-sm'
          : 'border-border/40 bg-muted/20 opacity-60'
      )}
    >
      <CardContent className="flex items-start gap-3.5 p-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-inner',
            isUnlocked
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border/50 bg-muted text-muted-foreground'
          )}
        >
          {isUnlocked ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold tracking-tight text-foreground">{achievement.name}</h4>
            {isUnlocked && (
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] font-bold text-primary"
              >
                <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Unlocked
              </Badge>
            )}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{achievement.description}</p>

          {isUnlocked && achievement.unlockedAt && (
            <p className="pt-1 text-[10px] font-medium text-muted-foreground/70">
              Earned on {formatDate(achievement.unlockedAt)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

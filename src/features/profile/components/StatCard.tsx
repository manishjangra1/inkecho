'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/cn';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md',
        className
      )}
    >
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {value}
            </span>
            {subtitle && (
              <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner',
            iconClassName
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import { GameHistoryList } from '@/features/profile/components/GameHistoryList';

export default function ProfileHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Match History</h2>
        <p className="text-sm text-muted-foreground">
          View all your completed InkEcho drawing and story matches.
        </p>
      </div>

      <GameHistoryList />
    </div>
  );
}

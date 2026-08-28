'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Hash } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent } from '@/shared/ui/card';
import { ROUTES } from '@/shared/constants/routes';
import { ROOM_CONFIG } from '@/shared/config/room.config';

export function QuickJoinCard() {
  const router = useRouter();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== ROOM_CONFIG.ROOM_CODE_LENGTH) {
      setError(`Code must be ${ROOM_CONFIG.ROOM_CODE_LENGTH} characters`);
      return;
    }
    setError(null);
    router.push(ROUTES.JOIN_CODE(cleanCode));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, ROOM_CONFIG.ROOM_CODE_LENGTH);
    setCode(val);
    if (error) setError(null);
  };

  return (
    <Card variant="glass" className="w-full max-w-md p-2">
      <CardContent className="p-4">
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Hash className="h-3.5 w-3.5 text-brand-primary" />
              Quick Join Room
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {code.length}/{ROOM_CONFIG.ROOM_CODE_LENGTH}
            </span>
          </div>

          <div className="flex gap-2">
            <Input
              value={code}
              onChange={handleInputChange}
              placeholder="e.g. ABC123"
              error={!!error}
              className="h-12 bg-background/80 text-center font-mono text-lg uppercase tracking-widest focus:border-brand-primary"
              maxLength={ROOM_CONFIG.ROOM_CODE_LENGTH}
              aria-label="Room code"
            />
            <Button
              type="submit"
              variant="gradient"
              className="h-12 shrink-0 px-5"
              disabled={code.length !== ROOM_CONFIG.ROOM_CODE_LENGTH}
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

import Link from 'next/link';
import { Users, Clock, Flame, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { RoomListItemDto } from '../types/room.types';

interface PublicRoomCardProps {
  readonly room: RoomListItemDto;
}

export function PublicRoomCard({ room }: PublicRoomCardProps) {
  const isAlmostFull = room.playerCount >= room.maxPlayers - 1;

  return (
    <Card
      variant="interactive"
      className="border-border/60 bg-card/60 backdrop-blur-sm p-2 flex flex-col justify-between"
    >
      <CardHeader className="space-y-2 p-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-lg tracking-wider text-brand-primary">
            {room.code}
          </span>
          <Badge variant={isAlmostFull ? 'secondary' : 'default'} className="gap-1">
            <Users className="h-3 w-3" />
            {room.playerCount}/{room.maxPlayers}
          </Badge>
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">
          Host: <span className="text-foreground font-semibold">{room.hostDisplayName}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-2">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-brand-secondary" />
            <span>{room.roundCount} Round{room.roundCount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-brand-accent" />
            <span>{room.drawTimerSec}s / {room.describeTimerSec}s</span>
          </div>
        </div>

        <Link href={`/join/${room.code}`} className="block w-full">
          <Button variant="default" size="sm" className="w-full gap-2 shadow-glow">
            Join Lobby
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

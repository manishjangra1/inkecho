import { cn } from '@/shared/lib/cn';

interface ConnectionBadgeProps {
  readonly status: 'ONLINE' | 'RECONNECTING' | 'OFFLINE';
  readonly showLabel?: boolean;
}

export function ConnectionBadge({ status, showLabel = false }: ConnectionBadgeProps) {
  const dotColor =
    status === 'ONLINE'
      ? 'bg-game-ready shadow-[0_0_8px_rgba(34,197,94,0.6)]'
      : status === 'RECONNECTING'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-muted-foreground';

  const labelText =
    status === 'ONLINE' ? 'Online' : status === 'RECONNECTING' ? 'Reconnecting' : 'Offline';

  return (
    <div className="inline-flex items-center gap-1.5" title={`Connection: ${labelText}`}>
      <span className={cn('h-2 w-2 rounded-full', dotColor)} />
      {showLabel && <span className="text-[11px] text-muted-foreground">{labelText}</span>}
    </div>
  );
}

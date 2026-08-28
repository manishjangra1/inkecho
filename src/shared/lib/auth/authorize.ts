import { ForbiddenError, UnauthorizedError } from '@/shared/lib/errors/app-error';

export type Permission =
  | 'room:join'
  | 'room:settings'
  | 'room:kick'
  | 'room:transfer_host'
  | 'room:start'
  | 'game:submit'
  | 'game:pause'
  | 'profile:read'
  | 'admin:moderate';

export type AuthContext =
  | {
      readonly type: 'registered';
      readonly userId: string;
      readonly playerId?: string;
      readonly roomId?: string;
      readonly displayName: string;
      readonly role?: 'HOST' | 'PLAYER' | 'SPECTATOR';
      readonly userRole: 'USER' | 'ADMIN';
    }
  | {
      readonly type: 'guest';
      readonly guestSessionId: string;
      readonly playerId: string;
      readonly roomId: string;
      readonly displayName: string;
      readonly role: 'HOST' | 'PLAYER' | 'SPECTATOR';
    }
  | {
      readonly type: 'anonymous';
    };

export function authorize(ctx: AuthContext, permission: Permission): void {
  if (ctx.type === 'anonymous') {
    if (permission === 'room:join') return;
    throw new UnauthorizedError('Please join or sign in to continue.');
  }

  // Admin has global moderation access
  if (ctx.type === 'registered' && ctx.userRole === 'ADMIN') {
    return;
  }

  if (permission === 'admin:moderate') {
    throw new ForbiddenError('ADMIN_ONLY', 'Administrator privileges required.');
  }

  if (permission === 'profile:read') {
    if (ctx.type === 'registered') return;
    throw new ForbiddenError('REGISTERED_ONLY', 'Registered user account required.');
  }

  // Room host permissions
  if (
    permission === 'room:settings' ||
    permission === 'room:kick' ||
    permission === 'room:transfer_host' ||
    permission === 'room:start' ||
    permission === 'game:pause'
  ) {
    if (ctx.role === 'HOST') return;
    throw new ForbiddenError('NOT_HOST', 'Only the room host can perform this action.');
  }

  // In-game participation
  if (permission === 'game:submit') {
    if (ctx.role === 'SPECTATOR') {
      throw new ForbiddenError('SPECTATOR_READ_ONLY', 'Spectators cannot submit turns.');
    }
    return;
  }
}

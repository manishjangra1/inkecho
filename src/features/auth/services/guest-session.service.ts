import { guestSessionRepository } from '@/infrastructure/db/repositories/guest-session.repository';
import {
  signGuestToken,
  verifyGuestToken,
  type GuestJwtPayload,
} from '@/infrastructure/auth/guest-jwt';
import { ok, err, type Result } from '@/domain/shared/result';
import { UnauthorizedError, type AppError } from '@/shared/lib/errors/app-error';
import { env } from '@/shared/config/env';

export class GuestSessionService {
  async create(data: {
    roomId: string;
    displayName: string;
    playerId?: string;
    role?: 'HOST' | 'PLAYER' | 'SPECTATOR';
    userId?: string;
  }): Promise<
    Result<
      {
        guestSessionId: string;
        token: string;
        playerId: string;
        expiresAt: Date;
      },
      AppError
    >
  > {
    const playerId = data.playerId ?? crypto.randomUUID();
    const token = crypto.randomUUID();
    const ttlHours = env.GUEST_SESSION_TTL_HOURS || 24;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const sessionResult = await guestSessionRepository.create({
      token,
      displayName: data.displayName,
      playerId,
      roomId: data.roomId,
      expiresAt,
    });

    if (!sessionResult.ok) {
      return err(sessionResult.error);
    }

    const session = sessionResult.value;

    const jwt = await signGuestToken({
      sub: session.id,
      jti: token,
      playerId,
      roomId: data.roomId,
      displayName: data.displayName,
      role: data.role ?? 'PLAYER',
      userId: data.userId,
    });

    return ok({
      guestSessionId: session.id,
      token: jwt,
      playerId,
      expiresAt,
    });
  }

  async verify(token: string, roomId?: string): Promise<Result<GuestJwtPayload, AppError>> {
    const verified = await verifyGuestToken(token);
    if (!verified) {
      return err(new UnauthorizedError('Invalid or expired guest session.'));
    }

    if (roomId && verified.roomId !== roomId) {
      return err(new UnauthorizedError('Session does not belong to this room.'));
    }

    const dbSessionResult = await guestSessionRepository.findById(verified.sub);
    if (!dbSessionResult.ok || !dbSessionResult.value) {
      return err(new UnauthorizedError('Guest session no longer exists.'));
    }

    if (dbSessionResult.value.expiresAt <= new Date()) {
      return err(new UnauthorizedError('Guest session has expired.'));
    }

    return ok(verified);
  }

  async revoke(sessionId: string): Promise<Result<void, AppError>> {
    return guestSessionRepository.delete(sessionId);
  }
}

export const guestSessionService = new GuestSessionService();

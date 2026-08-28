import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, type AppError } from '@/shared/lib/errors/app-error';
import type { GuestSession as PrismaGuestSession } from '@prisma/client';

export class GuestSessionRepository {
  async create(data: {
    token: string;
    displayName: string;
    playerId: string;
    roomId: string;
    expiresAt: Date;
  }): Promise<Result<PrismaGuestSession, AppError>> {
    try {
      const session = await prisma.guestSession.create({
        data,
      });
      return ok(session);
    } catch {
      return err(new NotFoundError('SESSION_CREATE_FAILED', 'Failed to create guest session.'));
    }
  }

  async findByToken(token: string): Promise<Result<PrismaGuestSession | null, AppError>> {
    const session = await prisma.guestSession.findUnique({
      where: { token },
    });
    return ok(session);
  }

  async findById(id: string): Promise<Result<PrismaGuestSession | null, AppError>> {
    const session = await prisma.guestSession.findUnique({
      where: { id },
    });
    return ok(session);
  }

  async updateLastSeen(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.guestSession.update({
        where: { id },
        data: { lastSeenAt: new Date() },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await prisma.guestSession.delete({
        where: { id },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async deleteByPlayer(roomId: string, playerId: string): Promise<Result<void, AppError>> {
    try {
      await prisma.guestSession.deleteMany({
        where: { roomId, playerId },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }
}

export const guestSessionRepository = new GuestSessionRepository();

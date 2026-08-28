import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, ConflictError, type AppError } from '@/shared/lib/errors/app-error';
import { toParticipantDto, type ParticipantDto } from '../mappers/participant.mapper';
import type { ParticipantRole, ConnectionStatus } from '@prisma/client';

export class ParticipantRepository {
  async create(data: {
    roomId: string;
    playerId: string;
    userId?: string;
    guestSessionId?: string;
    displayName: string;
    avatarUrl?: string;
    role: ParticipantRole;
    isReady?: boolean;
  }): Promise<Result<ParticipantDto, AppError>> {
    try {
      const participant = await prisma.roomParticipant.create({
        data: {
          roomId: data.roomId,
          playerId: data.playerId,
          userId: data.userId,
          guestSessionId: data.guestSessionId,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          role: data.role,
          isReady: data.isReady ?? false,
          connectionStatus: 'ONLINE',
        },
      });

      return ok(toParticipantDto(participant));
    } catch {
      return err(new ConflictError('PARTICIPANT_EXISTS', 'Player already in this room.'));
    }
  }

  async findByRoomAndPlayer(
    roomId: string,
    playerId: string
  ): Promise<Result<ParticipantDto | null, AppError>> {
    const participant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_playerId: { roomId, playerId },
      },
    });

    if (!participant || participant.leftAt) {
      return ok(null);
    }

    return ok(toParticipantDto(participant));
  }

  async findByRoomAndUser(
    roomId: string,
    userId: string
  ): Promise<Result<ParticipantDto | null, AppError>> {
    try {
      const participant = await prisma.roomParticipant.findFirst({
        where: {
          roomId,
          userId,
        },
        orderBy: { joinedAt: 'desc' },
      });

      if (!participant) {
        return ok(null);
      }

      return ok(toParticipantDto(participant));
    } catch {
      return ok(null);
    }
  }

  async reactivateParticipant(
    roomId: string,
    playerId: string,
    displayName: string,
    role?: ParticipantRole
  ): Promise<Result<ParticipantDto, AppError>> {
    try {
      const updated = await prisma.roomParticipant.update({
        where: {
          roomId_playerId: { roomId, playerId },
        },
        data: {
          leftAt: null,
          connectionStatus: 'ONLINE',
          displayName,
          ...(role ? { role } : {}),
        },
      });

      return ok(toParticipantDto(updated));
    } catch {
      return err(new NotFoundError('PARTICIPANT_NOT_FOUND', 'Participant not found in room.'));
    }
  }

  async listByRoom(roomId: string): Promise<Result<ParticipantDto[], AppError>> {
    try {
      const participants = await prisma.roomParticipant.findMany({
        where: { roomId },
        orderBy: { joinedAt: 'asc' },
      });

      const active = participants.filter((p) => !p.leftAt);
      return ok(active.map(toParticipantDto));
    } catch {
      return ok([]);
    }
  }

  async updateReady(
    roomId: string,
    playerId: string,
    isReady: boolean
  ): Promise<Result<ParticipantDto, AppError>> {
    try {
      const updated = await prisma.roomParticipant.update({
        where: {
          roomId_playerId: { roomId, playerId },
        },
        data: { isReady },
      });

      return ok(toParticipantDto(updated));
    } catch {
      return err(new NotFoundError('PARTICIPANT_NOT_FOUND', 'Participant not found in room.'));
    }
  }

  async updateRole(
    roomId: string,
    playerId: string,
    role: ParticipantRole
  ): Promise<Result<ParticipantDto, AppError>> {
    try {
      const updated = await prisma.roomParticipant.update({
        where: {
          roomId_playerId: { roomId, playerId },
        },
        data: { role },
      });

      return ok(toParticipantDto(updated));
    } catch {
      return err(new NotFoundError('PARTICIPANT_NOT_FOUND', 'Participant not found in room.'));
    }
  }

  async updateConnectionStatus(
    roomId: string,
    playerId: string,
    status: ConnectionStatus
  ): Promise<Result<void, AppError>> {
    try {
      await prisma.roomParticipant.update({
        where: {
          roomId_playerId: { roomId, playerId },
        },
        data: { connectionStatus: status },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async markLeft(roomId: string, playerId: string): Promise<Result<void, AppError>> {
    try {
      await prisma.roomParticipant.update({
        where: {
          roomId_playerId: { roomId, playerId },
        },
        data: { leftAt: new Date() },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async findByRoomId(roomId: string): Promise<Result<ParticipantDto[], AppError>> {
    return this.listByRoom(roomId);
  }

  async resetAllReady(roomId: string): Promise<Result<void, AppError>> {
    try {
      const participants = await prisma.roomParticipant.findMany({
        where: { roomId },
      });
      const activeIds = participants.filter((p) => !p.leftAt).map((p) => p.id);
      if (activeIds.length > 0) {
        await prisma.roomParticipant.updateMany({
          where: { id: { in: activeIds } },
          data: { isReady: false },
        });
      }
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async countActivePlayers(roomId: string): Promise<number> {
    try {
      const participants = await prisma.roomParticipant.findMany({
        where: {
          roomId,
          role: { in: ['HOST', 'PLAYER'] },
        },
      });
      return participants.filter((p) => !p.leftAt).length;
    } catch {
      return 0;
    }
  }
}

export const participantRepository = new ParticipantRepository();

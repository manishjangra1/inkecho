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

  async listByRoom(roomId: string): Promise<Result<ParticipantDto[], AppError>> {
    const participants = await prisma.roomParticipant.findMany({
      where: {
        roomId,
        leftAt: null,
      },
      orderBy: { joinedAt: 'asc' },
    });

    return ok(participants.map(toParticipantDto));
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
      await prisma.roomParticipant.updateMany({
        where: { roomId, leftAt: null },
        data: { isReady: false },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async countActivePlayers(roomId: string): Promise<number> {
    return prisma.roomParticipant.count({
      where: {
        roomId,
        leftAt: null,
        role: { in: ['HOST', 'PLAYER'] },
      },
    });
  }
}

export const participantRepository = new ParticipantRepository();

import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, ConflictError, type AppError } from '@/shared/lib/errors/app-error';
import {
  toRoomSnapshotDto,
  toRoomListItemDto,
  type RoomSnapshotDto,
  type RoomListItemDto,
} from '../mappers/room.mapper';
import type { RoomVisibility, RoomStatus, RoomCloseReason } from '@prisma/client';
import type { Paginated, PaginationParams } from '@/shared/types/pagination.types';

export interface CreateRoomData {
  readonly code: string;
  readonly hostPlayerId: string;
  readonly visibility: RoomVisibility;
  readonly settings: {
    readonly maxPlayers: number;
    readonly minPlayers: number;
    readonly roundCount: number;
    readonly describeTimerSec: number;
    readonly drawTimerSec: number;
    readonly profanityFilter: boolean;
    readonly allowSpectators: boolean;
  };
}

export class RoomRepository {
  async create(data: CreateRoomData): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const created = await prisma.room.create({
        data: {
          code: data.code,
          hostPlayerId: data.hostPlayerId,
          visibility: data.visibility,
          status: 'LOBBY',
          settings: data.settings,
          participantIds: [data.hostPlayerId],
          spectatorIds: [],
          kickedPlayerIds: [],
        },
        include: {
          participants: true,
        },
      });

      return ok(toRoomSnapshotDto(created));
    } catch {
      return err(new ConflictError('ROOM_CREATE_FAILED', 'Failed to create room.'));
    }
  }

  async findByCode(code: string): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const room = await prisma.room.findFirst({
        where: { code: normalizedCode },
        include: {
          participants: true,
        },
      });

      if (!room || room.deletedAt) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      return ok(toRoomSnapshotDto(room));
    } catch {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }
  }

  async findById(id: string): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const room = await prisma.room.findFirst({
        where: { id },
        include: {
          participants: true,
        },
      });

      if (!room || room.deletedAt) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      return ok(toRoomSnapshotDto(room));
    } catch {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }
  }

  async updateSettings(
    code: string,
    settings: Partial<{
      maxPlayers: number;
      minPlayers: number;
      roundCount: number;
      describeTimerSec: number;
      drawTimerSec: number;
      profanityFilter: boolean;
      allowSpectators: boolean;
    }>
  ): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (!current || current.deletedAt) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      const mergedSettings = {
        ...current.settings,
        ...settings,
      };

      const updated = await prisma.room.update({
        where: { id: current.id },
        data: {
          settings: mergedSettings,
          lastActivityAt: new Date(),
        },
        include: {
          participants: true,
        },
      });

      return ok(toRoomSnapshotDto(updated));
    } catch {
      return err(new NotFoundError('ROOM_UPDATE_FAILED', 'Failed to update room settings.'));
    }
  }

  async updateHost(
    code: string,
    newHostPlayerId: string
  ): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (!current || current.deletedAt) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      const updated = await prisma.room.update({
        where: { id: current.id },
        data: {
          hostPlayerId: newHostPlayerId,
          lastActivityAt: new Date(),
        },
        include: {
          participants: true,
        },
      });

      return ok(toRoomSnapshotDto(updated));
    } catch {
      return err(new NotFoundError('ROOM_UPDATE_FAILED', 'Failed to update room host.'));
    }
  }

  async updateStatus(code: string, status: RoomStatus): Promise<Result<RoomSnapshotDto, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (!current || current.deletedAt) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      const updated = await prisma.room.update({
        where: { id: current.id },
        data: {
          status,
          currentGameId: status === 'LOBBY' ? null : current.currentGameId,
          lastActivityAt: new Date(),
        },
        include: {
          participants: true,
        },
      });

      return ok(toRoomSnapshotDto(updated));
    } catch {
      return err(new NotFoundError('ROOM_UPDATE_FAILED', 'Failed to update room status.'));
    }
  }

  async addKickedPlayer(code: string, playerId: string): Promise<Result<void, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (current && !current.deletedAt) {
        await prisma.room.update({
          where: { id: current.id },
          data: {
            kickedPlayerIds: { push: playerId },
            lastActivityAt: new Date(),
          },
        });
      }
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async listPublic(
    params: PaginationParams = {}
  ): Promise<Result<Paginated<RoomListItemDto>, AppError>> {
    try {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(50, Math.max(1, params.limit || 12));
      const skip = (page - 1) * limit;

      // Trigger background stale rooms cleanup (older than 2 days with 0 players)
      void this.cleanupStaleRooms();

      const allRooms = await prisma.room.findMany({
        where: {
          status: { in: ['LOBBY', 'IN_PROGRESS', 'REVEAL'] },
          visibility: 'PUBLIC',
        },
        include: { participants: true },
        orderBy: { lastActivityAt: 'desc' },
      });

      const activeRooms = allRooms.filter((r) => !r.deletedAt);
      const paginatedRooms = activeRooms.slice(skip, skip + limit);
      const mapped = paginatedRooms.map(toRoomListItemDto);

      return ok({
        items: mapped,
        total: activeRooms.length,
        page,
        limit,
        totalPages: Math.ceil(activeRooms.length / limit) || 1,
      });
    } catch {
      return err(new NotFoundError('ROOMS_FETCH_FAILED', 'Failed to fetch public rooms.'));
    }
  }

  async cleanupStaleRooms(): Promise<number> {
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const staleRooms = await prisma.room.findMany({
        where: {
          OR: [
            { lastActivityAt: { lt: twoDaysAgo } },
            { createdAt: { lt: sevenDaysAgo } },
          ],
          deletedAt: null,
        },
        include: { participants: true },
      });

      const toDeleteIds: string[] = [];
      for (const room of staleRooms) {
        const activePlayers = (room.participants || []).filter((p) => !p.leftAt);
        if (activePlayers.length === 0 || room.createdAt < sevenDaysAgo) {
          toDeleteIds.push(room.id);
        }
      }

      if (toDeleteIds.length > 0) {
        await prisma.room.updateMany({
          where: { id: { in: toDeleteIds } },
          data: {
            status: 'CLOSED',
            deletedAt: new Date(),
            closedAt: new Date(),
            closeReason: 'IDLE_TIMEOUT',
          },
        });
      }

      return toDeleteIds.length;
    } catch {
      return 0;
    }
  }

  async delete(code: string): Promise<Result<void, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (current && !current.deletedAt) {
        await prisma.room.update({
          where: { id: current.id },
          data: {
            status: 'CLOSED',
            deletedAt: new Date(),
            closedAt: new Date(),
            closeReason: 'HOST',
          },
        });
      }
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async close(code: string, reason: RoomCloseReason = 'HOST'): Promise<Result<void, AppError>> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      const current = await prisma.room.findFirst({
        where: { code: normalizedCode },
      });

      if (current && !current.deletedAt) {
        await prisma.room.update({
          where: { id: current.id },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
            closeReason: reason,
          },
        });
      }
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }
}

export const roomRepository = new RoomRepository();

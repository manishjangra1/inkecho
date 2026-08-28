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
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase().trim(), deletedAt: null },
      include: {
        participants: true,
      },
    });

    if (!room) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    return ok(toRoomSnapshotDto(room));
  }

  async findById(id: string): Promise<Result<RoomSnapshotDto, AppError>> {
    const room = await prisma.room.findUnique({
      where: { id, deletedAt: null },
      include: {
        participants: true,
      },
    });

    if (!room) {
      return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
    }

    return ok(toRoomSnapshotDto(room));
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
      const current = await prisma.room.findUnique({
        where: { code: code.toUpperCase().trim(), deletedAt: null },
      });

      if (!current) {
        return err(new NotFoundError('ROOM_NOT_FOUND', 'Room not found.'));
      }

      const mergedSettings = {
        ...current.settings,
        ...settings,
      };

      const updated = await prisma.room.update({
        where: { code: code.toUpperCase().trim() },
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
      const updated = await prisma.room.update({
        where: { code: code.toUpperCase().trim() },
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
      const updated = await prisma.room.update({
        where: { code: code.toUpperCase().trim() },
        data: {
          status,
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
      await prisma.room.update({
        where: { code: code.toUpperCase().trim() },
        data: {
          kickedPlayerIds: { push: playerId },
          lastActivityAt: new Date(),
        },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }

  async listPublic(
    params: PaginationParams = {}
  ): Promise<Result<Paginated<RoomListItemDto>, AppError>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where = {
      status: 'LOBBY' as const,
      visibility: 'PUBLIC' as const,
      deletedAt: null,
    };

    const [total, items] = await Promise.all([
      prisma.room.count({ where }),
      prisma.room.findMany({
        where,
        include: { participants: true },
        orderBy: { lastActivityAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mapped = items.map(toRoomListItemDto);

    return ok({
      items: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }

  async close(code: string, reason: RoomCloseReason = 'HOST'): Promise<Result<void, AppError>> {
    try {
      await prisma.room.update({
        where: { code: code.toUpperCase().trim() },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closeReason: reason,
        },
      });
      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  }
}

export const roomRepository = new RoomRepository();

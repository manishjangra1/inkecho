import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, ConflictError, type AppError } from '@/shared/lib/errors/app-error';

export interface CreateGameHistoryInput {
  readonly gameId: string;
  readonly roomId: string;
  readonly roomCode: string;
  readonly userId: string;
  readonly playerId: string;
  readonly placement?: number | null;
  readonly chainsPlayed: number;
  readonly wonVote?: boolean;
  readonly snapshotUrl?: string | null;
}

export interface GameHistoryItemDto {
  readonly id: string;
  readonly gameId: string;
  readonly roomId: string;
  readonly roomCode: string;
  readonly userId: string;
  readonly playerId: string;
  readonly placement: number | null;
  readonly chainsPlayed: number;
  readonly wonVote: boolean;
  readonly playedAt: string;
  readonly snapshotUrl: string | null;
}

export class GameHistoryRepository {
  async create(data: CreateGameHistoryInput): Promise<Result<GameHistoryItemDto, AppError>> {
    try {
      const created = await prisma.gameHistory.create({
        data: {
          gameId: data.gameId,
          roomId: data.roomId,
          roomCode: data.roomCode,
          userId: data.userId,
          playerId: data.playerId,
          placement: data.placement ?? null,
          chainsPlayed: data.chainsPlayed,
          wonVote: data.wonVote ?? false,
          snapshotUrl: data.snapshotUrl ?? null,
        },
      });

      return ok({
        id: created.id,
        gameId: created.gameId,
        roomId: created.roomId,
        roomCode: created.roomCode,
        userId: created.userId,
        playerId: created.playerId,
        placement: created.placement,
        chainsPlayed: created.chainsPlayed,
        wonVote: created.wonVote,
        playedAt: created.playedAt.toISOString(),
        snapshotUrl: created.snapshotUrl,
      });
    } catch {
      return err(new ConflictError('GAME_HISTORY_CREATE_FAILED', 'Failed to save game history.'));
    }
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Result<{ items: GameHistoryItemDto[]; total: number; totalPages: number }, AppError>> {
    try {
      const skip = (Math.max(1, page) - 1) * limit;
      const [items, total] = await Promise.all([
        prisma.gameHistory.findMany({
          where: { userId },
          orderBy: { playedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.gameHistory.count({
          where: { userId },
        }),
      ]);

      const mapped: GameHistoryItemDto[] = items.map((item) => ({
        id: item.id,
        gameId: item.gameId,
        roomId: item.roomId,
        roomCode: item.roomCode,
        userId: item.userId,
        playerId: item.playerId,
        placement: item.placement,
        chainsPlayed: item.chainsPlayed,
        wonVote: item.wonVote,
        playedAt: item.playedAt.toISOString(),
        snapshotUrl: item.snapshotUrl,
      }));

      return ok({
        items: mapped,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch {
      return err(new NotFoundError('GAME_HISTORY_FETCH_FAILED', 'Failed to fetch game history.'));
    }
  }
}

export const gameHistoryRepository = new GameHistoryRepository();

import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, ConflictError, type AppError } from '@/shared/lib/errors/app-error';
import { toGameEntity, chainsToPrisma, toGameSnapshotDto } from '../mappers/game.mapper';
import type { GameEntity } from '@/domain/game/game-transitions';
import type { GameChainEntity } from '@/domain/game/chain-builder';
import type { GameStatus, TurnPhase } from '@/domain/game/game-state-machine';
import type { Prisma } from '@prisma/client';

export interface CreateGameData {
  readonly roomId: string;
  readonly status: GameStatus;
  readonly version: number;
  readonly currentRoundIndex: number;
  readonly currentChainIndex: number;
  readonly currentTurnIndex: number;
  readonly turnPhase: TurnPhase;
  readonly turnStartedAt: Date;
  readonly turnEndsAt: Date;
  readonly activePlayerId: string;
  readonly chains: readonly GameChainEntity[];
  readonly playerOrder: readonly string[];
}

export class GameRepository {
  async create(data: CreateGameData): Promise<Result<GameEntity, AppError>> {
    try {
      const created = await prisma.game.create({
        data: {
          roomId: data.roomId,
          status: data.status,
          version: data.version,
          currentRoundIndex: data.currentRoundIndex,
          currentChainIndex: data.currentChainIndex,
          currentTurnIndex: data.currentTurnIndex,
          turnPhase: data.turnPhase,
          turnStartedAt: data.turnStartedAt,
          turnEndsAt: data.turnEndsAt,
          activePlayerId: data.activePlayerId,
          chains: chainsToPrisma(data.chains),
          playerOrder: [...data.playerOrder],
          revealChainIndex: 0,
          revealStepIndex: 0,
        },
      });

      return ok(toGameEntity(created));
    } catch {
      return err(new ConflictError('GAME_CREATE_FAILED', 'Failed to create game session.'));
    }
  }

  async findById(id: string): Promise<Result<GameEntity, AppError>> {
    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return err(new NotFoundError('GAME_NOT_FOUND', 'Game session not found.'));
    }

    return ok(toGameEntity(game));
  }

  async findActiveByRoomId(roomId: string): Promise<Result<GameEntity | null, AppError>> {
    const game = await prisma.game.findFirst({
      where: {
        roomId,
        status: { in: ['IN_PROGRESS', 'PAUSED', 'REVEAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!game) {
      return ok(null);
    }

    return ok(toGameEntity(game));
  }

  /**
   * Optimistic concurrency update for game mutations.
   * If version does not match, returns 409 Conflict with the latest snapshot.
   */
  async updateWithVersion(
    id: string,
    expectedVersion: number,
    updateFn: (game: GameEntity) => Partial<Prisma.GameUpdateInput>
  ): Promise<Result<GameEntity, AppError>> {
    const current = await this.findById(id);
    if (!current.ok) {
      return current;
    }

    const patch = updateFn(current.value);

    // Atomically update only if version matches expectedVersion
    const result = await prisma.game.updateMany({
      where: { id, version: expectedVersion },
      data: {
        ...patch,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      const latest = await this.findById(id);
      const snapshot = latest.ok
        ? toGameSnapshotDto(latest.value, current.value.activePlayerId)
        : null;
      return err(
        new ConflictError(
          'VERSION_CONFLICT',
          'Game state has evolved. Resyncing with latest version.',
          {
            snapshot,
          }
        )
      );
    }

    return this.findById(id);
  }

  async update(
    id: string,
    data: Partial<Prisma.GameUpdateInput>
  ): Promise<Result<GameEntity, AppError>> {
    try {
      const updated = await prisma.game.update({
        where: { id },
        data,
      });
      return ok(toGameEntity(updated));
    } catch {
      return err(new NotFoundError('GAME_UPDATE_FAILED', 'Failed to update game.'));
    }
  }
}

export const gameRepository = new GameRepository();

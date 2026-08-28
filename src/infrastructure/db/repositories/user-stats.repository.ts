import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, type AppError } from '@/shared/lib/errors/app-error';

export interface UserStatsDto {
  readonly id: string;
  readonly userId: string;
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly chainsCompleted: number;
  readonly turnsSubmitted: number;
  readonly updatedAt: string;
}

export interface UserAchievementDto {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly iconUrl: string | null;
  readonly unlockedAt: string;
}

export class UserStatsRepository {
  async findByUserId(userId: string): Promise<Result<UserStatsDto, AppError>> {
    try {
      let stats = await prisma.userStats.findUnique({
        where: { userId },
      });

      if (!stats) {
        // Automatically upsert default stats for registered user
        stats = await prisma.userStats.upsert({
          where: { userId },
          create: {
            userId,
            gamesPlayed: 0,
            gamesWon: 0,
            chainsCompleted: 0,
            turnsSubmitted: 0,
          },
          update: {},
        });
      }

      return ok({
        id: stats.id,
        userId: stats.userId,
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        chainsCompleted: stats.chainsCompleted,
        turnsSubmitted: stats.turnsSubmitted,
        updatedAt: stats.updatedAt.toISOString(),
      });
    } catch {
      return err(new NotFoundError('STATS_NOT_FOUND', 'User statistics not found.'));
    }
  }

  async incrementStats(
    userId: string,
    delta: {
      gamesPlayed?: number;
      gamesWon?: number;
      chainsCompleted?: number;
      turnsSubmitted?: number;
    }
  ): Promise<Result<UserStatsDto, AppError>> {
    try {
      const updated = await prisma.userStats.upsert({
        where: { userId },
        create: {
          userId,
          gamesPlayed: delta.gamesPlayed ?? 0,
          gamesWon: delta.gamesWon ?? 0,
          chainsCompleted: delta.chainsCompleted ?? 0,
          turnsSubmitted: delta.turnsSubmitted ?? 0,
        },
        update: {
          gamesPlayed: { increment: delta.gamesPlayed ?? 0 },
          gamesWon: { increment: delta.gamesWon ?? 0 },
          chainsCompleted: { increment: delta.chainsCompleted ?? 0 },
          turnsSubmitted: { increment: delta.turnsSubmitted ?? 0 },
        },
      });

      return ok({
        id: updated.id,
        userId: updated.userId,
        gamesPlayed: updated.gamesPlayed,
        gamesWon: updated.gamesWon,
        chainsCompleted: updated.chainsCompleted,
        turnsSubmitted: updated.turnsSubmitted,
        updatedAt: updated.updatedAt.toISOString(),
      });
    } catch {
      return err(new NotFoundError('STATS_UPDATE_FAILED', 'Failed to update user statistics.'));
    }
  }

  async getAchievements(userId: string): Promise<Result<UserAchievementDto[], AppError>> {
    try {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      });

      return ok(
        userAchievements.map((ua) => ({
          id: ua.achievement.id,
          code: ua.achievement.code,
          name: ua.achievement.name,
          description: ua.achievement.description,
          iconUrl: ua.achievement.iconUrl,
          unlockedAt: ua.unlockedAt.toISOString(),
        }))
      );
    } catch {
      return err(new NotFoundError('ACHIEVEMENTS_FETCH_FAILED', 'Failed to fetch achievements.'));
    }
  }
}

export const userStatsRepository = new UserStatsRepository();

import { userRepository } from '@/infrastructure/db/repositories/user.repository';
import { userStatsRepository } from '@/infrastructure/db/repositories/user-stats.repository';
import { gameHistoryRepository } from '@/infrastructure/db/repositories/game-history.repository';
import { ok, err, type Result } from '@/domain/shared/result';
import { UnauthorizedError, type AppError } from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import type {
  ProfileDetailsResponse,
  UpdateProfileInput,
  GameHistoryResponse,
} from '../types/profile.types';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export class ProfileService {
  async getProfile(ctx: AuthContext): Promise<Result<ProfileDetailsResponse, AppError>> {
    authorize(ctx, 'profile:read');

    if (ctx.type !== 'registered' || !ctx.userId) {
      return err(new UnauthorizedError('Please sign in to view your profile.'));
    }

    const [userRes, statsRes, achievementsRes] = await Promise.all([
      userRepository.findById(ctx.userId),
      userStatsRepository.findByUserId(ctx.userId),
      userStatsRepository.getAchievements(ctx.userId),
    ]);

    if (!userRes.ok) {
      return err(userRes.error);
    }

    const stats = statsRes.ok
      ? statsRes.value
      : {
          id: 'default',
          userId: ctx.userId,
          gamesPlayed: 0,
          gamesWon: 0,
          chainsCompleted: 0,
          turnsSubmitted: 0,
          updatedAt: new Date().toISOString(),
        };

    const achievements = achievementsRes.ok ? achievementsRes.value : [];

    return ok({
      user: userRes.value,
      stats,
      achievements,
    });
  }

  async updateProfile(
    input: UpdateProfileInput,
    ctx: AuthContext
  ): Promise<Result<UserProfileDto, AppError>> {
    authorize(ctx, 'profile:read');

    if (ctx.type !== 'registered' || !ctx.userId) {
      return err(new UnauthorizedError('Please sign in to update your profile.'));
    }

    return userRepository.updateProfile(ctx.userId, {
      name: input.name,
      image: input.image,
    });
  }

  async getGameHistory(
    page: number = 1,
    limit: number = 10,
    ctx: AuthContext
  ): Promise<Result<GameHistoryResponse, AppError>> {
    authorize(ctx, 'profile:read');

    if (ctx.type !== 'registered' || !ctx.userId) {
      return err(new UnauthorizedError('Please sign in to view your game history.'));
    }

    const historyRes = await gameHistoryRepository.findByUserId(ctx.userId, page, limit);
    if (!historyRes.ok) {
      return err(historyRes.error);
    }

    return ok({
      items: historyRes.value.items,
      total: historyRes.value.total,
      totalPages: historyRes.value.totalPages,
      page,
      limit,
    });
  }
}

export const profileService = new ProfileService();

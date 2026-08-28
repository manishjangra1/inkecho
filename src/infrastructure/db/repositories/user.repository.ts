import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, type AppError } from '@/shared/lib/errors/app-error';
import { toUserProfileDto, type UserProfileDto } from '../mappers/user.mapper';

export class UserRepository {
  async findById(id: string): Promise<Result<UserProfileDto, AppError>> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return err(new NotFoundError('USER_NOT_FOUND', 'User profile not found.'));
    }

    return ok(toUserProfileDto(user));
  }

  async findByEmail(email: string): Promise<Result<UserProfileDto | null, AppError>> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim(), deletedAt: null },
    });

    if (!user) {
      return ok(null);
    }

    return ok(toUserProfileDto(user));
  }

  async updateProfile(
    id: string,
    data: { name?: string; image?: string | null }
  ): Promise<Result<UserProfileDto, AppError>> {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data,
      });
      return ok(toUserProfileDto(updated));
    } catch {
      return err(new NotFoundError('USER_NOT_FOUND', 'Failed to update user profile.'));
    }
  }

  async isBanned(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { bannedPermanently: true, bannedUntil: true },
    });

    if (!user) return false;
    if (user.bannedPermanently) return true;
    if (user.bannedUntil && user.bannedUntil > new Date()) return true;

    return false;
  }
}

export const userRepository = new UserRepository();

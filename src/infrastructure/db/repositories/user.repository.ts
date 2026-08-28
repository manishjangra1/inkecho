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

  async findMany(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<Result<{ items: UserProfileDto[]; total: number; totalPages: number }, AppError>> {
    try {
      const where = search
        ? {
            deletedAt: null,
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : { deletedAt: null };

      const skip = (Math.max(1, page) - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return ok({
        items: users.map(toUserProfileDto),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch {
      return err(new NotFoundError('USERS_FETCH_FAILED', 'Failed to fetch users.'));
    }
  }

  async banUser(
    id: string,
    data: { permanent: boolean; durationHours?: number; reason?: string }
  ): Promise<Result<{ bannedUntil: string | null; permanent: boolean }, AppError>> {
    try {
      const bannedUntil =
        !data.permanent && data.durationHours
          ? new Date(Date.now() + data.durationHours * 3600 * 1000)
          : null;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          bannedPermanently: data.permanent,
          bannedUntil,
        },
      });

      return ok({
        bannedUntil: updated.bannedUntil?.toISOString() ?? null,
        permanent: updated.bannedPermanently,
      });
    } catch {
      return err(new NotFoundError('USER_BAN_FAILED', 'Failed to ban user.'));
    }
  }
}

export const userRepository = new UserRepository();

import { reportRepository } from '@/infrastructure/db/repositories/report.repository';
import { userRepository } from '@/infrastructure/db/repositories/user.repository';
import { prisma } from '@/infrastructure/db/prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, type AppError } from '@/shared/lib/errors/app-error';
import { authorize, type AuthContext } from '@/shared/lib/auth/authorize';
import type {
  AdminReportsResponse,
  ReviewReportInput,
  BanUserInput,
  AdminAnalyticsResponse,
  AdminUsersResponse,
} from '../types/admin.types';
import type { ReportItemDto } from '@/infrastructure/db/repositories/report.repository';
import type { ReportStatus } from '@prisma/client';

export class AdminService {
  async getReports(
    status?: ReportStatus,
    page: number = 1,
    limit: number = 20,
    ctx?: AuthContext
  ): Promise<Result<AdminReportsResponse, AppError>> {
    if (ctx) authorize(ctx, 'admin:moderate');

    const res = await reportRepository.findMany(status, page, limit);
    if (!res.ok) {
      return err(res.error);
    }

    return ok({
      items: res.value.items,
      total: res.value.total,
      totalPages: res.value.totalPages,
      page,
      limit,
    });
  }

  async getReportById(
    reportId: string,
    ctx?: AuthContext
  ): Promise<Result<ReportItemDto, AppError>> {
    if (ctx) authorize(ctx, 'admin:moderate');

    return reportRepository.findById(reportId);
  }

  async reviewReport(
    input: ReviewReportInput,
    ctx: AuthContext
  ): Promise<Result<ReportItemDto, AppError>> {
    authorize(ctx, 'admin:moderate');

    const reviewerId = ctx.type === 'registered' ? ctx.userId : 'system-admin';

    const reportRes = await reportRepository.findById(input.reportId);
    if (!reportRes.ok) {
      return err(reportRes.error);
    }

    const report = reportRes.value;

    // If moderator requested a ban on target user
    if (input.action === 'BAN_USER' && report.targetType === 'USER') {
      await userRepository.banUser(report.targetId, {
        permanent: !input.banDurationHours,
        durationHours: input.banDurationHours,
        reason: input.notes || 'Banned via report moderation',
      });
    }

    const updateRes = await reportRepository.updateStatus(input.reportId, input.status, reviewerId);

    return updateRes;
  }

  async banUser(
    input: BanUserInput,
    ctx: AuthContext
  ): Promise<Result<{ bannedUntil: string | null; permanent: boolean }, AppError>> {
    authorize(ctx, 'admin:moderate');

    return userRepository.banUser(input.userId, {
      permanent: input.permanent,
      durationHours: input.durationHours,
      reason: input.reason,
    });
  }

  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    ctx?: AuthContext
  ): Promise<Result<AdminUsersResponse, AppError>> {
    if (ctx) authorize(ctx, 'admin:moderate');

    const res = await userRepository.findMany(page, limit, search);
    if (!res.ok) {
      return err(res.error);
    }

    return ok({
      items: res.value.items,
      total: res.value.total,
      totalPages: res.value.totalPages,
      page,
      limit,
    });
  }

  async getAnalytics(ctx: AuthContext): Promise<Result<AdminAnalyticsResponse, AppError>> {
    authorize(ctx, 'admin:moderate');

    try {
      const [totalUsers, totalRooms, totalGames, pendingReports] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.room.count(),
        prisma.game.count(),
        prisma.report.count({ where: { status: 'PENDING' } }),
      ]);

      return ok({
        totalUsers,
        totalRooms,
        totalGames,
        pendingReports,
      });
    } catch {
      return err(
        new NotFoundError('ANALYTICS_FETCH_FAILED', 'Failed to calculate platform metrics.')
      );
    }
  }
}

export const adminService = new AdminService();

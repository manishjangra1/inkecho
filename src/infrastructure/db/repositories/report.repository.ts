import { prisma } from '../prisma.client';
import { ok, err, type Result } from '@/domain/shared/result';
import { NotFoundError, ConflictError, type AppError } from '@/shared/lib/errors/app-error';
import type { ReportTargetType, ReportReason, ReportStatus } from '@prisma/client';

export interface CreateReportInput {
  readonly reporterPlayerId: string;
  readonly reporterUserId?: string | null;
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  readonly gameId: string;
  readonly reason: ReportReason;
  readonly notes?: string | null;
}

export interface ReportItemDto {
  readonly id: string;
  readonly reporterPlayerId: string;
  readonly reporterUserId: string | null;
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  readonly gameId: string;
  readonly reason: ReportReason;
  readonly notes: string | null;
  readonly status: ReportStatus;
  readonly reviewedById: string | null;
  readonly reviewedAt: string | null;
  readonly createdAt: string;
}

export class ReportRepository {
  async create(data: CreateReportInput): Promise<Result<ReportItemDto, AppError>> {
    try {
      const created = await prisma.report.create({
        data: {
          reporterPlayerId: data.reporterPlayerId,
          reporterUserId: data.reporterUserId ?? null,
          targetType: data.targetType,
          targetId: data.targetId,
          gameId: data.gameId,
          reason: data.reason,
          notes: data.notes ?? null,
          status: 'PENDING',
        },
      });

      return ok({
        id: created.id,
        reporterPlayerId: created.reporterPlayerId,
        reporterUserId: created.reporterUserId,
        targetType: created.targetType,
        targetId: created.targetId,
        gameId: created.gameId,
        reason: created.reason,
        notes: created.notes,
        status: created.status,
        reviewedById: created.reviewedById,
        reviewedAt: created.reviewedAt?.toISOString() ?? null,
        createdAt: created.createdAt.toISOString(),
      });
    } catch {
      return err(new ConflictError('REPORT_CREATE_FAILED', 'Failed to submit report.'));
    }
  }

  async findById(id: string): Promise<Result<ReportItemDto, AppError>> {
    try {
      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        return err(new NotFoundError('REPORT_NOT_FOUND', 'Report not found.'));
      }

      return ok({
        id: report.id,
        reporterPlayerId: report.reporterPlayerId,
        reporterUserId: report.reporterUserId,
        targetType: report.targetType,
        targetId: report.targetId,
        gameId: report.gameId,
        reason: report.reason,
        notes: report.notes,
        status: report.status,
        reviewedById: report.reviewedById,
        reviewedAt: report.reviewedAt?.toISOString() ?? null,
        createdAt: report.createdAt.toISOString(),
      });
    } catch {
      return err(new NotFoundError('REPORT_NOT_FOUND', 'Report not found.'));
    }
  }

  async findMany(
    status?: ReportStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<Result<{ items: ReportItemDto[]; total: number; totalPages: number }, AppError>> {
    try {
      const where = status ? { status } : {};
      const skip = (Math.max(1, page) - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.report.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.report.count({ where }),
      ]);

      const mapped: ReportItemDto[] = items.map((r) => ({
        id: r.id,
        reporterPlayerId: r.reporterPlayerId,
        reporterUserId: r.reporterUserId,
        targetType: r.targetType,
        targetId: r.targetId,
        gameId: r.gameId,
        reason: r.reason,
        notes: r.notes,
        status: r.status,
        reviewedById: r.reviewedById,
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      }));

      return ok({
        items: mapped,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      });
    } catch {
      return err(new NotFoundError('REPORTS_FETCH_FAILED', 'Failed to fetch reports.'));
    }
  }

  async updateStatus(
    id: string,
    status: ReportStatus,
    reviewedById: string
  ): Promise<Result<ReportItemDto, AppError>> {
    try {
      const updated = await prisma.report.update({
        where: { id },
        data: {
          status,
          reviewedById,
          reviewedAt: new Date(),
        },
      });

      return ok({
        id: updated.id,
        reporterPlayerId: updated.reporterPlayerId,
        reporterUserId: updated.reporterUserId,
        targetType: updated.targetType,
        targetId: updated.targetId,
        gameId: updated.gameId,
        reason: updated.reason,
        notes: updated.notes,
        status: updated.status,
        reviewedById: updated.reviewedById,
        reviewedAt: updated.reviewedAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch {
      return err(new NotFoundError('REPORT_UPDATE_FAILED', 'Failed to update report status.'));
    }
  }
}

export const reportRepository = new ReportRepository();

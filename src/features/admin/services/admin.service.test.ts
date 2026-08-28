import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './admin.service';
import { reportRepository } from '@/infrastructure/db/repositories/report.repository';
import { prisma } from '@/infrastructure/db/prisma.client';
import { ok } from '@/domain/shared/result';
import type { AuthContext } from '@/shared/lib/auth/authorize';

vi.mock('@/infrastructure/db/repositories/report.repository');
vi.mock('@/infrastructure/db/repositories/user.repository');
vi.mock('@/infrastructure/db/prisma.client', () => ({
  prisma: {
    user: { count: vi.fn() },
    room: { count: vi.fn() },
    game: { count: vi.fn() },
    report: { count: vi.fn() },
  },
}));

describe('AdminService', () => {
  const adminContext: AuthContext = {
    type: 'registered',
    userId: 'admin-1',
    displayName: 'ModeratorOne',
    userRole: 'ADMIN',
  };

  const userContext: AuthContext = {
    type: 'registered',
    userId: 'user-1',
    displayName: 'PlayerOne',
    userRole: 'USER',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows admin to list moderation reports', async () => {
    vi.mocked(reportRepository.findMany).mockResolvedValue(
      ok({
        items: [
          {
            id: 'rep-1',
            reporterPlayerId: 'p1',
            reporterUserId: null,
            targetType: 'DRAWING',
            targetId: 'drawing-1',
            gameId: 'game-1',
            reason: 'NSFW',
            notes: 'Inappropriate content',
            status: 'PENDING',
            reviewedById: null,
            reviewedAt: null,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        totalPages: 1,
      })
    );

    const res = await adminService.getReports('PENDING', 1, 20, adminContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.items).toHaveLength(1);
      expect(res.value.items[0]?.reason).toBe('NSFW');
    }
  });

  it('allows admin to review a report and mark it reviewed', async () => {
    vi.mocked(reportRepository.findById).mockResolvedValue(
      ok({
        id: 'rep-1',
        reporterPlayerId: 'p1',
        reporterUserId: null,
        targetType: 'DRAWING',
        targetId: 'drawing-1',
        gameId: 'game-1',
        reason: 'NSFW',
        notes: 'Inappropriate content',
        status: 'PENDING',
        reviewedById: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
      })
    );

    vi.mocked(reportRepository.updateStatus).mockResolvedValue(
      ok({
        id: 'rep-1',
        reporterPlayerId: 'p1',
        reporterUserId: null,
        targetType: 'DRAWING',
        targetId: 'drawing-1',
        gameId: 'game-1',
        reason: 'NSFW',
        notes: 'Inappropriate content',
        status: 'REVIEWED',
        reviewedById: 'admin-1',
        reviewedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    );

    const res = await adminService.reviewReport(
      { reportId: 'rep-1', status: 'REVIEWED' },
      adminContext
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.status).toBe('REVIEWED');
    }
    expect(reportRepository.updateStatus).toHaveBeenCalledWith('rep-1', 'REVIEWED', 'admin-1');
  });

  it('rejects regular users from moderation actions', async () => {
    await expect(
      adminService.reviewReport({ reportId: 'rep-1', status: 'REVIEWED' }, userContext)
    ).rejects.toThrow();
  });

  it('calculates platform analytics', async () => {
    vi.mocked(prisma.user.count).mockResolvedValue(150);
    vi.mocked(prisma.room.count).mockResolvedValue(45);
    vi.mocked(prisma.game.count).mockResolvedValue(80);
    vi.mocked(prisma.report.count).mockResolvedValue(3);

    const res = await adminService.getAnalytics(adminContext);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.totalUsers).toBe(150);
      expect(res.value.totalRooms).toBe(45);
      expect(res.value.totalGames).toBe(80);
      expect(res.value.pendingReports).toBe(3);
    }
  });
});

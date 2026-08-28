import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getProfile, PATCH as patchProfile } from './route';
import { GET as getProfileHistory } from './history/route';
import { POST as postReport } from '../reports/route';
import { GET as getAdminReports } from '../admin/reports/route';
import {
  GET as getAdminReportById,
  PATCH as patchAdminReportById,
} from '../admin/reports/[id]/route';
import { POST as banUser } from '../admin/users/[id]/ban/route';
import { POST as cronCleanupRooms } from '../cron/cleanup-rooms/route';
import { POST as cronAdvanceReveal } from '../cron/advance-reveal/route';
import { POST as cronProcessTimers } from '../cron/process-timers/route';
import { profileService } from '@/features/profile/services/profile.service';
import { adminService } from '@/features/admin/services/admin.service';
import { reportRepository } from '@/infrastructure/db/repositories/report.repository';
import { prisma } from '@/infrastructure/db/prisma.client';
import { ok } from '@/domain/shared/result';

vi.mock('@/infrastructure/auth/session', () => ({
  getAuthContext: vi.fn().mockResolvedValue({
    type: 'registered',
    userId: '65e3a7b9c1d2e3f4a5b6c7d7',
    displayName: 'RegisteredAdmin',
    email: 'admin@inkecho.app',
    role: 'ADMIN',
  }),
}));

describe('Profile, Admin, Reports & Cron REST API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/profile returns user profile with stats', async () => {
    vi.spyOn(profileService, 'getProfile').mockResolvedValue(
      ok({
        user: {
          id: '65e3a7b9c1d2e3f4a5b6c7d7',
          name: 'RegisteredAdmin',
          email: 'admin@inkecho.app',
          image: null,
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
        },
        stats: {
          id: 'stats-1',
          userId: '65e3a7b9c1d2e3f4a5b6c7d7',
          gamesPlayed: 10,
          gamesWon: 2,
          chainsCompleted: 25,
          turnsSubmitted: 25,
          updatedAt: new Date().toISOString(),
        },
        achievements: [],
      })
    );

    const res = await getProfile();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.user.email).toBe('admin@inkecho.app');
    expect(json.data.stats.gamesPlayed).toBe(10);
  });

  it('PATCH /api/profile updates user profile', async () => {
    vi.spyOn(profileService, 'updateProfile').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d7',
        name: 'UpdatedName',
        email: 'admin@inkecho.app',
        image: 'https://avatar.url',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      })
    );

    const req = new Request('http://localhost:3000/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'UpdatedName',
        image: 'https://avatar.url',
      }),
    });

    const res = await patchProfile(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe('UpdatedName');
  });

  it('GET /api/profile/history returns paginated game history', async () => {
    vi.spyOn(profileService, 'getGameHistory').mockResolvedValue(
      ok({
        items: [
          {
            id: 'h-1',
            gameId: 'g-1',
            roomId: 'r-1',
            roomCode: 'GAME01',
            userId: '65e3a7b9c1d2e3f4a5b6c7d7',
            playerId: 'p-1',
            placement: 1,
            chainsPlayed: 6,
            wonVote: true,
            playedAt: new Date().toISOString(),
            snapshotUrl: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    );

    const req = new Request('http://localhost:3000/api/profile/history?page=1&limit=10');
    const res = await getProfileHistory(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.items).toHaveLength(1);
  });

  it('POST /api/reports submits report against inappropriate content', async () => {
    vi.spyOn(reportRepository, 'create').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d0',
        gameId: '65e3a7b9c1d2e3f4a5b6c7d8',
        targetType: 'DRAWING',
        targetId: 'drawing-123',
        reason: 'NSFW',
        status: 'PENDING',
        notes: null,
        reporterUserId: '65e3a7b9c1d2e3f4a5b6c7d7',
        reporterPlayerId: 'player-1',
        reviewedById: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
      })
    );

    const req = new Request('http://localhost:3000/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        gameId: '65e3a7b9c1d2e3f4a5b6c7d8',
        targetType: 'DRAWING',
        targetId: 'drawing-123',
        reason: 'NSFW',
      }),
    });

    const res = await postReport(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.reportId).toBe('65e3a7b9c1d2e3f4a5b6c7d0');
  });

  it('GET /api/admin/reports lists reports for moderation', async () => {
    vi.spyOn(adminService, 'getReports').mockResolvedValue(
      ok({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      })
    );

    const req = new Request('http://localhost:3000/api/admin/reports?page=1&limit=20');
    const res = await getAdminReports(req);
    expect(res.status).toBe(200);
  });

  it('GET /api/admin/reports/[id] gets single report detail', async () => {
    vi.spyOn(adminService, 'getReportById').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d0',
        gameId: '65e3a7b9c1d2e3f4a5b6c7d8',
        targetType: 'DESCRIPTION',
        targetId: 't-1',
        reason: 'HARASSMENT',
        status: 'PENDING',
        notes: 'Inappropriate language',
        reporterUserId: '65e3a7b9c1d2e3f4a5b6c7d7',
        reporterPlayerId: 'p-1',
        reviewedById: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
      })
    );

    const req = new Request('http://localhost:3000/api/admin/reports/65e3a7b9c1d2e3f4a5b6c7d0');
    const res = await getAdminReportById(req, {
      params: Promise.resolve({ id: '65e3a7b9c1d2e3f4a5b6c7d0' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.reason).toBe('HARASSMENT');
  });

  it('PATCH /api/admin/reports/[id] reviews report', async () => {
    vi.spyOn(adminService, 'reviewReport').mockResolvedValue(
      ok({
        id: '65e3a7b9c1d2e3f4a5b6c7d0',
        gameId: '65e3a7b9c1d2e3f4a5b6c7d8',
        targetType: 'DESCRIPTION',
        targetId: 't-1',
        reason: 'HARASSMENT',
        status: 'REVIEWED',
        notes: 'Reviewed and dismissed.',
        reporterUserId: '65e3a7b9c1d2e3f4a5b6c7d7',
        reporterPlayerId: 'p-1',
        reviewedById: '65e3a7b9c1d2e3f4a5b6c7d7',
        reviewedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
    );

    const req = new Request('http://localhost:3000/api/admin/reports/65e3a7b9c1d2e3f4a5b6c7d0', {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'REVIEWED',
        action: 'DISMISS',
        notes: 'Reviewed and dismissed.',
      }),
    });

    const res = await patchAdminReportById(req, {
      params: Promise.resolve({ id: '65e3a7b9c1d2e3f4a5b6c7d0' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe('REVIEWED');
  });

  it('POST /api/admin/users/[id]/ban bans user', async () => {
    vi.spyOn(adminService, 'banUser').mockResolvedValue(
      ok({
        bannedUntil: new Date(Date.now() + 86400000).toISOString(),
        permanent: false,
      })
    );

    const req = new Request('http://localhost:3000/api/admin/users/65e3a7b9c1d2e3f4a5b6c7d1/ban', {
      method: 'POST',
      body: JSON.stringify({
        permanent: false,
        durationHours: 24,
        reason: 'Violating community guidelines',
      }),
    });

    const res = await banUser(req, {
      params: Promise.resolve({ id: '65e3a7b9c1d2e3f4a5b6c7d1' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.bannedUntil).toBeDefined();
    expect(json.data.permanent).toBe(false);
  });

  it('POST /api/cron/cleanup-rooms runs cleanup routine', async () => {
    vi.spyOn(prisma.room, 'updateMany').mockResolvedValue({ count: 2 });
    vi.spyOn(prisma.game, 'findMany').mockResolvedValue([]);

    const req = new Request('http://localhost:3000/api/cron/cleanup-rooms', {
      method: 'POST',
    });

    const res = await cronCleanupRooms(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.closedCount).toBe(2);
  });

  it('POST /api/cron/advance-reveal runs reveal progression', async () => {
    vi.spyOn(prisma.game, 'findMany').mockResolvedValue([]);

    const req = new Request('http://localhost:3000/api/cron/advance-reveal', {
      method: 'POST',
    });

    const res = await cronAdvanceReveal(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.advancedRooms).toBe(0);
  });

  it('POST /api/cron/process-timers processes expired timers', async () => {
    vi.spyOn(prisma.game, 'findMany').mockResolvedValue([]);

    const req = new Request('http://localhost:3000/api/cron/process-timers', {
      method: 'POST',
    });

    const res = await cronProcessTimers(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.expiredTurnsProcessed).toBe(0);
  });
});
